# Design Document

## Overview

This design addresses the journal editing interface issues by restructuring the layout to ensure proper button positioning and fixing the memory identification logic to prevent editing the wrong memory.

## Architecture

The solution involves two main architectural changes:

1. **Layout Restructuring**: Modify the MemoryPage component to use a flex layout that keeps edit buttons within the page content area
2. **State Management Fix**: Ensure the editing state correctly identifies and tracks the specific memory being edited

## Components and Interfaces

### MemoryPage Component Updates

**Current Issues:**
- Edit buttons are positioned at the bottom of content, potentially overlapping navigation
- The `isEditing` prop relies on `editingMemoryId === memory.id` comparison

**Design Changes:**
1. Restructure the edit mode layout to use a flex container with proper spacing
2. Position save/cancel buttons in a fixed area within the page content
3. Ensure the textarea and form elements fit within available space
4. Add proper memory ID validation in edit handlers

### Layout Structure

```
┌─────────────────────────────────────┐
│ Page Header (Date + Edit Button)    │
├─────────────────────────────────────┤
│                                     │
│ Content Area (Flex Container)       │
│ ├─ Title Input                      │
│ ├─ Image (if present)               │
│ ├─ Story Textarea (flex-1)          │
│ ├─ Location                         │
│ └─ Action Buttons (fixed position)  │
│                                     │
├─────────────────────────────────────┤
│ Navigation Footer (separate)        │
└─────────────────────────────────────┘
```

## Data Models

### Memory Edit State

```javascript
{
  editingMemoryId: string | null,  // ID of memory being edited
  editingPageSide: 'left' | 'right' | null  // Which side of spread is being edited
}
```

## Error Handling

### Memory Identification Errors

1. **Wrong Memory Edited**: Add validation to ensure `onEdit` receives correct memory ID
2. **State Persistence**: Ensure edit state is cleared when navigating between pages
3. **Concurrent Edits**: Prevent editing multiple memories simultaneously

### Layout Issues

1. **Button Overflow**: Use CSS constraints to keep buttons within page boundaries
2. **Content Overflow**: Implement proper scrolling within page content area
3. **Responsive Behavior**: Ensure layout works across different screen sizes

## Testing Strategy

### Unit Tests

1. Test MemoryPage component with edit mode enabled/disabled
2. Test button positioning within page boundaries
3. Test memory ID validation in edit handlers

### Integration Tests

1. Test edit workflow from click to save/cancel
2. Test navigation while in edit mode
3. Test multiple memories on same page spread

### Visual Tests

1. Verify button positioning doesn't overlap navigation
2. Verify edit form fits within page content area
3. Verify smooth transitions between edit and view modes

## Implementation Notes

### CSS Layout Changes

- Use `flex-col` with `flex-1` for textarea to fill available space
- Position action buttons with `mt-auto` to push to bottom of content area
- Add `max-height` constraints to prevent overflow beyond page boundaries

### State Management

- Add validation in `handleEditMemory` to log memory ID being edited
- Clear `editingMemoryId` when navigating between pages
- Add defensive checks to prevent editing wrong memory

### User Experience

- Maintain visual consistency between edit and view modes
- Provide clear visual feedback about which memory is being edited
- Ensure keyboard navigation still works when in edit mode