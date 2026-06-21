
import unittest
import os
import json
import time
from playwright.sync_api import sync_playwright, expect

class TestWorkflowInteractions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)
        cls.path = f"file://{os.path.abspath('docs/index.html')}"

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context()
        self.page = self.context.new_page()
        self.page.add_style_tag(content="""
            #svg-layer path { pointer-events: auto; }
            .workflow-node.sorrel_ring, .workflow-node.brain_connectome { pointer-events: none; }
        """)
        self.page.goto(self.path)
        self.page.wait_for_selector(".workflow-node")
        self.page.evaluate("localStorage.clear()")
        self.page.reload()
        self.page.wait_for_selector(".workflow-node")

    def tearDown(self):
        self.context.close()

    def get_stray_count(self):
        return self.page.evaluate("document.querySelectorAll('#svg-layer > path:not([id])').length")

    def test_node_creation(self):
        """Test creating a new node from the palette."""
        initial_nodes = self.page.locator(".workflow-node").count()
        palette_node = self.page.locator(".palette-node[data-node-type='quanta_synapse']")
        canvas = self.page.locator("#canvas")
        palette_node.drag_to(canvas, target_position={"x": 100, "y": 100})
        self.assertEqual(self.page.locator(".workflow-node").count(), initial_nodes + 1)

    def test_duplicate_prevention(self):
        """Test that duplicate connections are prevented."""
        out_port = self.page.locator("#node-porto .output")
        in_port = self.page.locator("#node-lllm .input")
        box_from = out_port.bounding_box()
        box_to = in_port.bounding_box()
        initial_conns = self.page.locator("#svg-layer > path[id]").count()
        self.page.mouse.move(box_from['x'] + box_from['width']/2, box_from['y'] + box_from['height']/2)
        self.page.mouse.down()
        self.page.mouse.move(box_to['x'] + box_to['width']/2, box_to['y'] + box_to['height']/2)
        self.page.mouse.up()
        self.assertEqual(self.page.locator("#svg-layer > path[id]").count(), initial_conns)

    def test_node_deletion(self):
        """Test deleting a node."""
        node = self.page.locator("#node-porto")
        node.dispatch_event("contextmenu")
        self.page.locator("#context-delete").click()
        expect(node).not_to_be_visible()

    def test_panning(self):
        """Test canvas panning."""
        initial_transform = self.page.locator("#world").evaluate("el => el.style.transform")
        canvas = self.page.locator("#canvas")
        box = canvas.bounding_box()
        self.page.keyboard.down("Space")
        self.page.mouse.move(box['x'] + box['width']/2, box['y'] + box['height']/2)
        self.page.mouse.down()
        self.page.mouse.move(box['x'] + box['width']/2 + 50, box['y'] + box['height']/2 + 50)
        self.page.mouse.up()
        self.page.keyboard.up("Space")
        new_transform = self.page.locator("#world").evaluate("el => el.style.transform")
        self.assertNotEqual(initial_transform, new_transform)

if __name__ == "__main__":
    unittest.main()
