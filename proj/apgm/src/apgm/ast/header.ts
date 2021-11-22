export class Header {
    constructor(public name: string, public content: string) {}

    toString(): string {
        if (this.content.startsWith(" ")) {
            return `#${this.name}${this.content}`;
        } else {
            return `#${this.name} ${this.content}`;
        }
    }
}
