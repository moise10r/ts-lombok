class User {
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    Object.freeze(this);
  }
  toString(): string {
    return `User(id=${this.id}, name=${this.name})`;
  }
  readonly id: number;
  readonly name: string;
}
