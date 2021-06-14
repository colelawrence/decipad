import { DeciEditor, AnonymousRuntimeProvider } from '@decipad/editor';

const ran = String(Math.random());

export default function Playground() {
  return (
    <AnonymousRuntimeProvider>
      <DeciEditor workspaceId={ran} padId={ran} />
    </AnonymousRuntimeProvider>
  );
}
