# Sorrel Checkins - QuantaGraph Enhancements

## Planned Sips

### Sip 1: Support for `text_box` node type
- **Goal**: Enable borderless, background-less nodes that display only text.
- **Verification**: Node renders without border/background and title is visible.

### Sip 2: Support for `logo` and `background` node types
- **Goal**: Enable nodes that render images from a `src` attribute. `background` should have low z-index.
- **Verification**: Images render correctly within nodes; background image stays behind others.

### Sip 3: Support for `purple_dashed` connection type
- **Goal**: Add a new connection style that is purple and dashed.
- **Verification**: SVG path for connection is purple and dashed.

### Sip 4: Demonstration Workflow Reconstruction
- **Goal**: Load a default workflow that matches the target screenshot.
- **Verification**: Application loads with the specified layout on startup.
