# QuantaGraph - Undirected Network Graph Prototype

This project is a C++ console application for Windows that demonstrates the rendering of an undirected network graph. It is a rapid application development prototype designed to visually represent graph structures with varying complexity directly within the terminal.

## Features

*   **Multiple Graph Views:** The application cycles through three predefined graph layouts:
    *   A simple 4-node graph.
    *   An intermediate 8-node graph.
    *   A more complex 16-node graph.
*   **Variable Node Sizing:** Nodes are rendered as squares of 'x' characters, with their size indicating visual proximity:
    *   **Close Node:** 5x5 characters
    *   **Medium Node:** 3x3 characters
    *   **Far Node:** 1x1 character
*   **Edge Rendering:** Connections between nodes are drawn using `/` and `\` characters to represent lines.
*   **Occlusion:** The application demonstrates occlusion by drawing nodes on top of the edges, making it appear as if the nodes are closer to the viewer.

## Building and Running

This application is designed to be compiled with g++ on a Windows system.

1.  **Compile the code:**
    Open a terminal or command prompt and run the following g++ command to compile the source files into an executable:
    ```sh
    g++ main.cpp graph_logic.cpp -o QuantaGraph.exe
    ```

2.  **Run the application:**
    Once compiled, you can run the application by executing the generated file:
    ```sh
    .\QuantaGraph.exe
    ```

## Controls

*   **Press the [spacebar]** to cycle through the three different graph views.
*   After the final (16-node) graph is displayed, the application will show an exit message. Press any key to close the program.

## Detailed Purpose

The primary purpose of this application is to demonstrate a method for representing a three-dimensional undirected network graph within the limitations of a standard terminal console. The rendering is done using only basic ASCII characters (`X`, `/`, `\`) and does not rely on colors or special graphics capabilities.

The third dimension (depth, or the z-axis) is simulated by varying the size of the nodes on the 2D console screen. Larger nodes are intended to be perceived as being closer to the viewer, while smaller nodes appear farther away. This technique, combined with occlusion (drawing nodes over the lines representing edges), creates a simple but effective illusion of depth.
