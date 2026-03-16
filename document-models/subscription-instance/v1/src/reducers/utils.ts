import type {
  SubscriptionInstanceState,
  Service,
} from "../../gen/schema/types.js";

/**
 * Finds a service by ID across both top-level standalone services
 * and services nested inside service groups.
 */
export function findService(
  state: SubscriptionInstanceState,
  serviceId: string,
): Service | undefined {
  const standalone = state.services.find((s) => s.id === serviceId);
  if (standalone) return standalone;
  for (const group of state.serviceGroups) {
    const grouped = group.services.find((s) => s.id === serviceId);
    if (grouped) return grouped;
  }
  return undefined;
}
