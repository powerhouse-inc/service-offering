import type { UpgradeManifest } from "document-model";
import { facetUpgradeManifest } from "./facet/upgrades/upgrade-manifest.js";
import { resourceInstanceUpgradeManifest } from "./resource-instance/upgrades/upgrade-manifest.js";
import { resourceTemplateUpgradeManifest } from "./resource-template/upgrades/upgrade-manifest.js";
import { serviceOfferingUpgradeManifest } from "./service-offering/upgrades/upgrade-manifest.js";

export const upgradeManifests: UpgradeManifest<readonly number[]>[] = [
  facetUpgradeManifest,
  resourceInstanceUpgradeManifest,
  resourceTemplateUpgradeManifest,
  serviceOfferingUpgradeManifest,
];
