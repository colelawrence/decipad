import { FC, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Provider as UrqlProvider, ClientOptions } from 'urql';
import { createClient } from '../createClient';

interface GraphqlProviderProps {
  readonly children: ReactNode;
}

export const GraphqlProvider: FC<GraphqlProviderProps> = ({ children }) => {
  const { search } = useLocation();
  const clientOpts = useMemo(() => {
    const params = new URLSearchParams(search);
    const secret = params.get('secret');
    const opts: Partial<ClientOptions> = {};
    if (secret) {
      // eslint-disable-next-line no-param-reassign
      opts.fetchOptions = {
        headers: {
          authorization: `Bearer ${secret}`,
        },
      };
    }
    return opts;
  }, [search]);

  const client = useMemo(
    () => createClient(clientOpts as ClientOptions),
    [clientOpts]
  );
  return <UrqlProvider value={client}>{children}</UrqlProvider>;
};
