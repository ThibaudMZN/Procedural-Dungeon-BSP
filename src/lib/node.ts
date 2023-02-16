export class Node<T> {
  data: T;
  parent: Node<T> = null;
  children: Node<T>[] = null;
  id: string;
  maxDepth: number;
  splitRules: (data: T) => T[];

  constructor(
    data: T,
    maxDepth: number,
    splitRules: (data: T) => T[],
    parent?: Node<T>,
  ) {
    this.data = data;
    this.id = crypto.randomUUID();
    this.maxDepth = maxDepth;
    this.splitRules = splitRules;
    this.parent = parent;
  }

  split(depth: number = 0) {
    if (depth >= this.maxDepth) return;
    this.children = [];
    const data = this.splitRules(this.data);
    for (let i = 0; i < 2; i++) {
      const child = new Node<T>(data[i], this.maxDepth, this.splitRules, this);
      this.children.push(child);
      this.children[i].split(depth + 1);
    }
  }

  getLastChildren(): Node<T>[] {
    return this.children
      ? [...this.children.map((c) => c.getLastChildren()).flat()]
      : [this];
  }

  getSibling(): Node<T> {
    return this.parent.children.find((c) => c.id != this.id);
  }
}
