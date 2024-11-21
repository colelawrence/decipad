import {
  ConcreteIntegrationProps,
  ConnectionProps,
  UseConcreteIntegrationReturn,
} from './types';
import { TExecution } from '@decipad/interfaces';
import { useNotebookMetaData, useResourceUsage } from '@decipad/react-contexts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNotebookRoute } from '@decipad/routing';
import { useClientEvents } from '@decipad/client-events';
import { useComputer } from '@decipad/editor-hooks';
import { nanoid } from 'nanoid';
import { getExprRef } from '@decipad/computer';
import { useCreateIntegration } from '../hooks';
import { assertInstanceOf } from '@decipad/utils';
import { TypeMap } from 'libs/editor-types/src/integrations';
import { pushDeleteExternalData } from '@decipad/computer-utils';
import { useToast } from '@decipad/toast';
import {
  CSVRunner,
  CodeRunner,
  GSheetRunner,
  RunnerFactoryParams,
  useRunner,
} from '@decipad/notebook-tabs';

export const useConcreteIntegration = (
  props: ConcreteIntegrationProps
): UseConcreteIntegrationReturn => {
  const { type, workspaceId, connectionType, existingDataset, onReset } = props;
  const setSidebar = useNotebookMetaData((s) => s.setSidebar);
  const { queries } = useResourceUsage();
  const [info, onExecute] = useState<Array<TExecution>>([]);

  const { notebookId } = useNotebookRoute();

  const track = useClientEvents();

  useEffect(() => {
    track({
      segmentEvent: {
        type: 'action',
        action: 'Notebook Integrations Modal Viewed',
        props: {
          integration_type: connectionType as any,
          analytics_source: 'backend',
        },
      },
    });
  }, [connectionType, track]);

  const [externalData, setExternalData] =
    useState<ConnectionProps['externalData']>(undefined);

  const [stage, setStage] = useState<ConnectionProps['stage']>(
    props.type === 'create' && existingDataset == null ? 'connect' : 'map'
  );

  const computer = useComputer();

  const [blockId] = useState(nanoid());
  const [varName, setVarName] = useState(() => {
    if (props.type === 'create') {
      return computer.getAvailableIdentifier('Table', 1, true);
    }

    // Return random varname because it doesnt actually matter. It's just for editing
    // Cursed. But expr_ref's are ignored by the number catalogue.
    return getExprRef(nanoid());
  });

  const [hiddenColumns, setHiddenColumns] = useState<Array<string>>(() => {
    if (props.integrationBlock == null) {
      return [];
    }

    return Object.entries(props.integrationBlock.typeMappings)
      .filter(([_, v]) => v?.isHidden)
      .map(([k]) => k);
  });

  const integration = useMemo(
    () => (props.type === 'create' ? undefined : props.integrationBlock),
    [props]
  );
  const runner = useRunner({
    notebookId,
    computer,
    name: varName,
    id: blockId,
    integration,
    integrationType:
      props.type === 'create' ? (props.connectionType as any) : undefined,
    types: {},
    hiddenColumns: [],
    filters: [],
  } as RunnerFactoryParams);

  const onCreateIntegration = useCreateIntegration(runner, props);

  const toast = useToast();
  const run = useCallback(async () => {
    if (queries.hasReachedLimit) return;

    const logSub =
      runner instanceof CodeRunner
        ? runner.logs.subscribe((m) => {
            onExecute((v) => [
              ...v,
              ...m.logs.map((log) => ({ status: 'log' as const, log })),
            ]);
          })
        : undefined;

    onExecute([]);
    onExecute((v) => [...v, { status: 'run' }]);

    if (externalData != null && runner instanceof GSheetRunner) {
      runner.setExternalDataId(externalData.id);
    }

    await runner
      .import(computer)
      .then(() => {
        onExecute((v) => [...v, { status: 'success', ok: true }]);
        toast.success('Integration loaded successfully!');
      })
      .catch((err) => {
        console.error('error importing:', err);
        onExecute((v) => [...v, { status: 'error', err: err.message }]);
        toast.error('Error importing integration!');
      })
      .finally(() => {
        if (logSub == null) {
          return;
        }

        logSub.unsubscribe();
      });
  }, [queries, runner, toast, externalData, computer]);

  useEffect(() => {
    runner.name = varName;
  }, [runner, varName]);

  useEffect(() => {
    if (existingDataset === undefined) {
      return;
    }

    if (existingDataset.type !== 'attachment') {
      return;
    }

    assertInstanceOf(runner, CSVRunner);
    runner.options.runner.csvUrl = existingDataset.dataset.url;

    run();
  }, [run, existingDataset, runner]);

  useEffect(() => {
    if (type === 'edit') {
      //
      // Delete the hidden type from the types.
      // Because on edit we want to show the user the columns that they hid.
      //

      const types: TypeMap = {};
      for (const [k, v] of Object.entries(
        props.integrationBlock.typeMappings
      )) {
        types[k] = { ...v, isHidden: false };
      }

      runner.setTypes(types);
      runner.import(computer);
    }
  }, [type, runner, props.integrationBlock, computer]);

  //
  // If we are creating an integration and the user decides to
  // add it to the notebook. We don't want to clean up the computer result,
  // as this would lead to a double import.
  //
  const shouldDelete = useRef(true);

  useEffect(() => {
    return () => {
      if (!shouldDelete.current) {
        return;
      }

      pushDeleteExternalData(computer, blockId, runner.nameToColumnId ?? {});
      computer.releaseExternalData(blockId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBack = () => {
    if (type === 'create') {
      if (stage === 'map' && existingDataset == null) {
        setStage('connect');
      } else {
        onReset();
      }
    } else {
      throw new Error('Unreachable');
    }
  };

  const onContinue = () => {
    if (
      type === 'create' &&
      stage === 'connect' &&
      existingDataset == null &&
      connectionType !== 'mysql' &&
      connectionType !== 'codeconnection'
    ) {
      setStage('map');
    } else {
      shouldDelete.current = false;

      const newTypes: TypeMap = {};
      for (const [k, v] of Object.entries(runner.types)) {
        newTypes[k] = v;
      }

      for (const column of hiddenColumns) {
        if (column in newTypes) {
          newTypes[column] = { ...newTypes[column], isHidden: true };
        } else {
          newTypes[column] = { isHidden: true };
        }
      }

      for (const [k, v] of Object.entries(newTypes)) {
        if (!hiddenColumns.includes(k) && v?.isHidden) {
          newTypes[k] = { ...v, isHidden: false };
        }
      }

      runner.setTypes(newTypes);

      run().then(() => {
        onCreateIntegration(connectionProps);
      });
    }
  };

  const connectionProps: ConnectionProps = {
    id: blockId,
    workspaceId,
    notebookId,

    connectionType,
    hiddenColumns,

    type,
    runner,
    onRun: run,

    externalData,
    setExternalData,

    stage,

    varName,

    info,
    onExecute,
    onChangeVarName: setVarName,

    onChangeColumnName(originalColumnName, desiredColumnName) {
      runner.renameColumn(computer, originalColumnName, desiredColumnName);
    },

    onToggleHideColumn(columnName) {
      if (hiddenColumns.some((c) => c === columnName)) {
        setHiddenColumns(hiddenColumns.filter((c) => c !== columnName));
      } else {
        setHiddenColumns([...hiddenColumns, columnName]);
      }
    },
  };

  return {
    stage,
    onClose: () => {
      setSidebar({ type: 'default-sidebar' });
    },
    connectionProps,
    onContinue,
    onBack,
  };
};
