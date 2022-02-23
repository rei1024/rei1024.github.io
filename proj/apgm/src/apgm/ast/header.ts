export class Header {
    constructor(
        /**
         * name without `#`
         */
        public readonly name: string,
        public readonly content: string,
    ) {}

    toString(): string {
        const space = this.content.startsWith(" ") ? "" : " ";
        return `#${this.name}${space}${this.content}`;
    }
}
