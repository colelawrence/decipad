import { ConnectionRecord } from '@decipad/backendtypes';
import { tables } from '@decipad/tables';

export const onDisconnect = async (
  conn: ConnectionRecord & { protocol: string }
) => {
  const data = await tables();
  await data.connections.delete({ id: conn.id });
};
