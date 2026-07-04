describe('Workflow Designer E2E', () => {
  beforeEach(() => {
    // Relative to root
    cy.visit('docs/index.html');
    // Hide the sorrel ring to avoid occlusion of other nodes for testing simplicity
    cy.get('#node-ring').invoke('attr', 'style', 'display: none');
  });

  it('should load the initial demo workflow', () => {
    cy.get('.workflow-node').should('have.length.at.least', 10);
    cy.get('#svg-layer path[id^="conn-"]').should('have.length.at.least', 5);
  });

  it('should create a new node by dragging from palette', () => {
    const dataTransfer = new DataTransfer();
    cy.get('.palette-node[data-node-type="quanta_porto"]').first()
      .trigger('dragstart', { dataTransfer });

    cy.get('#canvas')
      .trigger('drop', {
        clientX: 800,
        clientY: 800,
        dataTransfer
      });

    cy.get('.workflow-node.quanta_porto').should('have.length.at.least', 1);
  });

  it('should drag a node and update its position', () => {
    cy.get('#node-porto').then(($el) => {
      const initialPos = $el[0].getBoundingClientRect();

      // We use realEvents if available, but for now we try to trigger on window for movement
      cy.get('#node-porto')
        .trigger('dragstart', { clientX: initialPos.left + 10, clientY: initialPos.top + 10 });

      cy.get('#canvas')
        .trigger('drop', { clientX: initialPos.left + 100, clientY: initialPos.top + 100 });

      cy.get('#node-porto').then(($elNew) => {
        const newPos = $elNew[0].getBoundingClientRect();
        expect(newPos.left).to.not.equal(initialPos.left);
      });
    });
  });

  it('should show properties when a node is clicked', () => {
    cy.get('#node-porto').click();
    cy.get('#properties-panel').should('not.have.class', 'hidden');
    cy.get('#prop-title').should('have.value', 'Quanta_Porto');
  });

  it('should delete a node via context menu', () => {
    cy.get('.workflow-node').should('have.length.at.least', 1);
    cy.get('#node-porto').rightclick();
    cy.get('#context-menu').should('not.have.class', 'hidden');
    cy.get('#context-delete').click();
    cy.get('#node-porto').should('not.exist');
  });
});
