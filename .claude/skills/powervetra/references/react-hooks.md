# React Hooks API Reference

Complete reference for all React hooks exported by `@powerhousedao/reactor-browser`. These hooks provide the primary interface for building editors, drive-apps, and other UI components in the Powerhouse/Vetra ecosystem.

---

## Key Types

```typescript
type DocumentDispatch<A> = (
  actionOrActions: A | A[] | undefined,
  onErrors?: (errors: Error[]) => void,
  onSuccess?: (result: PHDocument) => void,
) => void;

interface IDocumentCache {
  getDocument(id: string): PHDocument | undefined;
  getDocuments(ids: string[]): PHDocument[];
  getDocumentAsync(id: string): Promise<PHDocument | undefined>;
}
```

---

## Selected Document Hooks

### `useSelectedDocumentId`
Returns the currently selected document ID.
```typescript
function useSelectedDocumentId(): string | undefined;
```

### `useSelectedDocument`
Returns the currently selected document. Throws if no document is selected.
```typescript
function useSelectedDocument(): PHDocument;
```

### `useSelectedDocumentSafe`
Returns the currently selected document or `undefined` (does not throw).
```typescript
function useSelectedDocumentSafe(): PHDocument | undefined;
```

### `useSelectedDocumentOfType`
Returns the selected document cast to a specific type.
```typescript
function useSelectedDocumentOfType<T extends PHDocument>(
  assertFn: (doc: PHDocument) => asserts doc is T,
): T;
```

---

## Document by ID Hooks

### `useDocumentById`
Returns a document by ID using React Suspense.
```typescript
function useDocumentById(id: string | null | undefined): PHDocument | undefined;
```

### `useDocumentsByIds`
Returns multiple documents by IDs.
```typescript
function useDocumentsByIds(ids: string[]): PHDocument[];
```

### `useDocumentOfType`
Returns a document by ID with a type assertion.
```typescript
function useDocumentOfType<T extends PHDocument>(
  id: string | null | undefined,
  assertFn: (doc: PHDocument) => asserts doc is T,
): T | undefined;
```

---

## Document Cache Hooks

### `useDocumentCache`
Returns the document cache object.
```typescript
function useDocumentCache(): IDocumentCache | undefined;
```

### `useDocument`
Returns a document from the cache (uses React Suspense).
```typescript
function useDocument(id: string): PHDocument;
```

### `useDocuments`
Returns multiple documents from the cache (uses React Suspense).
```typescript
function useDocuments(ids: string[]): PHDocument[];
```

### `useGetDocument`
Returns a function that retrieves a document from cache (synchronous).
```typescript
function useGetDocument(): (id: string) => PHDocument | undefined;
```

### `useGetDocuments`
Returns a function that retrieves multiple documents from cache.
```typescript
function useGetDocuments(): (ids: string[]) => PHDocument[];
```

### `useGetDocumentAsync`
Returns a function that retrieves a document asynchronously (non-suspending).
```typescript
function useGetDocumentAsync(): (id: string) => Promise<PHDocument | undefined>;
```

---

## Drive Hooks

### `useDrives`
Returns all available drives.
```typescript
function useDrives(): DriveNode[] | undefined;
```

### `useSelectedDriveId`
Returns the currently selected drive ID.
```typescript
function useSelectedDriveId(): string | undefined;
```

### `useSelectedDrive`
Returns the currently selected drive. Throws if no drive is selected.
```typescript
function useSelectedDrive(): DriveNode;
```

### `useSelectedDriveSafe`
Returns the currently selected drive or `undefined`.
```typescript
function useSelectedDriveSafe(): DriveNode | undefined;
```

### `setSelectedDrive`
Sets the selected drive. Plain function, not a hook.
```typescript
function setSelectedDrive(driveId: string | undefined): void;
```

### `useDriveById`
Returns a specific drive by ID.
```typescript
function useDriveById(id: string | null | undefined): DriveNode | undefined;
```

---

## Node and Folder Hooks

### `useSelectedNode`
Returns the currently selected node (file or folder).
```typescript
function useSelectedNode(): Node | undefined;
```

### `setSelectedNode`
Sets the selected node. Plain function, not a hook.
```typescript
function setSelectedNode(nodeId: string | undefined): void;
```

### `useSelectedFolder`
Returns the currently selected folder, or `undefined` if the selection is not a folder.
```typescript
function useSelectedFolder(): FolderNode | undefined;
```

### `useNodeById`
Returns a node by ID.
```typescript
function useNodeById(id: string | null | undefined): Node | undefined;
```

