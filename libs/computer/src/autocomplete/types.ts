import type { AutocompleteName, Computer, Program } from '..';

export type FindNames = (
  computer: Computer,
  program: Readonly<Program>,
  ignoreNames: Set<string>,
  inBlockId?: string
) => Iterable<AutocompleteName>;
