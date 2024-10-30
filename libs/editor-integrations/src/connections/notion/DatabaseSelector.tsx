/* eslint-disable no-param-reassign */
import { FC, useEffect, useState } from 'react';
import { ConnectionProps } from '../types';
import {
  getExternalDataReqUrl,
  getExternalDataUrl,
  getNotionQueryDbLink,
} from '../../utils';
import { LoadingIndicator, MenuItem, MenuList } from '@decipad/ui';
import { Styles } from './styles';
import { CaretDown, CaretUp } from 'libs/ui/src/icons';
import { ExternalDataSourceFragmentFragment } from '@decipad/graphql-client';
import { importDatabases } from '@decipad/import';
import { NotionRunner } from '../../runners';
import { assertInstanceOf } from '@decipad/utils';

const DATABASES_CACHE = new Map<string, Array<{ id: string; name: string }>>();

const NotionPrivateDatabasesSelector: FC<ConnectionProps> = ({
  externalData: _externalData,
  runner,
  onRun,
}) => {
  assertInstanceOf(runner, NotionRunner);
  if (_externalData == null) {
    throw new Error('Checked in comp above');
  }
  const externalData = _externalData as ExternalDataSourceFragmentFragment;

  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    async function getDatabases() {
      setIsFetching(true);

      const hasCachedDatabase = DATABASES_CACHE.has(externalData.id);
      if (hasCachedDatabase) {
        setIsFetching(false);
        return;
      }

      const notionDatabaseResponse = await fetch(
        getExternalDataReqUrl(externalData.id, 'getAllDatabases')
      );

      const notionDatabases = await notionDatabaseResponse.json();
      DATABASES_CACHE.set(externalData.id, importDatabases(notionDatabases));
      setIsFetching(false);
    }

    getDatabases();
  }, [externalData.id]);

  const databases = DATABASES_CACHE.get(externalData.id);

  const getTriggerChildren = () => {
    if (isFetching) {
      return <LoadingIndicator />;
    }

    const databaseName = runner.resourceName;

    if (databaseName == null) {
      return 'Select Database';
    }

    if (databaseName.length === 0) {
      return 'Unnamed Database';
    }

    return databaseName;
  };

  if (databases?.length === 0 && !isFetching) {
    return <p>No databases found.</p>;
  }

  return (
    <MenuList
      root
      dropdown
      open={open}
      onChangeOpen={(o) => {
        if (isFetching) return;
        setOpen(o);
      }}
      trigger={
        <Styles.Trigger>
          {getTriggerChildren()}

          {open ? <CaretUp /> : <CaretDown />}
        </Styles.Trigger>
      }
    >
      {databases?.map((db) => (
        <MenuItem
          key={db.id}
          css={{ minWidth: '240px' }}
          onSelect={() => {
            runner.setResourceName(db.name);
            runner.setOptions({
              runner: {
                notionUrl: getExternalDataUrl(externalData.id, {
                  url: encodeURI(getNotionQueryDbLink(db.id)),
                  method: 'POST',
                }),
              },
            });
            onRun();
          }}
        >
          {db.name.length > 0 ? db.name : 'Unnamed Database'}
        </MenuItem>
      ))}
    </MenuList>
  );
};

export const NotionPrivateDatabases: FC<ConnectionProps> = (props) => {
  if (props.externalData == null) {
    return null;
  }

  return <NotionPrivateDatabasesSelector {...props} />;
};
