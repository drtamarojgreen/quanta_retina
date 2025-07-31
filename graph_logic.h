#ifndef GRAPH_LOGIC_H
#define GRAPH_LOGIC_H

#include <vector>
#include <string>
#include <utility>

struct Node {
    int id;
    int x, y;         // Position on the console grid
    int size;         // 1 = far, 3 = medium, 5 = close
};

struct Edge {
    int from;
    int to;
};

struct Graph {
    std::vector<Node> nodes;
    std::vector<Edge> edges;
    std::string canvas[40]; // 40 lines of text canvas
};

class GraphRenderer {
public:
    GraphRenderer();

    void loadGraph(int version); // Load one of 3 sample graphs
    void draw();
    void clearCanvas();
    void renderToConsole();

private:
    Graph graph;

    void drawNode(const Node& node);
    void drawEdge(const Node& a, const Node& b);
};

#endif