### `useFolderById`
Returns a folder by ID (undefined if the node is not a folder).
```typescript
function useFolderById(id: string | null | undefined): FolderNode | undefined;
```

### `useNodePathById`
Returns the ancestor chain (path) from root to a specified node.
```typescript
function useNodePathById(id: string | null | undefined): Node[];
```

### `useSelectedNodePath`
Returns the path to the currently selected node.
```typescript
function useSelectedNodePath(): Node[];
```

### `useNodeParentFolderById`
Returns the parent folder of a given node.
```typescript
function useNodeParentFolderById(id: string | null | undefined): FolderNode | undefined;
```

### `useParentFolderForSelectedNode`
Returns the parent folder of the currently selected node.
```typescript
function useParentFolderForSelectedNode(): FolderNode | undefined;
```

---

## Drive Contents Hooks

### `useNodesInSelectedDrive`
Returns all nodes (files and folders) in the selected drive.
```typescript
function useNodesInSelectedDrive(): Node[] | undefined;
```

### `useFileNodesInSelectedDrive`
Returns only file nodes in the selected drive.
```typescript
function useFileNodesInSelectedDrive(): FileNode[] | undefined;
```

### `useFolderNodesInSelectedDrive`
Returns only folder nodes in the selected drive.
```typescript
function useFolderNodesInSelectedDrive(): FolderNode[] | undefined;
```

### `useDocumentsInSelectedDrive`
Returns all documents in the selected drive.
```typescript
function useDocumentsInSelectedDrive(): PHDocument[] | undefined;
```

### `useDocumentTypesInSelectedDrive`
Returns the document types supported by the selected drive.
```typescript
function useDocumentTypesInSelectedDrive(): string[] | undefined;
```

### `useNodesInSelectedDriveOrFolder`
Returns child nodes of the selected folder, or root-level nodes if no folder is selected.
```typescript
function useNodesInSelectedDriveOrFolder(): Node[];
```

---

## Folder Contents Hooks

### `useNodesInSelectedFolder`
```typescript
function useNodesInSelectedFolder(): Node[] | undefined;
```

### `useFileNodesInSelectedFolder`
```typescript
function useFileNodesInSelectedFolder(): FileNode[] | undefined;
```

### `useFolderNodesInSelectedFolder`
```typescript
function useFolderNodesInSelectedFolder(): FolderNode[] | undefined;
```

### `useDocumentsInSelectedFolder`
```typescript
function useDocumentsInSelectedFolder(): PHDocument[] | undefined;
```

---

## Node Operations Hook

### `useNodeActions`
Returns methods for performing file/folder operations.
```typescript
function useNodeActions(): {
  onAddFile: (file: File, parent: Node | undefined) => Promise<void>;
  onAddFolder: (name: string, parent: Node | undefined) => Promise<FolderNode | undefined>;
  onRenameNode: (newName: string, node: Node) => Promise<Node | undefined>;
  onCopyNode: (src: Node, target: Node | undefined) => Promise<void>;
  onMoveNode: (src: Node, target: Node | undefined) => Promise<void>;
  onDuplicateNode: (src: Node) => Promise<void>;
  onAddAndSelectNewFolder: (name: string) => Promise<void>;
  onRenameDriveNodes: (newName: string, nodeId: string) => Promise<void>;
};
```

- Pass `undefined` for `parent`/`target` to operate at root level.

---

## Dispatch Hook

### `useDispatch`
Internal hook providing dispatch for a given document. Prefer using auto-generated hooks instead.
```typescript
function useDispatch<TDocument, TAction>(
  document: TDocument | undefined,
): readonly [
  TDocument | undefined,
  (actionOrActions: TAction[] | TAction | undefined, onErrors?: (errors: Error[]) => void, onSuccess?: (result: PHDocument) => void) => void,
];
```

---

## Modal Hooks

### `usePHModal`
Returns the current modal state.
```typescript
const usePHModal: () => PHModal | undefined;
```

### `showPHModal`
Opens a modal. Plain function, not a hook.
```typescript
function showPHModal(modal: PHModal): void;
```

### `closePHModal`
Closes the currently open modal. Plain function, not a hook.
```typescript
function closePHModal(): void;
```

### `showCreateDocumentModal`
Convenience function to open the create document modal.
```typescript
function showCreateDocumentModal(documentType: string): void;
```

### `showDeleteNodeModal`
Convenience function to open delete confirmation.
```typescript
function showDeleteNodeModal(nodeOrId: Node | string): void;
```

---

