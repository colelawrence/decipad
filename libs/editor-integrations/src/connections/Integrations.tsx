import { useNotebookMetaData } from '@decipad/react-contexts';
import {
  Badge,
  Button,
  ContentEditableInput,
  LiveCode,
  S,
  SearchFieldWithDropdown,
  SelectIntegration,
  Toggle,
  WrapperIntegrationModalDialog,
} from '@decipad/ui';
import type { FC, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useWorkspaceDatasets } from '../hooks';
import { ImportElementSource } from '@decipad/editor-types';
import { UpgradeWarningBlock } from '@decipad/editor-components';
import { IntegrationList } from './IntegrationList';
import {
  ArrowBack2,
  CaretDown,
  CaretRight,
  Close,
  MagnifyingGlass,
} from 'libs/ui/src/icons';
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
  DatasetBadge,
  DatasetCollapsibleTrigger,
  PreviewActionsWrapper,
} from './styles';
import { Dataset } from '@decipad/interfaces';
import { ThumbnailCsv } from 'libs/ui/src/icons/thumbnail-icons';
import { useConcreteIntegration } from './useCreateIntegration';
import { InlineMenuItem } from 'libs/ui/src/modules/editor/InlineMenuItem/InlineMenuItem';
import { PortalledPreview } from './ResultPreview';
import * as Collapsible from '@radix-ui/react-collapsible';

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
            testId="integration-modal-continue"
          >
            Save
          </Button>
        </DataDrawerButtonWrapper>
      );
  }
};

const SidebarPreviewActions: FC<ConnectionProps> = ({
  runner,
  onRun,
  stage,
}) => {
  if (stage !== 'map') {
    return null;
  }

  return (
    <PreviewActionsWrapper>
      {'isFirstHeaderRow' in runner.options.importer &&
        typeof runner.options.importer.isFirstHeaderRow === 'boolean' && (
          <div>
            <p>Use first row as header</p>
            <Toggle
              variant="small-toggle"
              active={runner.options.importer.isFirstHeaderRow}
              onChange={(isFirstRowHeader) => {
                if (!('isFirstHeaderRow' in runner.options.importer)) return;
                runner.setOptions({
                  importer: { isFirstHeaderRow: isFirstRowHeader },
                });
                onRun();
              }}
            />
          </div>
        )}
    </PreviewActionsWrapper>
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
      {createPortal(
        !(
          (props.runner.type === 'code' || props.runner.type === 'mySql') &&
          props.stage === 'connect'
        ) && (
          <PortalledPreview
            {...props}
            varNameInput={
              props.type === 'create' && (
                <LiveCode type="table" meta={[]}>
                  <ContentEditableInput
                    value={props.varName}
                    onChange={props.onChangeVarName}
                  />
                </LiveCode>
              )
            }
          />
        ),
        document.getElementById('data-drawer-content')!
      )}
    </>
  );
};

const ConcreteIntegration: FC<ConcreteIntegrationProps> = (props) => {
  const { onClose, connectionProps, onContinue } =
    useConcreteIntegration(props);

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
      onClose={onClose}
      onBack={props.onReset}
    >
      <Connection {...connectionProps} />
      <Preview {...connectionProps} />
      <span />
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
  const [open, setOpen] = useState(() => dataSets.length < 8);
  return (
    <Collapsible.Root asChild open={open} onOpenChange={setOpen}>
      <ActiveDataSetsWrapper>
        <Collapsible.CollapsibleTrigger css={DatasetCollapsibleTrigger}>
          {open ? <CaretDown /> : <CaretRight />}
          <p>Active Datasets</p>
          <Badge styles={DatasetBadge}>{dataSets.length}</Badge>
        </Collapsible.CollapsibleTrigger>
        <Collapsible.Content>
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
        </Collapsible.Content>
      </ActiveDataSetsWrapper>
    </Collapsible.Root>
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
