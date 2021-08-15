/// <reference types="cypress" />

import { genURL } from "../common/common.js";

describe('Generator Load', () => {
    it('should load', () => {
        cy.visit(genURL);
        cy.contains('Code generator for elementary cellular automata');
    });
});

export {};
