import type { UpgradeManifest } from "document-model";
import { latestVersion, supportedVersions } from "./versions.js";

export const invoiceUpgradeManifest: UpgradeManifest<typeof supportedVersions> =
  {
    documentType: "powerhouse/invoice",
    latestVersion,
    supportedVersions,
    upgrades: {},
  };
