import { URI, Resource } from '@decipad/backendtypes';

type ChatProtocol = 'agent-chat-1';

export const roomNameFromResource = (
  resource: string,
  protocol: ChatProtocol
) => `${resource}/${protocol}`;

const parseResource = (resource: URI): Resource => {
  const parts = resource.split('/');
  return {
    type: parts[1],
    id: parts.splice(2).join('/'),
  };
};

export const resourceFromRoomName = (roomName: string): Resource => {
  const res = parseResource(roomName);
  const idParts = res.id.split('/');
  const id = idParts.slice(0, idParts.length - 1).join('');
  return {
    ...res,
    id,
  };
};
