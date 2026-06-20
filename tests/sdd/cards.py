import asyncio
import os
import json
from playwright.async_api import async_playwright

# SDD Decorators
def Is(fact_key):
    def decorator(func):
        func._sdd_is = fact_key
        return func
    return decorator

def Needs(dependency):
    def decorator(func):
        func._sdd_needs = dependency
        return func
    return decorator

def Results(expected):
    def decorator(func):
        func._sdd_results = expected
        return func
    return decorator

class DiagramCards:
    def __init__(self, page, facts):
        self.page = page
        self.facts = facts

    @Is("viewer_rendering")
    @Needs("docs/index.html")
    @Results("nodes_count")
    async def verify_node_count(self):
        nodes = await self.page.query_selector_all('.workflow-node')
        count = len(nodes)
        print(f"numeric_evidence: nodes_count = {count}")
        return count

    @Is("component_verification")
    @Results("special_nodes_verified")
    async def verify_special_nodes(self):
        # Verify background, text_box, and logo are present
        bg = await self.page.query_selector('.workflow-node.background')
        txt = await self.page.query_selector('.workflow-node.text_box')
        logo = await self.page.query_selector('.workflow-node.logo')

        verified = sum([1 for x in [bg, txt, logo] if x is not None])
        print(f"numeric_evidence: special_nodes_verified = {verified}")
        return verified

    @Is("connection_verification")
    @Results("purple_dashed_connections")
    async def verify_connections(self):
        # Temporarily enable pointer events for path inspection if needed,
        # but for simple presence check it's fine.
        paths = await self.page.query_selector_all('path.connection-purple_dashed')
        count = len(paths)
        print(f"numeric_evidence: purple_dashed_connections = {count}")
        return count

async def run_cards():
    facts_path = os.path.join(os.path.dirname(__file__), 'facts.json')
    with open(facts_path, 'r') as f:
        facts = json.load(f)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        abs_path = os.path.abspath('docs/index.html')
        await page.goto(f'file://{abs_path}')

        cards = DiagramCards(page, facts)

        # In a real SDD runner, these would be discovered and executed based on decorators
        await cards.verify_node_count()
        await cards.verify_special_nodes()
        await cards.verify_connections()

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_cards())
