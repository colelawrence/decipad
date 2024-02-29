import { CommandIcon } from './CommandIcon';
import { CommandQuoteDark, CommandQuoteLight } from './themed';

export const CommandQuote = () => (
  <CommandIcon light={<CommandQuoteLight />} dark={<CommandQuoteDark />} />
);
