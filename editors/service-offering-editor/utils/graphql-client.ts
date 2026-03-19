/**
 * GraphQL client utility for fetching remote builder profiles from Switchboard.
 * This is used as a fallback when local drives don't have the builder profile documents.
 */

function getGraphQLUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:4001/graphql";
  }

  const baseURI = window.document.baseURI;

  if (baseURI.includes("localhost")) {
    return "http://localhost:4001/graphql";
  }

  // Determine the appropriate Switchboard URL based on environment
  if (baseURI.includes("-dev.")) {
    return "https://switchboard-dev.powerhouse.xyz/graphql";
  }

  if (baseURI.includes("-staging.")) {
    return "https://switchboard-staging.powerhouse.xyz/graphql";
  }

  // Production environment
  return "https://switchboard.powerhouse.xyz/graphql";
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { silent?: boolean },
): Promise<T | null> {
  try {
    const response = await fetch(getGraphQLUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      if (!options?.silent) {
        console.warn(
          "[graphql-client] Request failed:",
          response.status,
          response.statusText,
        );
      }
      return null;
    }

    const result = (await response.json()) as GraphQLResponse<T>;

    // Return data even if there are errors - partial data might still be useful
    // Only treat as full failure if there's no data at all
    if (result.errors?.length && !result.data) {
      if (!options?.silent) {
        console.warn("[graphql-client] GraphQL errors:", result.errors);
      }
      return null;
    }

    return result.data ?? null;
  } catch (error) {
    // Silently fail - this is a fallback mechanism
    if (!options?.silent) {
      console.warn("[graphql-client] Request error:", error);
    }
    return null;
  }
}

// Query to find all builder profile documents
const FIND_BUILDER_PROFILES_QUERY = `
  query FindBuilderProfiles {
    BuilderProfile_findDocuments(search: {}) {
      items {
        id
        name
        state {
          global {
            id
            name
            slug
            icon
            description
          }
        }
      }
      totalCount
    }
  }
`;

// Query to get a single builder profile by identifier
const GET_BUILDER_PROFILE_QUERY = `
  query GetBuilderProfile($identifier: String!) {
    BuilderProfile_document(identifier: $identifier) {
      document {
        id
        name
        state {
          global {
            id
            name
            slug
            icon
            description
          }
        }
      }
    }
  }
`;

export interface RemoteBuilderProfile {
  id: string;
  state: {
    name: string | null;
    slug: string | null;
    icon: string | null;
    description: string | null;
  };
}

interface FindBuilderProfilesItem {
  id: string;
  name: string;
  state: {
    global: {
      id: string | null;
      name: string | null;
      slug: string | null;
      icon: string | null;
      description: string | null;
    };
  };
}

interface FindBuilderProfilesResponse {
  BuilderProfile_findDocuments: {
    items: FindBuilderProfilesItem[];
    totalCount: number;
  };
}

interface SingleBuilderProfileResponse {
  BuilderProfile_document: {
    document: FindBuilderProfilesItem;
  } | null;
}

function toRemoteProfile(item: FindBuilderProfilesItem): RemoteBuilderProfile {
  return {
    id: item.id,
    state: {
      name: item.state.global.name,
      slug: item.state.global.slug,
      icon: item.state.global.icon,
      description: item.state.global.description,
    },
  };
}

/**
 * Fetches a single builder profile by document ID
 */
export async function fetchBuilderProfileById(
  docId: string,
): Promise<RemoteBuilderProfile | null> {
  const data = await graphqlRequest<SingleBuilderProfileResponse>(
    GET_BUILDER_PROFILE_QUERY,
    { identifier: docId },
  );
  const item = data?.BuilderProfile_document?.document;
  return item ? toRemoteProfile(item) : null;
}

/**
 * Fetches all builder profiles using BuilderProfile_findDocuments.
 */
export async function fetchAllRemoteBuilderProfiles(): Promise<
  RemoteBuilderProfile[]
> {
  try {
    const data = await graphqlRequest<FindBuilderProfilesResponse>(
      FIND_BUILDER_PROFILES_QUERY,
    );
    const items = data?.BuilderProfile_findDocuments?.items ?? [];
    return items.map(toRemoteProfile);
  } catch {
    return [];
  }
}

/**
 * Fetches multiple builder profiles by their IDs.
 */
export async function fetchRemoteBuilderProfilesByIds(
  phids: string[],
): Promise<Map<string, RemoteBuilderProfile>> {
  if (!phids.length) {
    return new Map();
  }

  try {
    const allProfiles = await fetchAllRemoteBuilderProfiles();

    const result = new Map<string, RemoteBuilderProfile>();
    for (const profile of allProfiles) {
      if (phids.includes(profile.id)) {
        result.set(profile.id, profile);
      }
    }

    // For any missing profiles, try direct fetch
    const missingPhids = phids.filter((phid) => !result.has(phid));
    if (missingPhids.length > 0) {
      const directFetches = missingPhids.map(async (phid) => {
        const profile = await fetchBuilderProfileById(phid);
        if (profile) {
          result.set(phid, profile);
        }
      });
      await Promise.all(directFetches);
    }

    return result;
  } catch {
    return new Map();
  }
}

// Mutation to set operational hub member on a builder profile
const SET_OP_HUB_MEMBER_MUTATION = `
  mutation BuilderProfile_setOpHubMember($docId: PHID!, $input: BuilderProfile_SetOpHubMemberInput!) {
    BuilderProfile_setOpHubMember(docId: $docId, input: $input)
  }
`;

export interface SetOpHubMemberInput {
  name: string | null;
  phid: string | null;
}

interface SetOpHubMemberResponse {
  BuilderProfile_setOpHubMember: boolean;
}

/**
 * Sets the operational hub member on a builder profile document.
 *
 * @param docId - The builder profile document ID (PHID)
 * @param input - The operational hub member data (name and phid of the op hub)
 * @returns true if successful, false otherwise
 */
export async function setOpHubMemberOnBuilderProfile(
  docId: string,
  input: SetOpHubMemberInput,
): Promise<boolean> {
  try {
    const data = await graphqlRequest<SetOpHubMemberResponse>(
      SET_OP_HUB_MEMBER_MUTATION,
      { docId, input },
    );
    return data?.BuilderProfile_setOpHubMember ?? false;
  } catch (error) {
    console.warn("[graphql-client] Failed to set op hub member:", error);
    return false;
  }
}
