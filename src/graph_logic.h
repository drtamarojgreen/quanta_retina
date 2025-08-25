#ifndef GRAPH_LOGIC_H
#define GRAPH_LOGIC_H

#include <vector>
#include <string>
#include <utility>

// Define constants for canvas dimensions
const int CANVAS_WIDTH = 80;
const int CANVAS_HEIGHT = 25;

/**
 * @struct Node
 * @brief Represents a node in the graph.
 */
struct Node {
    int id;
    int x, y;         // Position on the console grid
    int size;         // 1 = far, 3 = medium, 5 = close
    std::string label; // Custom label, if any
};

struct Edge {
    int from;
    int to;
};

/**
 * @struct Graph
 * @brief Represents the graph data.
 */
struct Graph {
    std::vector<Node> nodes;
    std::vector<Edge> edges;
    std::vector<std::string> canvas;
};

/**
 * @class GraphRenderer
 * @brief Manages the rendering of a graph on a character-based canvas.
 */
class GraphRenderer {
public:
    GraphRenderer();

    void loadGraph(int version); // Load one of 3 sample graphs
    void draw();
    void clearCanvas();
    void renderToConsole();

    // Getter for testing purposes
    const Graph& getGraph() const { return graph; }

private:
    Graph graph;

    void drawNode(const Node& node);
    void drawEdge(const Node& a, const Node& b);
    void drawLabel(int x, int y, const std::string& text);
    void drawAllLabels();
};

#endif
