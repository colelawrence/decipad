/* eslint-disable decipad/css-prop-named-variable */
import { ImportElementSource } from '@decipad/editor-types';
import { useWorkspaceExternalData } from '@decipad/graphql-client';
import { workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import { BackendUrl } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageBlock } from '.';
import { Caret, Integrations, Warning } from '../../../icons';
import { cssVar, p13Bold, p14Medium } from '../../../primitives';
import { useCancelingEvent } from '../../../utils';
import { Button, MenuItem } from '../../atoms';
import {
  MenuList,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '../../molecules';
import { IntegrationActionItem } from './IntegrationStyles';

interface DatabaseConnectionProps {
  workspaceId: string;
}

type EditConnectionValues = {
  id: string | number;
  name: string;
  fullUrl: string;
};

const placeholderList: Partial<Record<ImportElementSource, string>> = {
  mysql: 'mysql://',
  oracledb: 'oracle://',
  postgresql: 'postgresql://',
  mariadb: 'mariadb://',
  mssql: 'mssql://',
  redshift: 'redshift://',
  cockroachdb: 'postgresql://',
};

const databases = Object.keys(placeholderList);

export const DatabaseConnectionScreen: FC<DatabaseConnectionProps> = ({
  workspaceId,
}) => {
  const [isAddingNewConnection, setIsAddingNewConnection] = useState(false);
  const [editConnectionValues, setEditConnectionValues] = useState<
    EditConnectionValues | undefined
  >(undefined);

  const { workspaceExternalData, remove } =
    useWorkspaceExternalData(workspaceId);

  if (isAddingNewConnection) {
    return (
      <NewDataConnection
        workspaceId={workspaceId}
        onExit={() => setIsAddingNewConnection(false)}
        initialValues={editConnectionValues}
        resetInitialValues={() => setEditConnectionValues(undefined)}
      />
    );
  }

  return (
    <div css={mainWrapperStyles}>
      <div>
        <p css={p14Medium}>
          Configure SQL connections to enable seamless database interactions
          within your workspace. Once defined, these connections are accessible
          to all workspace members to use. This setup ensures that the actual
          database credentials remain secure and undisclosed.
        </p>
      </div>
      <div>
        <Button
          type="tertiaryAlt"
          onClick={() => setIsAddingNewConnection(true)}
        >
          Add a New Connection
        </Button>
      </div>

      <span css={p14Medium}>Existing Connections</span>
      {workspaceExternalData
        ?.filter((d) => databases.includes(d.provider))
        .map((externalData) => {
          return (
            <IntegrationActionItem
              icon={<Integrations />}
              title={externalData.dataSourceName ?? ''}
              description=""
              onEdit={() => {
                if (!externalData.externalId) {
                  throw new Error('External ID should be present');
                }
                if (!externalData.dataSourceName) {
                  throw new Error('Datasource should always have a name');
                }
                setEditConnectionValues({
                  id: externalData.id,
                  name: externalData.dataSourceName,
                  fullUrl: externalData.externalId,
                });
                setIsAddingNewConnection(true);
              }}
              onDelete={() => {
                remove(externalData.id);
              }}
              onClick={() => {}}
            />
          );
        })}
    </div>
  );
};

interface NewDataConnectionProps {
  workspaceId: string;
  onExit: () => void;
  initialValues?: EditConnectionValues;
  resetInitialValues: () => void;
}

type ConnType = 'full-url' | 'manual';

function NewDataConnection({
  workspaceId,
  onExit,
  initialValues,
  resetInitialValues,
}: NewDataConnectionProps): JSX.Element {
  // --- Input Field States --- //
  const [name, setName] = useState(initialValues?.name ?? '');
  const [fullUrl, setFullUrl] = useState(initialValues?.fullUrl ?? '');
  const [host, setHost] = useState('');
  const [protocol, setProtocol] = useState<ImportElementSource>('mysql');
  const [databaseName, setdatabaseName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [port, setPort] = useState('');

  const [connMethod, setConnMethod] = useState<ConnType>('full-url');

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const [pingStatus, setPingStatus] = useState<
    'Pinging...' | 'Connection Worked' | 'Connection Failed' | undefined
  >(undefined);

  const toast = useToast();
  const navigate = useNavigate();
  const { add, update } = useWorkspaceExternalData(workspaceId);

  const resetOnFocus = useCallback(() => {
    setPingStatus(undefined);
    setErrorMessage(undefined);
  }, []);

  function pingDatabase() {
    setPingStatus('Pinging...');

    const url =
      connMethod === 'full-url'
        ? fullUrl
        : `${protocol}://${encodeURIComponent(username)}:${encodeURIComponent(
            password
          )}@${host}:${port}/${databaseName}`;

    fetch(BackendUrl.pingDatabase(), {
      method: 'POST',
      body: url,
    })
      .then((res) => {
        if (res.status === 200) {
          setPingStatus('Connection Worked');
        } else {
          res.json().then((body) => {
            setErrorMessage(body.message);
          });
          setPingStatus('Connection Failed');
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage(err.message);
        setPingStatus('Connection Failed');
      });
  }

  // Function would get recreated too many times with `useCallback`
  const onSubmitConnection = useCancelingEvent(() => {
    if (!connMethod) return;

    if (name.length === 0) {
      setErrorMessage('Connection should have a name');
      return;
    }

    if (
      connMethod === 'manual' &&
      !(host.length > 0 && databaseName.length > 0 && username.length > 0)
    ) {
      setErrorMessage('You must fill out all the fields');
      return;
    }

    if (connMethod === 'full-url' && fullUrl.length === 0) {
      setErrorMessage('URL was empty');
      return;
    }

    const url =
      connMethod === 'full-url'
        ? fullUrl
        : `${protocol}://${username}:${encodeURIComponent(
            password
          )}@${host}:${port}/${databaseName}`;

    if (initialValues) {
      update(initialValues.id as string, {
        dataSourceName: name,
        name: `data-source/${workspaceId}/${protocol}/${url}`,
        externalId: url,
      }).then((success) => {
        if (success) {
          toast('Successfully updated connection', 'success');
          navigate(
            workspaces({}).workspace({
              workspaceId,
            }).$
          );
        } else {
          toast('Error updating connection', 'error');
        }
      });
      resetInitialValues();
      return;
    }

    add({
      name: `data-source/${workspaceId}/${protocol}/${url}`,
      externalId: url,
      workspaceId,
      padId: undefined, // Resource belongs to the workspace, and not a specific notebook
      provider: 'postgresql',
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
  });

  return (
    <form
      css={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
      onSubmit={onSubmitConnection}
    >
      <div css={wrapperStyles}>
        <input type="submit" hidden />
        <div css={[inputFieldWrapper, { gridColumn: 'span 2' }]}>
          <label css={labelStyles} htmlFor="sql-conn-name">
            Connection Name
          </label>
          <input
            id="sql-conn-name"
            css={inputStyles}
            placeholder="SQL #1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={resetOnFocus}
          />
        </div>

        <TabsRoot
          styles={css({ width: '100%' })}
          defaultValue={connMethod}
          onValueChange={(newValue: string) => {
            if (['full-url', 'manual'].includes(newValue as ConnType)) {
              setConnMethod(newValue as ConnType);
            } else {
              console.warn('Invalid tab value:', newValue);
            }
          }}
        >
          <TabsList>
            <TabsTrigger
              name="full-url"
              trigger={{
                label: 'SQL URL',
                disabled: false,
              }}
            />
            <TabsTrigger
              name="manual"
              trigger={{
                label: 'Advanced Configuration',
                disabled: false,
              }}
            />
          </TabsList>

          <TabsContent name="full-url">
            <div css={tabsContentStyles}>
              <div css={inputFieldWrapper}>
                <label css={labelStyles} htmlFor="sql-url">
                  SQL URL (Containing credentials, port and database host)
                </label>
                <input
                  id="sql-url"
                  css={inputStyles}
                  placeholder="mysql://user:password@host.com:3306/your_database"
                  value={fullUrl}
                  onChange={(e) => setFullUrl(e.target.value)}
                  onFocus={resetOnFocus}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent name="manual">
            <div css={tabsContentStyles}>
              <div css={[inputFieldWrapper, { gridColumn: 'span 2' }]}>
                <label css={labelStyles} htmlFor="manual-conn-url">
                  Advanced Configuration
                </label>
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
                          backgroundColor: cssVar('borderSubdued'),
                          borderRadius: '8px 0px 0px 8px',
                        }}
                        data-testid="connection-protocol"
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
                    id="manual-conn-url"
                    css={[inputStyles, { borderRadius: '0px 8px 8px 0px' }]}
                    placeholder="database.com"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    onFocus={resetOnFocus}
                  />
                </div>
              </div>

              <div css={inputGridStyles}>
                <div css={inputFieldWrapper}>
                  <label css={labelStyles} htmlFor="manual-conn-username">
                    Username
                  </label>
                  <input
                    id="manual-conn-username"
                    css={inputStyles}
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={resetOnFocus}
                  />
                </div>

                <div css={inputFieldWrapper}>
                  <label css={labelStyles} htmlFor="manual-conn-password">
                    Password
                  </label>
                  <input
                    id="manual-conn-password"
                    type="password"
                    css={inputStyles}
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={resetOnFocus}
                  />
                </div>

                <div css={inputFieldWrapper}>
                  <label css={labelStyles} htmlFor="manual-conn-db">
                    Database
                  </label>
                  <input
                    id="manual-conn-db"
                    css={inputStyles}
                    placeholder="mydb"
                    value={databaseName}
                    onChange={(e) => setdatabaseName(e.target.value)}
                    onFocus={resetOnFocus}
                  />
                </div>

                <div css={inputFieldWrapper}>
                  <label css={labelStyles} htmlFor="manual-conn-port">
                    Port
                  </label>
                  <input
                    id="manual-conn-port"
                    css={inputStyles}
                    placeholder="5432"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    onFocus={resetOnFocus}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </TabsRoot>

        <div css={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div>
            <Button type="tertiaryAlt" onClick={pingDatabase}>
              Test Connection
            </Button>
          </div>
          <span
            css={[
              pingStatus === 'Connection Worked' ||
              pingStatus === 'Connection Failed'
                ? {
                    color:
                      pingStatus === 'Connection Worked'
                        ? cssVar('stateOkText')
                        : cssVar('stateWarningBackground'),
                  }
                : {},
            ]}
          >
            {pingStatus}
          </span>
        </div>

        {errorMessage && (
          <div css={errorBlockStyles}>
            <MessageBlock
              type="error"
              icon={<Warning />}
              title="Error: "
              message={errorMessage}
            />
          </div>
        )}
      </div>
      <div css={bottomButtons}>
        <div>
          <Button submit type="primary" testId="add-conn-button">
            Add
          </Button>
        </div>
        <div>
          <Button type="secondary" onClick={onExit}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

const wrapperStyles = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const tabsContentStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '12px 0px',
});

const inputGridStyles = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
});

const inputFieldWrapper = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
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

const bottomButtons = css({
  marginTop: 'auto',
  display: 'flex',
  gap: '20px',
  gridColumn: 'span 2',
});

const inputStyles = css({
  background: cssVar('backgroundDefault'),
  borderRadius: '6px',
  padding: '6px 12px',
  border: `1px solid ${cssVar('borderDefault')}`,

  width: '100%',
});
