import { useNotebookMetaData } from '@decipad/react-contexts';
import {
  Button,
  Input,
  S,
  SearchFieldWithDropdown,
  SelectIntegration,
  Toggle,
  WrapperIntegrationModalDialog,
} from '@decipad/ui';
import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspaceDatasets } from '../hooks';
import { ImportElementSource } from '@decipad/editor-types';
import { UpgradeWarningBlock } from '@decipad/editor-components';
import { IntegrationList } from './IntegrationList';
import { ArrowBack2, Close, MagnifyingGlass } from 'libs/ui/src/icons';
import { useComputer } from '@decipad/editor-hooks';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { Connection } from './Connection';
import { createPortal } from 'react-dom';
import {
  ConcreteIntegrationProps,
  ConnectionProps,
  IntegrationProps,
} from './types';
import {
  ActiveDataSetsWrapper,
  AllServicesWrapper,
  DataDrawerButtonWrapper,
} from './styles';
import { Dataset } from '@decipad/interfaces';
import { ThumbnailCsv } from 'libs/ui/src/icons/thumbnail-icons';
import { useConcreteIntegration } from './useCreateIntegration';
import { InlineMenuItem } from 'libs/ui/src/modules/editor/InlineMenuItem/InlineMenuItem';
import { PortalledPreview } from './ResultPreview';
import { debounce } from 'lodash';

import type {
  Code,
  Csv,
  GSheets,
  MySql,
  Notion,
} from 'libs/compute-backend-js/src/wasm/compute_backend';
import { Loading } from './shared';
import { GSheetRunner } from '@decipad/notebook-tabs';

type DataDrawerButtonProps = {
  type: 'create' | 'edit';
  canContinue?: boolean;
  onContinue: () => void;
  onBack: () => void;
};

const DataDrawerButtons: FC<DataDrawerButtonProps> = ({
  type,
  onContinue,
  canContinue,
}) => {
  switch (type) {
    case 'create':
      return (
        <DataDrawerButtonWrapper>
          <Button
            type="primary"
            onClick={onContinue}
            disabled={!(canContinue ?? true)}
            testId="integration-modal-continue"
          >
            Add
          </Button>
        </DataDrawerButtonWrapper>
      );
    case 'edit':
      return (
        <DataDrawerButtonWrapper>
          <Button
            type="primary"
            onClick={onContinue}
            disabled={!(canContinue ?? true)}
            testId="integration-modal-continue"
          >
            Save
          </Button>
        </DataDrawerButtonWrapper>
      );
  }
};

const ImporterOptions: {
  [kind: string]:
    | FC<{
        conn: ConnectionProps;
        value: any;
        label: string;
        placeholder?: string;
        // eslint-disable-next-line unused-imports/no-unused-vars
        onChange: (val: any, newRunnerOptions?: Record<string, any>) => void;
      }>
    | undefined;
} = {
  boolean: ({ onChange, value, label }) => {
    return (
      <Toggle
        variant="small-toggle"
        active={value}
        label={label}
        onChange={onChange}
      />
    );
  },
  string: ({ onChange, value, label, placeholder }) => {
    return (
      <Input
        variant="small"
        value={value}
        label={label}
        placeholder={placeholder}
        onChange={onChange}
      />
    );
  },
  range: ({ onChange, conn, label, placeholder }) => {
    return (
      <Input
        variant="small"
        value={conn.runner.options.runner.range}
        label={label}
        placeholder={placeholder}
        pattern="([A-z]+\d+):([A-z]+\d+)"
        onChange={(v) => {
          const value = v.currentTarget.value.toUpperCase();
          const range = GSheetRunner.parseRange(value);
          if (!range) return;
          onChange(range, { range: value });
        }}
      />
    );
  },
} as const;

type OptionUnion = Csv & MySql & Code & Notion & GSheets;
const ImportKeyNames: {
  [K in keyof OptionUnion]: string | { label: string; placeholder: string };
} = {
  isFirstHeaderRow: 'Use first row as header',
  range: { label: 'Input cell range (optional)', placeholder: 'e.g. A1:D40' },
};
const ImportKeyTypes: { [K in keyof OptionUnion]: string } = {
  isFirstHeaderRow: 'boolean',
  range: 'range',
};
const ImportKeyOrder: { [K in keyof OptionUnion]: number } = {
  range: 1,
  isFirstHeaderRow: 5,
};

