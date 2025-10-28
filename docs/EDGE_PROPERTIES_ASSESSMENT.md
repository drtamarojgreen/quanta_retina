# Effort Assessment: Adding Properties to Edges

This document outlines the effort required to add properties (e.g., labels, weights) to the edges in the workflow designer.

## Summary

The overall effort is estimated to be **medium to high**. While the data modeling and serialization are straightforward, the UI implementation for both editing and displaying the properties on the SVG canvas presents significant complexity.

## Breakdown of Tasks and Effort

### 1. Data Model Changes
- **Task:** Modify the `connections` array in `editor.js` to include a `properties` object within each connection object.
- **Effort:** **Low**. This is a simple change to the data structure.

### 2. UI for Editing Properties
- **Task:**
    - Create a new HTML `<template>` for the edge properties form.
    - Modify the `updatePropertiesPanel` function to detect when a connection (an SVG `<path>`) is selected.
    - Populate the form with the selected edge's properties and save changes back to the `connections` data array.
- **Effort:** **Medium**. This requires new HTML and significant logic changes in the JavaScript to handle a new type of selectable element.

### 3. Displaying Properties on Edges
- **Task:**
    - Render the edge properties (e.g., a label) directly on the canvas.
    - This involves creating and managing SVG `<text>` and `<textPath>` elements for each connection.
    - The `updateConnectionPath` function would need to be updated to correctly position this text along the curve of the edge.
    - The text position must be recalculated and updated every time a connected node is moved.
- **Effort:** **High**. This is the most complex part of the feature. Positioning text along a dynamic Bézier curve and ensuring it remains readable is a non-trivial geometric problem.

### 4. Serialization (Export/Import)
- **Task:**
    - The `exportWorkflow` function will likely handle the new `properties` field automatically as it serializes the entire `connections` array.
    - The `loadWorkflow` function would also need to be checked to ensure it can handle the new data.
- **Effort:** **Low**. The existing implementation should already support this with minimal to no changes.
