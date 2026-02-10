#!/usr/bin/env node
/**
 * Script to add new document models to the vetra drive
 *
 * This script creates document model documents in the vetra drive by:
 * 1. Reading the existing drive document
 * 2. Adding new document model entries with ADD_FILE operations
 * 3. Creating the document files for each model
 *
 * Usage: node scripts/add-models-to-drive.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const DRIVE_STORAGE = join(projectRoot, ".ph/drive-storage");
const DRIVE_ID = "vetra-e7a9ac25";
const DRIVE_DOC_PATH = join(DRIVE_STORAGE, `document-${DRIVE_ID}.json`);
const MANIFEST_PATH = join(DRIVE_STORAGE, `manifest-${DRIVE_ID}.json`);

// Document models to add
const MODELS_TO_ADD = [
  { name: "Facet", modelPath: "document-models/facet/facet.json" },
  {
    name: "ResourceTemplate",
    modelPath: "document-models/resource-template/resource-template.json",
  },
  {
    name: "ServiceSubscription",
    modelPath: "document-models/service-subscription/service-subscription.json",
  },
  {
    name: "ResourceInstance",
    modelPath: "document-models/resource-instance/resource-instance.json",
  },
];

function generateDocumentId() {
  return randomUUID();
}

function generateOperationId() {
  return randomUUID();
}

function generateActionId() {
  return randomUUID();
}

function hashOperation(operation) {
  // Simple hash for the operation
  const data = JSON.stringify(operation.action);
  return createHash("sha1")
    .update(data)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function createEmptyDocumentModelDocument(id, modelData) {
  const now = new Date().toISOString();

  return {
    clipboard: [],
    header: {
      branch: "main",
      createdAtUtcIso: now,
      documentType: "powerhouse/document-model",
      id: id,
      lastModifiedAtUtcIso: now,
      meta: {},
      name: "",
      revision: { global: 0, local: 0 },
      sig: { nonce: "", publicKey: {} },
      slug: id,
    },
    initialState: {
      auth: {},
      document: {
        hash: { algorithm: "sha1", encoding: "base64" },
        version: "1.0.0",
      },
      global: {
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
      },
      local: {},
    },
    operations: { global: [], local: [] },
    state: {
      auth: {},
      document: {
        hash: { algorithm: "sha1", encoding: "base64" },
        version: "1.0.0",
      },
      global: {
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
      },
      local: {},
    },
  };
}

async function main() {
  console.log("Adding document models to vetra drive...\n");

  // Read the drive document
  if (!existsSync(DRIVE_DOC_PATH)) {
    console.error(`Drive document not found: ${DRIVE_DOC_PATH}`);
    process.exit(1);
  }

  const driveDoc = JSON.parse(readFileSync(DRIVE_DOC_PATH, "utf-8"));
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));

  // Get current state
  const currentNodes = driveDoc.state.global.nodes || [];
  const currentOperations = driveDoc.operations.global || [];
  let operationIndex = currentOperations.length;

  console.log(
    `Current drive has ${currentNodes.length} nodes and ${currentOperations.length} operations\n`,
  );

  // Check which models already exist
  const existingNames = new Set(currentNodes.map((n) => n.name));

  for (const model of MODELS_TO_ADD) {
    if (existingNames.has(model.name)) {
      console.log(`✓ ${model.name} already exists in drive, skipping`);
      continue;
    }

    // Read the model data
    const modelPath = join(projectRoot, model.modelPath);
    if (!existsSync(modelPath)) {
      console.error(`Model file not found: ${modelPath}`);
      continue;
    }

    const modelData = JSON.parse(readFileSync(modelPath, "utf-8"));
    const documentId = generateDocumentId();

    console.log(`Adding ${model.name} with ID: ${documentId}`);

    // Create the document file
    const docContent = createEmptyDocumentModelDocument(documentId, modelData);
    const docPath = join(DRIVE_STORAGE, `document-${documentId}.json`);
    writeFileSync(docPath, JSON.stringify(docContent, null, 2));
    console.log(`  Created document file: document-${documentId}.json`);

    // Add to manifest
    manifest.documentIds.push(documentId);

    // Create ADD_FILE operation for the drive
    const timestamp = new Date().toISOString();
    const newNode = {
      id: documentId,
      name: model.name,
      kind: "file",
      parentFolder: null,
      documentType: "powerhouse/document-model",
    };

    // Add node to state
    driveDoc.state.global.nodes.push(newNode);

    // Create operation
    const operation = {
      action: {
        id: generateActionId(),
        input: {
          documentType: "powerhouse/document-model",
          id: documentId,
          name: model.name,
          parentFolder: null,
        },
        scope: "global",
        timestampUtcMs: timestamp,
        type: "ADD_FILE",
      },
      hash: "", // Will be computed
      id: generateOperationId(),
      index: operationIndex,
      resultingState: JSON.stringify(driveDoc.state.global),
      skip: 0,
      timestampUtcMs: timestamp,
    };

    operation.hash = hashOperation(operation);
    driveDoc.operations.global.push(operation);
    operationIndex++;

    console.log(`  Added ADD_FILE operation to drive`);
  }

  // Update drive document metadata
  driveDoc.header.lastModifiedAtUtcIso = new Date().toISOString();
  driveDoc.header.revision.global = operationIndex;

  // Write updated drive document
  writeFileSync(DRIVE_DOC_PATH, JSON.stringify(driveDoc));
  console.log(`\nUpdated drive document`);

  // Write updated manifest
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest));
  console.log(
    `Updated manifest with ${manifest.documentIds.length} document IDs`,
  );

  console.log("\nDone! The vetra watcher should pick up these changes.");
  console.log("If not, you may need to restart `ph vetra --watch`.");
}

main().catch(console.error);