const SidebarPreviewActions: FC<ConnectionProps> = (conn) => {
  const [options, setOptions] = useState(conn.runner.options.importer);

  // TODO (alan): not sure what's wrong with this
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(
    debounce(() => {
      conn.onRun();
    }, 500),
    [conn.onRun, options]
  );

  const computer = useComputer();
  const result = computer.getBlockIdResult$.use(conn.id);
  if (result?.type !== 'computer-result') {
    return <></>;
  }

  return (
    <>
      {Object.entries(options)
        .sort(
          ([k1, _v1], [k2, _v2]) =>
            ImportKeyOrder[k1 as keyof OptionUnion] -
            ImportKeyOrder[k2 as keyof OptionUnion]
        )
        .map(([k, v]) => {
          const InputComponent =
            ImporterOptions[ImportKeyTypes[k as keyof OptionUnion]];
          if (!InputComponent) return <></>;
          const txt = ImportKeyNames[k as keyof typeof ImportKeyNames] ?? k;
          const label = typeof txt === 'string' ? txt : txt.label;
          const placeholder =
            typeof txt === 'string' ? undefined : txt.placeholder;
          return (
            <InputComponent
              key={k}
              conn={conn}
              label={label}
              placeholder={placeholder}
              value={v}
              onChange={(importerVal, runnerVal) => {
                const newImporter = { ...options, [k]: importerVal };
                setOptions(newImporter);
                conn.runner.setOptions({
                  importer: newImporter,
                  runner: runnerVal && {
                    ...conn.runner.options.runner,
                    ...runnerVal,
                  },
                });
                reload();
              }}
            />
          );
        })}
    </>
  );
};

const Preview: FC<ConnectionProps> = (props) => {
  const isDataDrawerOpen = useNotebookWithIdState((s) => s.isDataDrawerOpen);

  if (!isDataDrawerOpen) {
    return null;
  }

  return (
    <>
      <SidebarPreviewActions {...props} />
      <span style={{ flexGrow: '1' }} />
      <Loading info={props.info} />
      {createPortal(
        !(props.runner.type === 'code' || props.runner.type === 'mySql') && (
          <PortalledPreview
            {...props}
            // varNameInput={
            //  <LiveCode type="table" meta={[]}>
            //    <ContentEditableInput
            //      value={props.varName}
            //      onChange={props.onChangeVarName}
            //    />
            //  </LiveCode>
            // }
          />
        ),
        document.getElementById('data-drawer-content')!
      )}
    </>
  );
};

const ConcreteIntegration: FC<ConcreteIntegrationProps> = (props) => {
  const { connectionProps, onContinue } = useConcreteIntegration(props);

  useOpenDataDrawer();
  const computer = useComputer();
  const result = computer.getBlockIdResult$.use(connectionProps.id);

  const lastLog = connectionProps.info.at(-1);

  return (
    <WrapperIntegrationModalDialog
      title="Connect to your data"
      infoPanel={
        <UpgradeWarningBlock
          type="queries"
          variant="block"
          workspaceId={props.workspaceId}
        />
      }
      onClose={props.onReset}
      onBack={props.onReset}
    >
      <Connection {...connectionProps} />
      <Preview {...connectionProps} />
      <DataDrawerButtons
        canContinue={
          lastLog?.status !== 'run' &&
          lastLog?.status !== 'error' &&
          lastLog?.status !== 'warning' &&
          result?.type === 'computer-result' &&
          result.result.type.kind !== 'pending'
        }
        onBack={props.onReset}
        type={props.type}
        onContinue={onContinue}
      />
    </WrapperIntegrationModalDialog>
  );
  // <PortalledDataDrawerButtons
  //  type={props.type}
  //  onContinue={onContinue}
  //  onBack={onBack}
  /// >
};

const EmptyWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const [setSidebar, popSidebar] = useNotebookMetaData((s) => [
    s.setSidebar,
    s.popSidebar,
  ]);

  return (
    <S.IntegrationWrapper>
      <S.CloseIconWrapper>
        <Button type="minimal" onClick={popSidebar}>
          <ArrowBack2 />
        </Button>
        <h2>Integrations</h2>
        <span />
        <Button type="minimal" onClick={() => setSidebar({ type: 'closed' })}>
          <Close />
        </Button>
      </S.CloseIconWrapper>
      <main>{children}</main>
    </S.IntegrationWrapper>
  );
};

