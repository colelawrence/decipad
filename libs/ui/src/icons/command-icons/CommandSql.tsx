import { CommandIcon } from './CommandIcon';
import { CommandSqlLight, CommandSqlDark } from './themed';

export const CommandSql = () => (
  <CommandIcon light={<CommandSqlLight />} dark={<CommandSqlDark />} />
);
