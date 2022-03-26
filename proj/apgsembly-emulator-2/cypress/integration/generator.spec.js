// @ts-check
/// <reference types="cypress" />

import {
    genURL,
    APGsemblyEmulatorURL,
    setStep,
    setProgram,
    assertSteps,
} from "../common/common.js";

describe('Generator integration', () => {
    it('should load', () => {
        cy.visit(genURL);
        cy.contains('Code generator for elementary cellular automata');
    });
    it('should generate', () => {
        cy.get('#rule').type(`{selectall}{backspace}110`);
        cy.get('#generate').click();
        cy.get('#copy').should('not.be.disabled');
    });

    it('should run', () => {
        cy.wait(50);
        cy.get('#output').then(x => {
            /**
             * @type {string}
             */
            // @ts-ignore
            const prog = x.val();
            cy.visit(APGsemblyEmulatorURL);

            setProgram(prog);
            setStep(100);
            cy.get('#step').click();
            assertSteps(100);
        });
    });
});

export {};
