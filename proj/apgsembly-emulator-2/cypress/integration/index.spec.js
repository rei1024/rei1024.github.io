describe('Test', () => {
    it('Pi calculator', () => {
        cy.visit('http://localhost:1123/');
        cy.contains('APGsembly');
        cy.get('#samples').click();
        cy.get('[data-src="pi_calc.apg"]').click();

        cy.contains('U0');
        cy.contains('U9');
        cy.contains('B0');
        cy.contains('B3');

        cy.contains('Config').click();
        cy.wait(100);
        cy.get('#step_input').type('{backspace}1000000');
        cy.get('#config_modal .btn-close').click();
        cy.wait(100);
        cy.get('#step').click();
        cy.get('#output').should('have.value', '3.141');

        cy.get('#steps').should('have.text', '1000000');
    });

    it('Error', () => {
        cy.visit('http://localhost:1123/');
        cy.contains('APGsembly');
        cy.get('#start').click();
        cy.contains('Program is empty');
    });
});
