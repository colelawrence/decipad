import { Contexts } from "./contexts";

class Runtime {
  contexts: Contexts;

  constructor(actorId: string) {
    this.contexts = new Contexts(actorId);
  }
}

export function createRuntime(actorId: string): Runtime {
    return new Runtime(actorId);
}
