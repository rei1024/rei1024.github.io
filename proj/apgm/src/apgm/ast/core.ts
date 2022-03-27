/**
 * Expression of APGM language
 */
export abstract class APGMExpr {
    constructor() {
    }

    abstract transform(f: (_: APGMExpr) => APGMExpr): APGMExpr;
    abstract pretty(): string;
}

export interface APGMSourceLocation {
    /** The string index into the input (e.g. for use with `.slice`) */
    index: number;
    /**
     * The line number for error reporting. Only the character `\n` is used to
     * signify the beginning of a new line.
     */
    line: number;
    /**
     * The column number for error reporting.
     */
    column: number;
}

export class ErrorWithLocation extends Error {
    constructor(
        message: string,
        public apgmLocation?: APGMSourceLocation | undefined,
        options?: ErrorOptions | undefined,
    ) {
        super(message, options);
    }
}

export function formatLocation(location: APGMSourceLocation): string {
    return `line ${location.line} column ${location.column}`;
}

export function formatLocationAt(
    location: APGMSourceLocation | undefined,
): string {
    if (location !== undefined) {
        return ` at line ${location.line} column ${location.column}`;
    } else {
        return "";
    }
}
