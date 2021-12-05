export class Header {
    constructor(
        public readonly name: string,
        public readonly content: string,
    ) {}

    toString(): string {
        if (this.content.startsWith(" ")) {
            return `#${this.name}${this.content}`;
        } else {
            return `#${this.name} ${this.content}`;
        }
    }
}
