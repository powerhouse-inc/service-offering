#!/usr/bin/env node
/**
 * Script to update document model documents in the vetra drive with full data
 * from their corresponding JSON definition files.
 *
 * Usage: node scripts/update-drive-models.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const DRIVE_STORAGE = join(projectRoot, ".ph/drive-storage");

// Map of document IDs to their model JSON paths
const MODELS_TO_UPDATE = [
  {
    documentId: "6eb8d5a4-1c3b-4859-b92c-9cc99987ccdd",
    name: "Facet",
    modelPath: "document-models/facet/facet.json",
  },
  {
    documentId: "9adcb8b6-3e0f-47c3-b744-e5d2f7b1a51d",
    name: "ResourceTemplate",
    modelPath: "document-models/resource-template/resource-template.json",
  },
  {
    documentId: "dfd543ad-2010-4317-a35b-ace16d839323",
    name: "ServiceSubscription",
    modelPath: "document-models/service-subscription/service-subscription.json",
  },
  {
    documentId: "aef17e3f-08fe-4f91-a1d7-81fde317c68c",
    name: "ResourceInstance",
    modelPath: "document-models/resource-instance/resource-instance.json",
  },
];

function main() {
  console.log("Updating document model documents with full data...\n");

  for (const model of MODELS_TO_UPDATE) {
    const docPath = join(DRIVE_STORAGE, `document-${model.documentId}.json`);
    const modelPath = join(projectRoot, model.modelPath);

    if (!existsSync(docPath)) {
      console.error(`Document not found: ${docPath}`);
      continue;
    }

    if (!existsSync(modelPath)) {
      console.error(`Model JSON not found: ${modelPath}`);
      continue;
    }

    console.log(`Updating ${model.name}...`);

    // Read the model JSON (contains the full document model definition)
    const modelData = JSON.parse(readFileSync(modelPath, "utf-8"));

    // Read the existing document
    const doc = JSON.parse(readFileSync(docPath, "utf-8"));

    // Update the document's state.global with the model data
    // The model JSON structure matches what should be in state.global
    doc.state.global = {
      author: modelData.author || { name: "", website: "" },
      description: modelData.description || "",
      extension: modelData.extension || "",
      id: modelData.id || "",
      name: modelData.name || "",
      specifications: modelData.specifications || [
        {
          changeLog: [],
          modules: [],
          state: {
            global: { examples: [], initialValue: "", schema: "" },
            local: { examples: [], initialValue: "", schema: "" },
          },
          version: 1,
        },
      ],
    };

    // Also update initialState to match (for consistency)
    doc.initialState.global = { ...doc.state.global };

    // Update header timestamp
    doc.header.lastModifiedAtUtcIso = new Date().toISOString();

    // Write back
    writeFileSync(docPath, JSON.stringify(doc));
    console.log(
      `  ✓ Updated ${model.name} with ${modelData.specifications?.[0]?.modules?.length || 0} modules`,
    );
  }

  console.log("\nDone! Restart ph vetra --watch if needed.");
}

main();