const useOpenDataDrawer = (): void => {
  const [onSetIntegration, onSetHeight, onCloseDataDrawer, isClosing] =
    useNotebookWithIdState(
      (s) =>
        [s.setIntegration, s.setHeight, s.closeDataDrawer, s.isClosing] as const
    );

  const setSidebar = useNotebookMetaData((s) => s.setSidebar);

  useEffect(() => {
    if (isClosing) {
      setSidebar({ type: 'closed' });
    }
  }, [isClosing, setSidebar]);

  useEffect(() => {
    onSetIntegration();
    onSetHeight(500);

    return onCloseDataDrawer;
  }, [onSetIntegration, onSetHeight, onCloseDataDrawer]);
};

const ActiveDataSets: FC<{
  dataSets: Dataset[];
  onSelectDataset: (_dataset: Dataset) => void;
}> = ({ dataSets, onSelectDataset }) => {
  return (
    <ActiveDataSetsWrapper>
      <p>Active Datasets</p>
      <div>
        {dataSets.map((set) => (
          <InlineMenuItem
            key={set.dataset.id}
            icon={<ThumbnailCsv />}
            title={
              set.type === 'attachment'
                ? set.dataset.fileName
                : set.dataset.name
            }
            enabled={true}
            onExecute={() => onSelectDataset(set)}
            description={`Size: ${
              set.type === 'attachment'
                ? Math.round(set.dataset.fileSize / 100_000) / 10
                : '0'
            }MB`}
          />
        ))}
      </div>
    </ActiveDataSetsWrapper>
  );
};

/**
 * Entry component for creating a new integration.
 */
export const Integrations: FC<IntegrationProps> = (props) => {
  const [connectionType, setConnectionType] = useState<
    ImportElementSource | undefined
  >(props.type === 'edit' ? props.connectionType : undefined);

  const [existingDataset, setExistingDataset] = useState<Dataset | undefined>(
    undefined
  );

  const [search, setSearch] = useState('');
  const [setSidebar] = useNotebookMetaData((s) => [s.setSidebar]);

  const integrations = useMemo(
    () =>
      IntegrationList.filter(
        (i) =>
          search.length === 0 || i.title.toLowerCase().indexOf(search) !== -1
      ),
    [search]
  );

  const dataSets = useWorkspaceDatasets(props.workspaceId);
  const filteredDataSets = useMemo(
    () =>
      dataSets.filter(
        (set) =>
          search.length === 0 ||
          (set.type === 'attachment' ? set.dataset.fileName : set.dataset.name)
            .toLowerCase()
            .indexOf(search) !== -1
      ),
    [dataSets, search]
  );

  if (connectionType == null) {
    return (
      <EmptyWrapper>
        <SearchFieldWithDropdown
          searchTerm={search}
          onSearchChange={(newValue) => {
            setSearch(newValue.toLocaleLowerCase());
          }}
          placeholder={'Search'}
          icon={<MagnifyingGlass />}
        />
        {filteredDataSets.length > 0 && (
          <ActiveDataSets
            dataSets={filteredDataSets}
            onSelectDataset={(dataset) => {
              setExistingDataset(dataset);

              // Currently the only one we support.
              setConnectionType('csv');
            }}
          />
        )}
        {integrations.length > 0 && (
          <AllServicesWrapper>
            <p>All services</p>
            <SelectIntegration
              integrations={integrations}
              onSelectIntegration={(type) => {
                setExistingDataset(undefined);
                setConnectionType(type);
              }}
            />
          </AllServicesWrapper>
        )}
        {integrations.length + filteredDataSets.length === 0 && (
          <p>No integrations found!</p>
        )}
      </EmptyWrapper>
    );
  }

  return (
    <ConcreteIntegration
      {...props}
      onReset={() => {
        setExistingDataset(undefined);
        setConnectionType(undefined);
        setSidebar({ type: 'integrations' });
      }}
      connectionType={connectionType}
      existingDataset={existingDataset}
    />
  );
};
