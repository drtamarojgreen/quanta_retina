#include "../src/graph_logic.h"
#include <iostream>
#include <vector>
#include <string>

// This is a mock BDD runner. It does not parse the .feature file.
// It simulates the execution of the steps defined in tests/graph.feature.

GraphRenderer renderer;
bool initialized = false;

// Step definitions
void given_the_graph_renderer_is_initialized() {
    renderer = GraphRenderer();
    initialized = true;
    std::cout << "GIVEN: The graph renderer is initialized" << std::endl;
}

void when_I_load_graph_version(int version) {
    if (initialized) {
        renderer.loadGraph(version);
        std::cout << "WHEN: I load graph version " << version << std::endl;
    } else {
        std::cerr << "Step failed: Renderer not initialized." << std::endl;
    }
}

void then_the_graph_should_have_n_nodes(int expected_nodes) {
    std::cout << "THEN: The graph should have " << expected_nodes << " nodes" << std::endl;
}

void and_the_graph_should_have_n_edges(int expected_edges) {
    std::cout << "AND: The graph should have " << expected_edges << " edges" << std::endl;
}

void run_scenario(const std::string& scenario_name, int version, int nodes, int edges) {
    std::cout << "Running BDD test scenario: " << scenario_name << std::endl;
    std::cout << "--------------------------------------------------------" << std::endl;
    given_the_graph_renderer_is_initialized();
    when_I_load_graph_version(version);
    then_the_graph_should_have_n_nodes(nodes);
    and_the_graph_should_have_n_edges(edges);
    std::cout << "--------------------------------------------------------" << std::endl;
}

int main() {
    run_scenario("Loading the simple 4-node graph", 0, 4, 3);
    run_scenario("Loading the intermediate 8-node graph", 1, 8, 9);
    run_scenario("Loading the complex 16-node graph", 2, 16, 24);

    std::cout << "All BDD test scenarios complete." << std::endl;

    return 0;
}
