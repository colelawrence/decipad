// eslint-disable-next-line no-restricted-imports
import type { AutocompleteName } from '@decipad/language-interfaces';
import type { Program } from '@decipad/computer-interfaces';
import type { Computer } from '../computer';

export type FindNames = (
  computer: Computer,
  program: Readonly<Program>,
  ignoreNames: Set<string>,
  inBlockId?: string
) => Iterable<AutocompleteName>;
