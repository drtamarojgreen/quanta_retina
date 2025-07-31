#include "graph_logic.h"
#include <iostream>
#include <cmath>
#include <algorithm>

GraphRenderer::GraphRenderer() {
    clearCanvas();
}

void GraphRenderer::clearCanvas() {
    for (auto& line : graph.canvas)
        line = std::string(80, ' ');
}

void GraphRenderer::renderToConsole() {
    for (const auto& line : graph.canvas)
        std::cout << line << std::endl;
}

void GraphRenderer::drawNode(const Node& node) {
    int radius = node.size / 2;
    for (int dy = -radius; dy <= radius; ++dy) {
        for (int dx = -radius; dx <= radius; ++dx) {
            int px = node.x + dx;
            int py = node.y + dy;
            if (px >= 0 && px < 80 && py >= 0 && py < 40)
                graph.canvas[py][px] = 'X';
        }
    }
}

void GraphRenderer::drawEdge(const Node& a, const Node& b) {
    int x1 = a.x, y1 = a.y;
    int x2 = b.x, y2 = b.y;

    int dx = x2 - x1;
    int dy = y2 - y1;
    int steps = std::max(std::abs(dx), std::abs(dy));

    for (int i = 0; i <= steps; ++i) {
        int x = x1 + dx * i / steps;
        int y = y1 + dy * i / steps;
        if (x >= 0 && x < 80 && y >= 0 && y < 40) {
            graph.canvas[y][x] = (dy * dx >= 0) ? '\\' : '/';
        }
    }
}

void GraphRenderer::loadGraph(int version) {
    graph.nodes.clear();
    graph.edges.clear();

    if (version == 0) { // 4-node graph
        graph.nodes = {
            {0, 20, 10, 5}, {1, 60, 10, 5},
            {2, 20, 30, 5}, {3, 60, 30, 5}
        };
        graph.edges = {
            {0, 1}, {1, 3}, {3, 2}, {2, 0}
        };
    }
    else if (version == 1) { // 8-node graph
        graph.nodes = {
            {0, 10, 5, 3}, {1, 30, 5, 3}, {2, 50, 5, 3}, {3, 70, 5, 3},
            {4, 10, 30, 3}, {5, 30, 30, 3}, {6, 50, 30, 3}, {7, 70, 30, 3}
        };
        for (int i = 0; i < 4; ++i)
            graph.edges.push_back({i, i+4});
        graph.edges.push_back({0,1}); graph.edges.push_back({1,2});
        graph.edges.push_back({2,3}); graph.edges.push_back({4,5});
        graph.edges.push_back({5,6}); graph.edges.push_back({6,7});
    }
    else { // 16-node graph
        for (int i = 0; i < 4; ++i)
            for (int j = 0; j < 4; ++j)
                graph.nodes.push_back({i*4+j, 10 + j*17, 5 + i*8, 1});
        for (int i = 0; i < 16; ++i) {
            if (i % 4 != 3) graph.edges.push_back({i, i+1});
            if (i < 12) graph.edges.push_back({i, i+4});
        }
    }
}

void GraphRenderer::draw() {
    clearCanvas();

    for (const auto& edge : graph.edges) {
        drawEdge(graph.nodes[edge.from], graph.nodes[edge.to]);
    }

    for (const auto& node : graph.nodes) {
        drawNode(node); // Node draws over edges (occlusion)
    }
}
