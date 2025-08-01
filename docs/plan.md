# QuantaGraph Implementation Plan

This document outlines a detailed, phased implementation plan for enhancing the QuantaGraph prototype. The plan is derived from the suggestions in `docs/enhancement.md` and aims to strategically evolve the application from a simple prototype into a more robust and feature-rich graph visualization tool.

---

## Phase 1: Core Functionality and Rendering

This phase focuses on improving the core data structures and rendering pipeline to support more advanced features.

### 1.1. Add Explicit Z-axis (Enhancement #1)

*   **Objective:** Transition from an implicit representation of depth (node size) to an explicit `z` coordinate in the data structure.
*   **Key Tasks:**
    *   Modify the `Node` struct in `graph_logic.h` to include a `float z` member.
    *   Update all graph creation code (currently hardcoded) to assign `z` coordinates to each node.
    *   The rendering logic will temporarily need to translate this `z` value back into a discrete size until the perspective projection in Phase 2 is complete.

### 1.2. Implement Double Buffering (Enhancement #43)

*   **Objective:** Eliminate screen flickering during re-renders to enable smooth animations and a more professional user experience.
*   **Key Tasks:**
    *   Create a secondary character buffer (the "back buffer") in memory with the same dimensions as the main display canvas.
    *   Direct all drawing operations to this back buffer.
    *   After all drawing for a frame is complete, copy the contents of the back buffer to the primary screen buffer in a single, atomic operation.
    *   Modify the main render loop to use this new draw-then-swap process.

---

## Phase 2: Advanced Visualization

Building on the new 3D coordinate system, this phase will implement key visual enhancements to create a more compelling and informative representation of the graph.

### 2.1. Implement Perspective Projection (Enhancement #17)

*   **Objective:** Render the graph with a true 3D-to-2D perspective projection, creating a convincing illusion of depth.
*   **Key Tasks:**
    *   Define camera properties, such as field of view (FOV) and camera position.
    *   For each node, apply the perspective transformation to its `(x, y, z)` coordinates to calculate its projected `(screen_x, screen_y)` position.
    *   The projection formula will also determine the node's apparent size on the screen based on its distance from the camera.
    *   Update the `drawNode` function to take a calculated size instead of using the old fixed sizes.

### 2.2. Add Node Subscriptions/Events (Enhancement #4)

*   **Objective:** Create a foundational event system for nodes to enable future interactive features.
*   **Key Tasks:**
    *   Design a simple event/subscriber interface.
    *   Add methods to the `Node` class (or a manager class) to allow other systems to register for and be notified of events like `onSelect` or `onUpdate`.
    *   This is a purely architectural enhancement to set the stage for future work.
    *   **Challenge:** Designing a clean and efficient event handling system without introducing excessive overhead or complexity.

---
