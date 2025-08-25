#include "../src/graph_logic.h"
#include <iostream>
#include <vector>
#include <cassert>

void test_loadGraph_version0() {
    GraphRenderer renderer;
    renderer.loadGraph(0);
    const auto& graph = renderer.getGraph();
    assert(graph.nodes.size() == 4);
    assert(graph.edges.size() == 3);
    std::cout << "PASSED: test_loadGraph_version0" << std::endl;
}

void test_loadGraph_version1() {
    GraphRenderer renderer;
    renderer.loadGraph(1);
    const auto& graph = renderer.getGraph();
    assert(graph.nodes.size() == 8);
    assert(graph.edges.size() == 9);
    std::cout << "PASSED: test_loadGraph_version1" << std::endl;
}

void test_loadGraph_version2() {
    GraphRenderer renderer;
    renderer.loadGraph(2);
    const auto& graph = renderer.getGraph();
    assert(graph.nodes.size() == 16);
    assert(graph.edges.size() == 24);
    std::cout << "PASSED: test_loadGraph_version2" << std::endl;
}

int main() {
    std::cout << "Running unit tests..." << std::endl;
    test_loadGraph_version0();
    test_loadGraph_version1();
    test_loadGraph_version2();
    std::cout << "All unit tests seem to have passed (or assertions are disabled)." << std::endl;
    return 0;
}
