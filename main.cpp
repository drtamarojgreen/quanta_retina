#include "graph_logic.h"
#include <iostream>
#include <conio.h> // for _getch()

int main() {
    GraphRenderer renderer;

    std::cout << "QuantaGraph Prototype - Press [space] to step through graph views.\n\n";

    for (int view = 0; view < 3; ++view) {
        renderer.loadGraph(view);
        renderer.draw();
        renderer.renderToConsole();

        if (view < 2) {
            std::cout << "\n[SPACE] for next graph...\n";
            while (_getch() != ' ');
        }
    }

    std::cout << "\nAll graph views displayed. Press any key to exit.\n";
    _getch();
    return 0;
}
