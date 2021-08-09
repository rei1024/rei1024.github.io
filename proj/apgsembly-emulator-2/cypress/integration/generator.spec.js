const genURL = 'http://localhost:1123/generator/index.html';

describe('Generator Load', () => {
    it('should load', () => {
        cy.visit(genURL);
        cy.contains('Code generator for elementary cellular automata');
    });
});

export {};
