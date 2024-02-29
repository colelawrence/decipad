import { CommandIcon } from './CommandIcon';
import { CommandIntegrationsLight, CommandIntegrationsDark } from './themed';

export const CommandIntegrations = () => (
  <CommandIcon
    light={<CommandIntegrationsLight />}
    dark={<CommandIntegrationsDark />}
  />
);
