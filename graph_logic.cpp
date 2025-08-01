#include "graph_logic.h"
#include <iostream>
#include <cmath>
#include <algorithm>

GraphRenderer::GraphRenderer() {
    graph.canvas.resize(CANVAS_HEIGHT);
    clearCanvas();
}

void GraphRenderer::clearCanvas() {
    for (auto& line : graph.canvas)
        line = std::string(CANVAS_WIDTH, ' ');
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
            if (px >= 0 && px < CANVAS_WIDTH && py >= 0 && py < CANVAS_HEIGHT)
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

    if (steps == 0) return;

    for (int i = 0; i <= steps; ++i) {
        int x = x1 + dx * i / steps;
        int y = y1 + dy * i / steps;
        if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT) {
            graph.canvas[y][x] = (dy * dx >= 0) ? '\\' : '/';
        }
    }
}

void GraphRenderer::drawLabel(int x, int y, const std::string& text) {
    if (y < 0 || y >= CANVAS_HEIGHT) {
        return;
    }

    int len = text.length();
    int availableSpace = CANVAS_WIDTH - x;

    if (len > availableSpace) {
        len = std::max(0, availableSpace);
    }

    if (len > 0) {
        for (int i = 0; i < len; ++i) {
            if (x + i < CANVAS_WIDTH) {
                graph.canvas[y][x + i] = text[i];
            }
        }
    }
}

void GraphRenderer::drawAllLabels() {
    for (const auto& node : graph.nodes) {
        int labelX = 0;
        switch (node.size) {
            case 1:
                labelX = node.x + 2;
                break;
            case 3:
                labelX = node.x + 3;
                break;
            case 5:
                labelX = node.x + 4;
                break;
            default:
                labelX = node.x + 2;
                break;
        }

        std::string textToDraw = node.label;
        if (textToDraw.empty()) {
            textToDraw = "Node " + std::to_string(node.id);
        }

        drawLabel(labelX, node.y, textToDraw);
    }
}

void GraphRenderer::loadGraph(int version) {
    graph.nodes.clear();
    graph.edges.clear();

    if (version == 0) { // 4-node graph
        graph.nodes = {
            {0, 20, 5, 5, "Initial Thought"}, {1, 60, 5, 5, "Cognitive Distortion"},
            {2, 20, 18, 5, "Evidence For"}, {3, 60, 18, 5, "Evidence Against"}
        };
        graph.edges = {
            {0, 1}, {1, 3}, {2, 0}
        };
    }
    else if (version == 1) { // 8-node graph
        graph.nodes = {
            {0, 10, 3, 3, "Trigger"}, {1, 30, 3, 3, "Automatic Thought"}, {2, 50, 3, 3, "Feeling"}, {3, 70, 3, 3, "Action"},
            {4, 10, 20, 3, "Alternative Thought"}, {5, 30, 20, 3, "New Feeling"}, {6, 50, 20, 3, "New Action"}, {7, 70, 20, 1, "Outcome"}
        };
        for (int i = 0; i < 4; ++i)
            graph.edges.push_back({i, i+4});
        graph.edges.push_back({0,1}); graph.edges.push_back({1,2});
        graph.edges.push_back({2,3}); graph.edges.push_back({4,5});
        graph.edges.push_back({5,6});
    }
    else { // 16-node graph
        graph.nodes = {
            // Core Beliefs
            {0, 5, 3, 1, "Core Belief 1"}, {1, 23, 3, 1, "Core Belief 2"}, {2, 41, 3, 1, "Core Belief 3"}, {3, 59, 3, 1, "Core Belief 4"},
            // Intermediate Beliefs
            {4, 5, 9, 1, "Rule 1"}, {5, 23, 9, 1, "Rule 2"}, {6, 41, 9, 1, "Attitude 1"}, {7, 59, 9, 1, "Attitude 2"},
            // Situational Triggers
            {8, 5, 15, 1, "Situation A"}, {9, 23, 15, 1, "Situation B"}, {10, 41, 15, 1, "Situation C"}, {11, 59, 15, 1, "Situation D"},
            // Automatic Thoughts
            {12, 5, 21, 1, "AutoThought A"}, {13, 23, 21, 1, "AutoThought B"}, {14, 41, 21, 1, "AutoThought C"}, {15, 59, 21, 1, "AutoThought D"}
        };
        for (int i = 0; i < 16; ++i) {
            if (i % 4 != 3) graph.edges.push_back({i, i+1});
            if (i < 12) graph.edges.push_back({i, i+4});
        }
    }
}

void GraphRenderer::draw() {
    clearCanvas();

    for (const auto& edge : graph.edges) {
        // Ensure nodes exist before drawing edge
        if (edge.from < graph.nodes.size() && edge.to < graph.nodes.size()) {
            drawEdge(graph.nodes[edge.from], graph.nodes[edge.to]);
        }
    }

    for (const auto& node : graph.nodes) {
        drawNode(node); // Node draws over edges (occlusion)
    }

    drawAllLabels();
}
