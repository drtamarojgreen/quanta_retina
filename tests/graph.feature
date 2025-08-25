Feature: Graph Loading
  As a user, I want to load different graph versions to see different visualizations.

  Scenario: Loading the simple 4-node graph
    Given the graph renderer is initialized
    When I load graph version 0
    Then the graph should have 4 nodes
    And the graph should have 3 edges
