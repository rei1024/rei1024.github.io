/// <reference types="cypress" />

import { genURL } from "../common/common.js";

describe('Generator Load', () => {
    it('should load', () => {
        cy.visit(genURL);
        cy.contains('Code generator for elementary cellular automata');
    });
    it('should generate', () => {
        cy.get('#rule').type(`{selectall}{backspace}110`);
        cy.get('#generate').click();
        cy.get('#copy').should('not.be.disabled');
    });
});

export {};
