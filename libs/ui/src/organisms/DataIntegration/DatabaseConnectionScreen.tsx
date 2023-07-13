/* eslint-disable decipad/css-prop-named-variable */
import { ImportElementSource } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC, FormEvent, useState } from 'react';
import {
  ExternalProvider,
  useWorkspaceExternalData,
} from '@decipad/graphql-client';
import { useToast } from '@decipad/toast';
import { useNavigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { MessageBlock, dividerStyles, inputStyles } from '.';
import { Caret, Warning } from '../../icons';
import {
  brand500,
  cssVar,
  p13Bold,
  p16Regular,
  p24Medium,
} from '../../primitives';
import { Button, MenuItem } from '../../atoms';
import { MenuList } from '../../molecules';

export type DbOptions = {
  connectionString: string;

  // Credential connection
  host: string;
  username: string;
  password: string;
  database: string;
  port: string;

  dbConnType?: 'url' | 'credentials' | 'existing-conn';

  query: string;
};

interface DatabaseConnectionProps {
  workspaceId: string;
}

const placeholderList: Record<ImportElementSource, string> = {
  mysql: 'mysql://',
  oracledb: 'oracle://',
  gsheets: 'https://',
  json: 'https://',
  postgresql: 'postgresql://',
  mariadb: 'mariadb://',
  mssql: 'mssql://',
  redshift: 'redshift://',
  csv: 'https://',
  cockroachdb: 'postgresql://',
  decipad: 'https://',
  codeconnection: 'n/a',
};

export const DatabaseConnectionScreen: FC<DatabaseConnectionProps> = ({
  workspaceId,
}) => {
  // STUB;
  const error = false;

  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [fullUrl, setFullUrl] = useState('');
  const [host, setHost] = useState('');
  const [protocol, setProtocol] = useState<ImportElementSource>('mysql');
  const [databaseName, setdatabaseName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [port, setPort] = useState('');

  const [connMethod, setConnMethod] = useState<
    'full-url' | 'manual' | undefined
  >(undefined);

  const { add } = useWorkspaceExternalData(workspaceId);
  const toast = useToast();

  // Function would get recreated too many times with `useCallback`
  function onSubmitConnection(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!connMethod) return;

    // TODO: Allow all protocols
    const url =
      connMethod === 'full-url'
        ? fullUrl
        : `${protocol}://${username}:${password}@${host}:${port}/${databaseName}`;

    add({
      name: `data-source/${workspaceId}/${ExternalProvider.Postgresql}/${url}`,
      externalId: url,
      workspace_id: workspaceId,
      padId: undefined, // Resource belongs to the workspace, and not a spefic notebook
      provider: ExternalProvider.Postgresql,
      dataSourceName: name,
    }).then((success) => {
      if (success) {
        toast('Successfully added connection', 'success');
        navigate(
          workspaces({}).workspace({
            workspaceId,
          }).$
        );
      } else {
        toast('Error creating connection', 'error');
      }
    });
  }

  return (
    <form css={mainWrapperStyles} onSubmit={onSubmitConnection}>
      <div>
        <h1 css={p24Medium}>SQL Connections</h1>
        <p css={p16Regular}>
          Accounts connections will be accessible by all workspace members for
          all notebooks.
        </p>
      </div>
      <div css={wrapperStyles}>
        <input type="submit" hidden />
        <div css={[inputFieldWrapper, { gridColumn: 'span 2' }]}>
          <label css={labelStyles}>Connection Name</label>
          <input
            css={inputStyles}
            placeholder="SQL #1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div css={[inputFieldWrapper, { gridColumn: 'span 2' }]}>
          <label css={labelStyles}>URL</label>
          <input
            css={extraInputStyles(connMethod === 'full-url')}
            placeholder="mysql://user:password@host.com:3306/your_database"
            value={fullUrl}
            onChange={(e) => setFullUrl(e.target.value)}
            onFocus={() => setConnMethod('full-url')}
          />
        </div>

        <hr css={[dividerStyles, { gridColumn: 'span 2' }]} />

        <div css={[inputFieldWrapper, { gridColumn: 'span 2' }]}>
          <label css={labelStyles}>Manual Connection</label>
          <div css={{ display: 'flex' }}>
            <MenuList
              root
              dropdown
              trigger={
                <div
                  css={{
                    width: 'fit-content',
                    display: 'flex',
                    padding: '8px 8px 8px 12px',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    backgroundColor: cssVar('strongerHighlightColor'),
                    borderRadius: '8px 0px 0px 8px',
                  }}
                >
                  {protocol ?? placeholderList.mysql}
                  <div css={{ width: '16px' }}>
                    <Caret variant="down" />
                  </div>
                </div>
              }
            >
              {Object.entries(placeholderList).map(([key, value]) => (
                <MenuItem
                  onSelect={() => setProtocol(key as ImportElementSource)}
                >
                  <div css={{ minWidth: '136px' }}>{value}</div>
                </MenuItem>
              ))}
            </MenuList>
            <input
              css={[
                extraInputStyles(connMethod === 'manual'),
                { borderRadius: '0px 8px 8px 0px' },
              ]}
              placeholder="database.com"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              onFocus={() => setConnMethod('manual')}
            />
          </div>
        </div>

        <div css={inputFieldWrapper}>
          <label css={labelStyles}>Username</label>
          <input
            css={extraInputStyles(connMethod === 'manual')}
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setConnMethod('manual')}
          />
        </div>

        <div css={inputFieldWrapper}>
          <label css={labelStyles}>Password</label>
          <input
            type="password"
            css={extraInputStyles(connMethod === 'manual')}
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setConnMethod('manual')}
          />
        </div>

        <div css={inputFieldWrapper}>
          <label css={labelStyles}>Database</label>
          <input
            css={extraInputStyles(connMethod === 'manual')}
            placeholder="mydb"
            value={databaseName}
            onChange={(e) => setdatabaseName(e.target.value)}
            onFocus={() => setConnMethod('manual')}
          />
        </div>

        <div css={inputFieldWrapper}>
          <label css={labelStyles}>Port</label>
          <input
            css={extraInputStyles(connMethod === 'manual')}
            placeholder="5432"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            onFocus={() => setConnMethod('manual')}
          />
        </div>

        <div>
          <Button type="secondary">Test Connection</Button>
        </div>

        {error && (
          <div css={errorBlockStyles}>
            <MessageBlock
              type="error"
              icon={<Warning />}
              title="Authorization Error: "
              message={error}
            />
          </div>
        )}
      </div>
      <div css={bottomButtons}>
        <div>
          <Button submit type="primary">
            Add
          </Button>
        </div>
        <div>
          <Button
            type="secondary"
            onClick={() =>
              navigate(workspaces({}).workspace({ workspaceId }).$)
            }
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

const wrapperStyles = css({
  width: '100%',

  display: 'grid',

  gridTemplateColumns: '1fr 1fr',
  gridColumnGap: '10px',

  gridTemplateRows: '1fr 1fr 0.4fr 1fr 1fr 1fr',
  gridRowGap: '10px',
});

const inputFieldWrapper = css({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const extraInputStyles = (isFocused: boolean) =>
  css(inputStyles, {
    ...(isFocused && { border: `1px solid ${brand500.rgb}` }),
  });

const labelStyles = css(p13Bold);

const errorBlockStyles = css({
  gridColumn: 'span 2',
});

const mainWrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  width: '100%',
  height: '100%',
});

const bottomButtons = css({ marginTop: 'auto', display: 'flex', gap: '20px' });
