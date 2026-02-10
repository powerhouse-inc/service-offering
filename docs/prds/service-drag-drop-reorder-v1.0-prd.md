# Service Drag-and-Drop Reordering - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: Users cannot reorder services via drag-and-drop in the Service Offering editor (TheMatrix.tsx). The drag operation works visually, but when dropped, services snap back to their original position instead of persisting the new order.
- **Target Users**: Service offering administrators who need to organize and prioritize services within groups
- **Value Proposition**: Intuitive drag-and-drop reordering provides a faster, more natural UX compared to arrow buttons for organizing services

### Feature Overview
- **Core Features**:
  - Fix drag-and-drop to persist service order on drop
  - Remove arrow button reordering UI (user preference)
  - Maintain group-scoped reordering (services stay within their group)
- **Feature Boundaries**:
  - IN SCOPE: Reordering within the same option group
  - OUT OF SCOPE: Dragging services between different groups
- **User Scenarios**:
  - User drags "Invoice management" below "Legal document templates" within the "ert" group
  - On drop, the new order persists and displays correctly

### Detailed Requirements
- **Input/Output**:
  - Input: Drag start on service row, drop on target position within same group
  - Output: Services reordered with updated `displayOrder` values persisted to document state
- **User Interaction**:
  - Drag handle (6-dot grip icon) visible on hover
  - Visual feedback during drag (opacity change, purple border on drop target)
  - Order updates immediately on drop
- **Data Requirements**:
  - `displayOrder` field on Service type (Int, nullable)
  - Services sorted by `displayOrder` (null values treated as 999/end)
- **Edge Cases**:
  - Dropping on same position (no-op)
  - Dropping outside valid drop zone (revert)
  - Services with null displayOrder (sort to end)

## Design Decisions

### Technical Approach
- **Architecture Choice**: HTML5 Drag and Drop API (already implemented)
- **Key Components**:
  - `handleDrop` function in TheMatrix.tsx (needs debugging)
  - `updateService` action creator with `displayOrder` field
  - `groupedServices` useMemo with sorting by displayOrder
- **Data Storage**: `displayOrder` field persisted via Powerhouse document model
- **Interface Design**: Drag handle visible on row hover, visual drop indicator

### Constraints
- **Performance Requirements**: Immediate visual feedback, no perceptible lag
- **Compatibility**: Must work with existing Powerhouse document-model dispatch pattern
- **Security**: N/A (local state management only)
- **Scalability**: Should handle groups with 20+ services

### Risk Assessment
- **Technical Risks**:
  - Drop handler may not be firing dispatch correctly
  - `displayOrder` value of 0 may be treated as falsy (already fixed with `??` operator)
  - Group ID mismatch between drag source and drop target
- **Dependency Risks**: None identified
- **Schedule Risks**: Low - isolated bug fix with clear scope

## Acceptance Criteria

### Functional Acceptance
- [ ] Drag-and-drop reorders services within the same group
- [ ] New order persists after drop (services don't snap back)
- [ ] Arrow buttons removed from UI
- [ ] Services with null displayOrder appear at end of list
- [ ] Drag-and-drop blocked between different groups

### Quality Standards
- [ ] Code Quality: No TypeScript errors, passes ESLint
- [ ] Test Coverage: Manual testing of drag-and-drop in all three group types (Setup, Recurring, Add-ons)
- [ ] Performance Metrics: Order update visible within 100ms of drop
- [ ] Security Review: N/A

### User Acceptance
- [ ] User Experience: Drag handle visible, smooth drag animation, clear drop indicator
- [ ] Documentation: N/A (UI is self-explanatory)
- [ ] Training Materials: N/A

## Execution Phases

### Phase 1: Diagnosis
**Goal**: Identify why handleDrop doesn't persist order
- [ ] Add console.log to handleDrop to verify it fires
- [ ] Check if dispatch is being called with correct displayOrder values
- [ ] Verify groupId matching logic between drag source and drop target
- **Deliverables**: Root cause identified
- **Time**: Investigation

### Phase 2: Fix Implementation
**Goal**: Make drag-and-drop persist order correctly
- [ ] Fix handleDrop logic based on diagnosis
- [ ] Ensure displayOrder updates dispatch correctly
- [ ] Verify groupedServices sorting reflects new order
- **Deliverables**: Working drag-and-drop reordering
- **Time**: Implementation

### Phase 3: UI Cleanup
**Goal**: Remove arrow buttons, polish drag UX
- [ ] Remove arrow button UI from ServiceRowWithMetrics
- [ ] Remove handleReorderService function if no longer needed
- [ ] Clean up related CSS styles
- **Deliverables**: Clean drag-only reorder UI
- **Time**: Cleanup

### Phase 4: Verification
**Goal**: Ensure feature works across all scenarios
- [ ] Test reordering in Setup & Formation groups
- [ ] Test reordering in Recurring Services groups
- [ ] Test reordering in Add-on groups
- [ ] Test with services that have null displayOrder
- [ ] Verify TypeScript and ESLint pass
- **Deliverables**: Verified working feature
- **Time**: Testing

---

**Document Version**: 1.0
**Created**: 2026-01-27
**Clarification Rounds**: 3
**Quality Score**: 92/100
