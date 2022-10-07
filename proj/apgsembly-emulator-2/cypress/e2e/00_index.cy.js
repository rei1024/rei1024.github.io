// @ts-check
/// <reference types="cypress" />

import {
    APGsemblyEmulatorURL,
    loadProgram,
    setProgram,
    setStep,
    clickStep,
    setProgramSlow,
    assertToggleStart,
    assertToggleStop,
    assertToggleDisabledStart,
    assertNumberOfStates,
    assertSteps,
    assertStepsNot,
    toggle,
    assertError,
    assertRegister,
    assertCurrentState,
    assertOutput,
} from "../common/common.js";

describe('Load', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        assertToggleStart();
    });
});

describe('Run APGsembly', () => {
    it('should load', () => {
        setProgram(`
        INITIAL; ZZ; A0; INC U0, NOP
        A0; ZZ; A0; HALT_OUT
        `)
        assertToggleStart();
        cy.get('#step').should('not.be.disabled');
        assertCurrentState('INITIAL')
        assertRegister("U0", "0");
        assertError('');
    });

    it('shold run', () => {
        toggle();
        cy.get('#step').should('be.disabled');
        assertCurrentState('A0');
        assertRegister("U0", "1");
    });
});

describe('Error: empty program', () => {
    it('should show error', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
        assertToggleStart();
        toggle();
        assertError('- Program is empty');
        assertToggleDisabledStart();
    });
});

describe('unary_multiply.apg', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
        loadProgram('unary_multiply.apg');

        assertRegister("U0", '7');
        assertRegister('U1', '5');
    });

    it('should execute unary_multiply.apg', () => {
        setStep(100);
        clickStep();
        assertSteps(93);
        assertRegister('U2', '35');

        assertError('');
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
        clickStep();
        assertOutput('1.2.3.4.5.6.7.8.9.10');
        assertSteps(1050);

        assertError('');
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
        clickStep();

        assertSteps(1000);

        cy.get('#command').should('have.text', 'NEXT_S000_WRITE_1; *; NEXT_S00_CHECK0_1; INC B2DX, NOP');

        assertError('');
    });
});

describe('Start Stop Reset', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
        loadProgram('rule110.apg');
    });

    it('Start and Stop', () => {
        assertToggleStart();
        toggle();
        assertToggleStop();
        cy.wait(400);
        toggle();
        assertStepsNot(0);

        assertError('');
    });

    it('Reset', () => {
        cy.get('#reset').click();
        assertSteps(0);

        assertError('');
    });
});

describe('Error Steps', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
    });

    it('Run', () => {
        setProgram(`
    INITIAL; ZZ; A0; NOP
    A0; ZZ; A1; SET B0, NOP
    A1; ZZ; A1; SET B0, NOP`);
        setStep(100);
        clickStep();
        assertSteps(3);

        assertError('- The bit of the binary register B0 is already 1 in "A1; ZZ; A1; SET B0, NOP" at line 4');
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

        // assertNumberOfStates(131);
    });

    it('should print pi', () => {
        setStep(1000000);
        clickStep();
        assertOutput('3.141');

        assertSteps(1000000);

        assertRegister('B0', 'value = 243290200817664000, pointer = 1340000000000000000010010001011000001100100111010100000011011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');

        assertError('');
    });
});


describe('Step', () => {
    it('should load', () => {
        cy.visit(APGsemblyEmulatorURL);
        cy.contains('APGsembly');
        loadProgram('binary_ruler.apg');
    });

    it('should step twice', () => {
        setStep(5000000);
        clickStep();
        assertSteps(5000000);
        assertToggleStart();

        clickStep();
        assertSteps(5000000 * 2);
        assertToggleStart();

        assertError('');
    });
});
