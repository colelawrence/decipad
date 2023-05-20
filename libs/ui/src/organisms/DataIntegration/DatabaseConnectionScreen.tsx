import { ImportElementSource } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC, useMemo, useState } from 'react';
import { MessageBlock, dividerStyles, inputStyles } from '.';
import { Table as TableIcon, Warning } from '../../icons';
import { brand500, grey500, p13Bold } from '../../primitives';
import { DropdownMenu, SelectItems } from '../DropdownMenu/DropdownMenu';

export type DbOptions = {
  connectionString: string;

  // Credential connection
  host: string;
  username: string;
  password: string;
  database: string;
  port: string;

  existingConn: {
    name: string;
    id: string;
  };

  dbConnType?: 'url' | 'credentials' | 'existing-conn';

  query: string;
};

type ID = string;
interface DatabaseConnectionProps {
  /** First string is the ID, second one if the name */
  existingConnections: Array<[ID, string]>;

  error?: string;
  values: DbOptions;
  setValues: (v: Partial<DbOptions>) => void;
  provider?: ImportElementSource;
}

const placeholderList = {
  mysql: 'mysql://',
  oracledb: 'oracle://',
  gsheets: 'https://',
  json: 'https://',
  postgresql: 'postgresql://',
  mariadb: 'mariadb://',
  mongodb: 'mongodb://',
  mssql: 'mssql://',
  redshift: 'redshift://',
  arrow: 'https://',
  csv: 'https://',
  cockroachdb: 'postgresql://',
  decipad: 'https://',
  sqlite: 'sql://',
};

export const DatabaseConnectionScreen: FC<DatabaseConnectionProps> = ({
  existingConnections,
  error,
  values,
  setValues,
  provider,
}) => {
  const [open, setOpen] = useState(false);

  const items: SelectItems[] = useMemo(
    () =>
      existingConnections.map(
        ([id, name], i) =>
          ({
            group: 'DB Connections',
            item: name,
            blockId: id,
            index: i,
            icon: <TableIcon />,
          } as SelectItems)
      ),
    [existingConnections]
  );

  switch (provider) {
    default:
      return (
        <div css={wrapperStyles}>
          <div css={[inputFieldWrapper, { gridColumn: 'span 2' }]}>
            <label css={labelStyles}>URL</label>
            <input
              css={extraInputStyles(values.dbConnType, 'url')}
              placeholder={
                provider ? placeholderList[provider] || 'https://' : 'https://'
              }
              value={values.connectionString}
              onChange={(e) => setValues({ connectionString: e.target.value })}
              onFocus={() => setValues({ dbConnType: 'url' })}
            />
          </div>

          <hr css={[dividerStyles, { gridColumn: 'span 2' }]} />

          <div css={inputFieldWrapper}>
            <label css={labelStyles}>Host</label>
            <input
              css={extraInputStyles(values.dbConnType, 'credentials')}
              placeholder="database.com"
              onFocus={() => setValues({ dbConnType: 'credentials' })}
              value={values.host}
              onChange={(e) => setValues({ host: e.target.value })}
            />
          </div>

          <div css={inputFieldWrapper}>
            <label css={labelStyles}>Username</label>
            <input
              css={extraInputStyles(values.dbConnType, 'credentials')}
              placeholder="admin"
              onFocus={() => setValues({ dbConnType: 'credentials' })}
              value={values.username}
              onChange={(e) => setValues({ username: e.target.value })}
            />
          </div>

          <div css={inputFieldWrapper}>
            <label css={labelStyles}>Password</label>
            <input
              type="password"
              css={extraInputStyles(values.dbConnType, 'credentials')}
              placeholder="password"
              onFocus={() => setValues({ dbConnType: 'credentials' })}
              value={values.password}
              onChange={(e) => setValues({ password: e.target.value })}
            />
          </div>

          <div css={inputFieldWrapper}>
            <label css={labelStyles}>Database</label>
            <input
              css={extraInputStyles(values.dbConnType, 'credentials')}
              placeholder="mydb"
              onFocus={() => setValues({ dbConnType: 'credentials' })}
              value={values.database}
              onChange={(e) => setValues({ database: e.target.value })}
            />
          </div>

          <div css={inputFieldWrapper}>
            <label css={labelStyles}>Port</label>
            <input
              css={extraInputStyles(values.dbConnType, 'credentials')}
              placeholder="5432"
              onFocus={() => setValues({ dbConnType: 'credentials' })}
              value={values.port}
              onChange={(e) => setValues({ port: e.target.value })}
            />
          </div>

          {items.length > 0 && (
            <>
              <hr css={[dividerStyles, { gridColumn: 'span 2' }]} />
              <div>
                <label css={labelStyles}>
                  Or you can use an existing connection
                </label>
                <DropdownMenu
                  open={open}
                  setOpen={() => {
                    setOpen(!open);
                    setValues({ dbConnType: 'existing-conn' });
                  }}
                  onExecute={(item) => {
                    setValues({ dbConnType: 'existing-conn' });
                    setValues({
                      existingConn: { id: item.blockId || '', name: item.item },
                    });
                  }}
                  groups={items}
                >
                  <div
                    css={[
                      extraInputStyles(values.dbConnType, 'existing-conn'),
                      inputFieldWrapper,
                      triggerStyles,
                    ]}
                  >
                    <span>
                      {values.existingConn.name.length > 0
                        ? values.existingConn.name
                        : 'Existing Connection'}
                    </span>
                  </div>
                </DropdownMenu>
              </div>
            </>
          )}

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
      );
  }
};

const wrapperStyles = css({
  width: '100%',

  display: 'grid',

  gridTemplateColumns: '1fr 1fr',
  gridColumnGap: '10px',

  gridTemplateRows: '1.2fr 0.1fr 1fr 1fr 1fr',
  gridRowGap: '10px',
});

const inputFieldWrapper = css({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const extraInputStyles = (
  type: DbOptions['dbConnType'],
  wanted: DbOptions['dbConnType']
) =>
  css(inputStyles, {
    ...(type === wanted && { border: `1px solid ${brand500.rgb}` }),
  });

const labelStyles = css(p13Bold);

const triggerStyles = css({
  display: 'flex',
  justifyContent: 'center',
  color: grey500.rgb,
});

const errorBlockStyles = css({
  gridColumn: 'span 2',
});
