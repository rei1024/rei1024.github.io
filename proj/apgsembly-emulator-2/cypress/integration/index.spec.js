export {};

const apgsemblyEmulatorPageURL = 'http://localhost:1123/';

describe('Load', () => {
    it('should load', () => {
        cy.visit(apgsemblyEmulatorPageURL);
        cy.get('#start').should('not.be.disabled');
    });
});

describe('Error', () => {
    it('Error', () => {
        cy.visit(apgsemblyEmulatorPageURL);
        cy.contains('APGsembly');
        cy.get('#start').click();
        cy.contains('Program is empty');
    });
});

/**
 *
 * @param {string} str 
 */
function loadProgram(str) {
    cy.get('#samples').click();
    cy.get(`[data-src="${str}"]`).click();
}

/**
 *
 * @param {number} n 
 */
function setStep(n) {
    cy.get(`[data-test="config_button"]`).click();
    cy.wait(500);
    cy.get('#step_input').type(`{selectall}{backspace}${n}`);
    cy.get('#config_modal .btn-close').click();
    cy.wait(50);
}

const outputSelector = '#output';

describe('Integers', () => {
    it('should print integers', () => {
        cy.visit(apgsemblyEmulatorPageURL);
        cy.contains('APGsembly');
        loadProgram('integers.apg');

        setStep(1050);
        cy.get('#step').click();
        cy.get(outputSelector).should('have.value', '1.2.3.4.5.6.7.8.9.10');

        cy.get('#steps').should('have.text', '1050');
    });
});

describe('Pi calculator', () => {
    it('should print pi', () => {
        cy.visit(apgsemblyEmulatorPageURL);
        cy.contains('APGsembly');
        loadProgram('pi_calc.apg');

        cy.contains('U0');
        cy.contains('U9');
        cy.contains('B0');
        cy.contains('B3');

        setStep(1000000);
        cy.get('#step').click();
        cy.get(outputSelector).should('have.value', '3.141');

        cy.get('#steps').should('have.text', '1000000');
    });
});

describe('Rule 110', () => {
    it('Rule 110 should work', () => {
        cy.visit(apgsemblyEmulatorPageURL);
        cy.contains('APGsembly');
        loadProgram('rule110.apg');

        setStep(1000);
        cy.get('#step').click();

        cy.get('#steps').should('have.text', '1000');
    });
});

describe('Start Stop Reset', () => {
    it('Start, Stop and Reset button', () => {
        cy.visit(apgsemblyEmulatorPageURL);
        cy.contains('APGsembly');
        loadProgram('rule110.apg');
        cy.get('#start').click();
        cy.wait(500);
        cy.get('#stop').click();
        cy.get('#steps').should('not.have.text', '0');

        cy.get('#reset').click();

        cy.get('#steps').should('have.text', '0');
    });
});

describe('unary_multiply.apg', () => {
    it('unary_multiply.apg', () => {
        cy.visit(apgsemblyEmulatorPageURL);
        cy.contains('APGsembly');
        loadProgram('unary_multiply.apg');

        cy.get(`[data-test="U0"]`).should('have.text', '7');
        cy.get(`[data-test="U1"]`).should('have.text', '5');

        setStep(100);
        cy.get('#step').click();

        cy.get('#steps').should('have.text', '93');

        cy.get(`[data-test="U2"]`).should('have.text', '35');
    });
});