## Toast Hooks

### `usePHToast`
Returns the toast notification function.
```typescript
const usePHToast: () => PHToastFn | undefined;
```

**Usage:**
```typescript
const toast = usePHToast();
toast?.("Document saved!", { type: "success" });
toast?.("Failed to save", { type: "error", autoClose: 5000 });
```

---

## Revision History Hooks

### `useRevisionHistoryVisible`
```typescript
const useRevisionHistoryVisible: () => boolean | undefined;
```

### `showRevisionHistory` / `hideRevisionHistory`
Plain functions to toggle the revision history panel.
```typescript
function showRevisionHistory(): void;
function hideRevisionHistory(): void;
```

---

## Timeline Hooks

### `useSelectedTimelineItem`
```typescript
const useSelectedTimelineItem: () => TimelineItem | null | undefined;
```

### `setSelectedTimelineItem`
```typescript
const setSelectedTimelineItem: (value: TimelineItem | null | undefined) => void;
```

### `useSelectedTimelineRevision`
```typescript
const useSelectedTimelineRevision: () => string | number | null | undefined;
```

### `setSelectedTimelineRevision`
```typescript
const setSelectedTimelineRevision: (value: string | number | null | undefined) => void;
```

---

## Document Type Hooks

### `useDocumentTypes`
Returns document types the current editor supports.
```typescript
function useDocumentTypes(): string[] | undefined;
```

### `useSupportedDocumentTypesInReactor`
Returns all document types registered in the reactor.
```typescript
function useSupportedDocumentTypesInReactor(): string[] | undefined;
```

---

## Module Hooks

### `useDocumentModelModules`
Returns all loaded document model modules.
```typescript
function useDocumentModelModules(): VetraDocumentModelModule[] | undefined;
```

### `useDocumentModelModuleById`
```typescript
function useDocumentModelModuleById(id: string | null | undefined): VetraDocumentModelModule | undefined;
```

### `useAllowedDocumentModelModules`
Returns modules filtered by allowed document types config.
```typescript
function useAllowedDocumentModelModules(): VetraDocumentModelModule[] | undefined;
```

### `useEditorModules`
```typescript
function useEditorModules(): VetraEditorModule[] | undefined;
```

### `useEditorModuleById`
```typescript
function useEditorModuleById(id: string | null | undefined): VetraEditorModule | undefined;
```

### `useEditorModulesForDocumentType`
```typescript
function useEditorModulesForDocumentType(documentType: string | null | undefined): VetraEditorModule[] | undefined;
```

### `useDriveEditorModules`
```typescript
function useDriveEditorModules(): VetraEditorModule[] | undefined;
```

### `useDriveEditorModuleById`
```typescript
function useDriveEditorModuleById(id: string | null | undefined): VetraEditorModule | undefined;
```

### `useDefaultDriveEditorModule`
```typescript
function useDefaultDriveEditorModule(): VetraEditorModule | undefined;
```

### `useFallbackEditorModule`
```typescript
function useFallbackEditorModule(documentType: string | null | undefined): VetraEditorModule | undefined;
```

### `useProcessorModules`
```typescript
function useProcessorModules(): VetraProcessorModule[] | undefined;
```

### `useSubgraphModules`
```typescript
function useSubgraphModules(): SubgraphModule[] | undefined;
```

### `useImportScriptModules`
```typescript
function useImportScriptModules(): ImportScriptModule[] | undefined;
```

---

## Vetra Package Hooks

### `useVetraPackages`
Returns all Vetra packages loaded by Connect.
```typescript
const useVetraPackages: () => VetraPackage[] | undefined;
```

### `setVetraPackages`
```typescript
function setVetraPackages(vetraPackages: VetraPackage[] | undefined): void;
```

---

## Switchboard Link Hook

### `useGetSwitchboardLink`
Returns a function to generate an authenticated switchboard URL for a document.
```typescript
function useGetSwitchboardLink(document: PHDocument | undefined): (() => Promise<string>) | null;
```

- Returns `null` for local drives.
- Only works for documents in **remote drives**.

```typescript
const getSwitchboardLink = useGetSwitchboardLink(document);
if (getSwitchboardLink) {
  const url = await getSwitchboardLink();
  window.open(url, "_blank");
}
```

---

## Configuration Hooks

### Drive Editor Config
```typescript
const useIsDragAndDropEnabled: () => boolean | undefined;
const setIsDragAndDropEnabled: (value: boolean | undefined) => void;
function useAllowedDocumentTypes(): string[] | undefined;
const setAllowedDocumentTypes: (value: string[] | undefined) => void;
```

