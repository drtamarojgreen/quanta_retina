Feature: Graph Loading
  As a user, I want to load different graph versions to see different visualizations.

  Scenario: Loading the simple 4-node graph with detailed checks
    Given the graph renderer is initialized
    When I load graph version 0
    Then the graph should have 4 nodes
    And the graph should have 3 edges
    And node with id 0 should have label "Initial Thought"
    And an edge should exist between node 0 and node 1

  Scenario: Loading the intermediate 8-node graph
    Given the graph renderer is initialized
    When I load graph version 1
    Then the graph should have 8 nodes
    And the graph should have 9 edges

  Scenario: Loading the complex 16-node graph
    Given the graph renderer is initialized
    When I load graph version 2
    Then the graph should have 16 nodes
    And the graph should have 24 edges
