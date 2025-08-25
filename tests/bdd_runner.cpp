#include "../src/graph_logic.h"
#include <iostream>
#include <vector>
#include <string>
#include <cassert>
#include <algorithm>
#include <functional>

GraphRenderer renderer;

// Step definitions
void given_the_graph_renderer_is_initialized() {
    // No action needed, renderer is reset in run_scenario
}

void when_I_load_graph_version(int version) {
    renderer.loadGraph(version);
}

void then_the_graph_should_have_n_nodes(int expected_nodes) {
    assert(renderer.getGraph().nodes.size() == expected_nodes);
}

void and_the_graph_should_have_n_edges(int expected_edges) {
    assert(renderer.getGraph().edges.size() == expected_edges);
}

void and_node_with_id_should_have_label(int id, const std::string& label) {
    const auto& nodes = renderer.getGraph().nodes;
    auto it = std::find_if(nodes.begin(), nodes.end(), [id](const Node& node){ return node.id == id; });
    assert(it != nodes.end());
    assert(it->label == label);
}

void and_an_edge_should_exist_between_node_and_node(int from, int to) {
    const auto& edges = renderer.getGraph().edges;
    auto it = std::find_if(edges.begin(), edges.end(), [from, to](const Edge& edge){
        return (edge.from == from && edge.to == to) || (edge.from == to && edge.to == from);
    });
    assert(it != edges.end());
}

void run_scenario(const std::string& scenario_name, std::function<void()> scenario_logic) {
    std::cout << "Running BDD scenario: " << scenario_name << "..." << std::endl;
    renderer = GraphRenderer(); // Reset for each scenario
    scenario_logic();
    std::cout << "PASSED: " << scenario_name << std::endl;
}

int main() {
    run_scenario("Loading the simple 4-node graph with detailed checks", [](){
        given_the_graph_renderer_is_initialized();
        when_I_load_graph_version(0);
        then_the_graph_should_have_n_nodes(4);
        and_the_graph_should_have_n_edges(3);
        and_node_with_id_should_have_label(0, "Initial Thought");
        and_an_edge_should_exist_between_node_and_node(0, 1);
    });

    run_scenario("Loading the intermediate 8-node graph", [](){
        given_the_graph_renderer_is_initialized();
        when_I_load_graph_version(1);
        then_the_graph_should_have_n_nodes(8);
        and_the_graph_should_have_n_edges(9);
    });

    run_scenario("Loading the complex 16-node graph", [](){
        given_the_graph_renderer_is_initialized();
        when_I_load_graph_version(2);
        then_the_graph_should_have_n_nodes(16);
        and_the_graph_should_have_n_edges(24);
    });

    std::cout << "All BDD scenarios seem to have passed (or assertions are disabled)." << std::endl;
    return 0;
}
