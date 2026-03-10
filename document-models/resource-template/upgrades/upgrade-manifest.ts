import type { UpgradeManifest } from "document-model";
import { latestVersion, supportedVersions } from "./versions.js";

export const resourceTemplateUpgradeManifest: UpgradeManifest<
  typeof supportedVersions
> = {
  documentType: "powerhouse/resource-template",
  latestVersion,
  supportedVersions,
  upgrades: {},
};
