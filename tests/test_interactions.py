import os
import unittest
from playwright.sync_api import sync_playwright

class TestWorkflowInteractions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context()
        self.page = self.context.new_page()
        # Use local server
        self.page.goto("http://localhost:8080")
        self.page.wait_for_selector(".workflow-node")
        # Hide occlusion
        self.page.evaluate('document.getElementById("node-ring").style.display = "none"')

    def tearDown(self):
        self.context.close()

    def test_node_presence(self):
        nodes = self.page.query_selector_all(".workflow-node")
        self.assertGreater(len(nodes), 0)

    def test_connection_presence(self):
        connections = self.page.query_selector_all("#svg-layer path[id^='conn-']")
        self.assertGreater(len(connections), 0)

    def test_node_dragging(self):
        node = self.page.locator("#node-porto")
        box = node.bounding_box()
        self.page.mouse.move(box['x'] + 10, box['y'] + 10)
        self.page.mouse.down()
        self.page.mouse.move(box['x'] + 100, box['y'] + 100)
        self.page.mouse.up()

        new_box = node.bounding_box()
        self.assertNotEqual(box['x'], new_box['x'])

    def test_connection_creation(self):
        # Find two nodes
        node1 = self.page.locator("#node-porto")
        node2 = self.page.locator("#node-allm")

        # Get output port of node1
        port1 = node1.locator(".output")
        port2 = node2.locator(".input")

        box1 = port1.bounding_box()
        box2 = port2.bounding_box()

        # Ensure we move to centers
        self.page.mouse.move(box1['x'] + box1['width']/2, box1['y'] + box1['height']/2)
        self.page.mouse.down()
        # Move slightly away then to target to trigger events correctly
        self.page.mouse.move(box1['x'] + box1['width']/2 + 50, box1['y'] + box1['height']/2 + 50)
        self.page.mouse.move(box2['x'] + box2['width']/2, box2['y'] + box2['height']/2)
        self.page.mouse.up()

        # Check if new connection exists
        conn = self.page.locator("path[id='conn-node-porto-node-allm']")
        # Increase timeout or check count
        self.assertGreater(len(self.page.query_selector_all("path[id='conn-node-porto-node-allm']")), 0)

    def test_load_workflow_clears_svg(self):
        # Initial connections
        initial_conns = len(self.page.query_selector_all("#svg-layer path[id^='conn-']"))
        self.assertGreater(initial_conns, 0)

        # Load empty workflow via script injection (simulating import)
        # We need to wait for the script to be fully loaded since it's a module
        self.page.wait_for_function("window.loadWorkflow !== undefined")
        self.page.evaluate("window.loadWorkflow({nodes: [], connections: []})")

        # Check if cleared
        nodes = self.page.query_selector_all(".workflow-node")
        conns = self.page.query_selector_all("#svg-layer path[id^='conn-']")
        self.assertEqual(len(nodes), 0)
        self.assertEqual(len(conns), 0)

    def test_rapid_mousedown_leak_prevention(self):
        # Rapidly click on a port
        node = self.page.locator("#node-porto")
        port = node.locator(".output")
        box = port.bounding_box()

        for _ in range(5):
            self.page.mouse.move(box['x'] + box['width']/2, box['y'] + box['height']/2)
            self.page.mouse.down()
            # No mouseup

        # There should only be one preview path (reconcileDOMWithState should keep it clean)
        # We must exclude paths inside <defs> (like arrowhead)
        previews = self.page.query_selector_all("#svg-layer > path:not([id])")
        self.assertEqual(len(previews), 1)

    def test_port_dragging_does_not_move_node(self):
        node = self.page.locator("#node-porto")
        port = node.locator(".output")

        initial_box = node.bounding_box()
        port_box = port.bounding_box()

        # Start drag from port
        self.page.mouse.move(port_box['x'] + port_box['width']/2, port_box['y'] + port_box['height']/2)
        self.page.mouse.down()
        self.page.mouse.move(port_box['x'] + 100, port_box['y'] + 100)
        self.page.mouse.up()

        # Node should NOT have moved
        final_box = node.bounding_box()
        self.assertEqual(initial_box['x'], final_box['x'])
        self.assertEqual(initial_box['y'], final_box['y'])

    def test_rapid_canvas_clicks_no_orphans(self):
        # Click rapidly on empty canvas area
        canvas = self.page.locator("#canvas")
        box = canvas.bounding_box()

        for i in range(10):
            self.page.mouse.click(box['x'] + 50 + i*10, box['y'] + 50 + i*10)

        # Verify no unintended paths were created
        paths = self.page.query_selector_all("#svg-layer > path:not([id])")
        self.assertEqual(len(paths), 0)

if __name__ == "__main__":
    unittest.main()
