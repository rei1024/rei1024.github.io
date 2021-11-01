// @ts-check
/// <reference types="cypress" />

import { APGsemblyEmulatorURL, loadProgram, setStep, setProgramSlow } from "../common/common.js";

const outputSelector = '#output';

describe('Load', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.get('#start').should('not.be.disabled');
    });
});

describe('Error: empty program', () => {
    it('should show error', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
        cy.get('#start').click();
        cy.get('#error').should('have.text', 'Program is empty');
    });
});

describe('unary_multiply.apg', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
        loadProgram('unary_multiply.apg');

        cy.get(`[data-test="U0"]`).should('have.text', '7');
        cy.get(`[data-test="U1"]`).should('have.text', '5');
    });
    it('should execute unary_multiply.apg', () => {
        setStep(100);
        cy.get('#step').click();

        cy.get('#steps').should('have.text', '93');

        cy.get(`[data-test="U2"]`).should('have.text', '35');
    });
});

describe('Integers', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
        loadProgram('integers.apg');
    });
    it('should print integers', () => {
        setStep(1050);
        cy.get('#step').click();
        cy.get(outputSelector).should('have.value', '1.2.3.4.5.6.7.8.9.10');

        cy.get('#steps').should('have.text', '1050');
    });
});

describe('π calculator', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
        loadProgram('pi_calc.apg');

        cy.contains('U0');
        cy.contains('U9');
        cy.contains('B0');
        cy.contains('B3');
    });
    it('should print pi', () => {
        setStep(1000000);
        cy.get('#step').click();
        cy.get(outputSelector).should('have.value', '3.141');

        cy.get('#steps').should('have.text', '1000000');

        cy.get(`[data-test="B0"]`).should('have.text', 'value = 243290200817664000, pointer = 1340000000000000000010010001011000001100100111010100000011011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
    });
});

describe('Rule 110', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
        loadProgram('rule110.apg');
    });
    it('Rule 110 should work', () => {
        setStep(1000);
        cy.get('#step').click();

        cy.get('#steps').should('have.text', '1000');

        cy.get('#command').should('have.text', 'NEXT_S000_WRITE_1; *; NEXT_S00_CHECK0_1; INC B2DX, NOP');
    });
});

describe('Start Stop Reset', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
        loadProgram('rule110.apg');
    });
    it('Start and Stop', () => {
        cy.get('#start').click();
        cy.wait(400);
        cy.get('#stop').click();
        cy.get('#steps').should('not.have.text', '0');
    });
    it('Reset', () => {
        cy.get('#reset').click();
        cy.get('#steps').should('have.text', '0');
    });
});

describe('Error Steps', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
    });
    it('Run', () => {
        setProgramSlow(`
    INITIAL; ZZ; A0; NOP
    A0; ZZ; A1; SET B0, NOP
    A1; ZZ; A1; SET B0, NOP`);
        setStep(100);
        cy.get('#step').click();
        cy.get('#steps').should('have.text', '3');
    });
});
