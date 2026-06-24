# Sorrel Checkin Ledger

## Verification Sips: Formalizing Diagram Capabilities

### Sip V1: SDD Facts Formalization
- **Intent**: Define verified truths about the viewer's supported features and demo workflow structure.
- **Expected Results**: `facts_defined = 1`, `node_types_recorded = 20`.

### Sip V2: SDD Infrastructure & Execution
- **Intent**: Construct the card-runner system and verify the diagram's visual components via Playwright.
- **Expected Results**: `runner_ready = 1`, `cards_executed > 0`, `numeric_evidence_captured = 1`.

### Sip V3: Traceability Completion
- **Intent**: Update the checkout ledger with runner-produced empirical facts to close the verification loop.
- **Expected Results**: `checkouts_updated = 1`.

## Structural Restrictions

### Pattern Restrictions
- **PR-1**: Connections must have unique identifiers based on source and target node IDs.
- **PR-2**: The `previewPath` element must be removed from the DOM in all `mouseup` scenarios.

### Architectural Restrictions
- **AR-1**: Event listeners for global mouse actions (`mousemove`, `mouseup`) must be attached to the `window` object when active to prevent state desynchronization during boundary crossing.
