/**
 * Re-exports from the shared GraphQL client.
 * @deprecated Import directly from "../../utils/graphql-client.js" instead.
 */
export {
  fetchAllRemoteBuilderProfiles,
  fetchBuilderProfileById,
  fetchRemoteBuilderProfilesByIds,
  setOpHubMemberOnBuilderProfile,
  fetchAllRemoteResourceTemplates,
  type RemoteBuilderProfile,
  type RemoteResourceTemplate,
  type SetOpHubMemberInput,
} from "../../utils/graphql-client.js";
