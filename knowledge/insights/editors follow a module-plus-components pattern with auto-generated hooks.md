---
summary: Each editor has editor.tsx (main), module.ts (registration), components/ (modular UI), and auto-generated dispatch hooks
type: pattern
created: 2026-03-25
status: active
affects_models: [ServiceOffering, SubscriptionInstance, ResourceTemplate, ResourceInstance]
topics: [[architecture map]], [[ux-flow map]]
---

# editors follow a module-plus-components pattern with auto-generated hooks

All four editors follow a consistent architecture:

```
editors/{name}/
  editor.tsx      — main component, top-level layout
  module.ts       — editor registration with Powerhouse
  components/     — modular UI components
  hooks.ts        — auto-generated from document model (useSelected*Document)
```

The `useSelected*Document()` hook is auto-generated and returns `[document, dispatch]`, providing typed access to the document state and a dispatch function for operations.

Components import action creators from `document-models/{model}/gen/creators.js` and call `dispatch(actionCreator(input))` to modify the document.

This pattern is consistent across all editors but varies in complexity:
- service-offering-editor: ~20+ components, custom CSS, pricing utilities
- subscription-instance-editor: ~10+ components, dual-mode logic
- resource-template/instance-editor: ~5 components each

---

Relevant Insights:
- [[reducers use mutative for direct state mutation with pure synchronous semantics]] — editors dispatch to these reducers
- [[service offering uses a four-tab editor flow for progressive configuration]] — most complex editor implementation

Topics:
- [[architecture map]]
- [[ux-flow map]]
