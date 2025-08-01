#include "graph_logic.h"
#include <iostream>

int main() {
    GraphRenderer renderer;

    std::cout << "Cognitive Behavioral Therapy - Graph Visualization\n\n";

    // Load and display the first graph with CBT labels
    renderer.loadGraph(0);
    renderer.draw();
    renderer.renderToConsole();

    std::cout << "\n--- End of Graph ---\n";

    return 0;
}
