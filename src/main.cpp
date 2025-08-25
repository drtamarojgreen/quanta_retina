#include "graph_logic.h"
#include <iostream>

int main() {
    GraphRenderer renderer;

    std::cout << "Cognitive Behavioral Therapy - Graph Visualization\n\n";

    // Load and display all three graphs in sequence
    for (int i = 0; i < 3; ++i) {
        renderer.loadGraph(i);
        renderer.draw();
        renderer.renderToConsole();
        std::cout << "\n--- Press any key to continue to the next graph ---\n";
        std::cin.get();
    }

    return 0;
}
