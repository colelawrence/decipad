import { Context } from "./context";

export class Contexts {
  actorId: string;
  contexts: Map<string, Context>;

  constructor(actorId: string) {
    this.actorId = actorId;
    this.contexts = new Map();
  }

  create(id: string): Context {
    if (this.contexts.has(id)) {
      return this.get(id) as Context;
    }

    const context = new Context(this.actorId, id);
    this.contexts.set(id, context);

    return context;
  }

  get(id: string): Context | undefined {
    return this.contexts.get(id);
  }

  destroy(id: string) {
    const context = this.get(id);
    if (context !== undefined) {
      context.destroy();
      this.contexts.delete(id);
    }
  }
}

export default Contexts;