### Document Editor Config
```typescript
const useIsExternalControlsEnabled: () => boolean | undefined;
const setIsExternalControlsEnabled: (value: boolean | undefined) => void;
```

### Batch Config Setters
```typescript
function setPHDriveEditorConfig(config: Partial<PHDriveEditorConfig>): void;
function setPHDocumentEditorConfig(config: Partial<PHDocumentEditorConfig>): void;
function setPHGlobalConfig(config: Partial<PHGlobalConfig>): void;
```

### Auto-Apply Config Hooks
```typescript
function useSetPHDriveEditorConfig(config: Partial<PHDriveEditorConfig>): void;
function useSetPHDocumentEditorConfig(config: Partial<PHDocumentEditorConfig>): void;
```

---

## User and Permissions Hooks

### `useUserPermissions`
```typescript
function useUserPermissions(): {
  isAllowedToCreateDocuments: boolean;
  isAllowedToEditDocuments: boolean;
};
```

### `useDid`
Returns the user's decentralized identifier.
```typescript
const useDid: () => `did:${string}` | undefined;
```

### `useLoginStatus`
```typescript
const useLoginStatus: () => LoginStatus | undefined;
```

---

## Feature Flag Hooks

### `useFeatures`
```typescript
const useFeatures: () => Map<string, boolean> | undefined;
```

### Feature-Specific Hooks
```typescript
function useLegacyReadEnabled(): boolean;   // defaults true
function useLegacyWriteEnabled(): boolean;  // defaults true
function useChannelSyncEnabled(): boolean;  // defaults false
function useInspectorEnabled(): boolean;    // defaults false
```

### Synchronous Helpers (Not Hooks)
For non-React contexts:
```typescript
function isLegacyReadEnabledSync(): boolean;
function isLegacyWriteEnabledSync(): boolean;
function isChannelSyncEnabledSync(): boolean;
function isInspectorEnabledSync(): boolean;
```

---

## File Upload Hook

### `useOnDropFile`
Returns a handler for drag-and-drop file uploads.
```typescript
const useOnDropFile: () => (
  file: File,
  onProgress?: FileUploadProgressCallback,
  resolveConflict?: "replace" | "duplicate",
) => Promise<FileNode | undefined>;
```

---

## Loading Hook

### `useLoading`
```typescript
const useLoading: () => boolean | undefined;
const setLoading: (value: boolean | undefined) => void;
```

---

## Crypto Hooks

### `useConnectCrypto`
```typescript
const useConnectCrypto: () => IConnectCrypto | undefined;
```

### `useSign`
```typescript
function useSign(): ((data: Uint8Array) => Promise<Uint8Array>) | undefined;
```

---

## Reactor and Infrastructure Hooks

Lower-level hooks, typically not needed in editors.

### `useProcessorManager`
```typescript
const useProcessorManager: () => ProcessorManager | undefined;
```

### `useReadModeContext`
```typescript
const useReadModeContext: () => IReadModeContext;
```

---

## Auto-Generated Document Hooks

When you create a document model and add it to a drive, typed hooks are auto-generated in `editors/hooks/`.

### Pattern: `useSelected<ModelName>Document`

```typescript
// Auto-generated for "Todo" document model
export function useSelectedTodoDocument(): [TodoDocument, DocumentDispatch<TodoAction>];
```

**Usage:**
```typescript
import { useSelectedTodoDocument } from "../hooks/useTodoDocument.js";
import { addTodo } from "../../document-models/todo/gen/creators.js";
import { generateId } from "document-model/core";

export default function TodoEditor() {
  const [document, dispatch] = useSelectedTodoDocument();
  dispatch(addTodo({ id: generateId(), title: "New" }));
}
```

---

## Rules for Using Hooks

1. **Call only at the top level**: Never inside loops, conditions, or nested functions
2. **Call only from React function components or custom hooks**
3. **Hook names start with `use`**: e.g., `useDocument`, not `usedocument`
4. **Plain functions vs. hooks**: Functions like `setSelectedDrive`, `closePHModal`, `showRevisionHistory` are NOT hooks -- they can be called from anywhere
5. **Suspense considerations**: `useDocument` and `useDocuments` use React Suspense. Wrap in `<Suspense>` boundaries. Use `useGetDocumentAsync` for non-suspending behavior.
6. **Undefined vs. error**: Most hooks return `undefined` when data is not loaded. Hooks without "Safe" suffix (like `useSelectedDocument`) throw errors when their target is missing.
