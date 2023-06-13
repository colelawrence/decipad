import { FC, PropsWithChildren, useEffect } from 'react';
import { act, render } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Computer } from '@decipad/computer';
import { ComputerContextProvider } from '@decipad/react-contexts';
import {
  createPlateEditor,
  ELEMENT_H1,
  Plate,
  PlateEditor,
} from '@udecode/plate';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
  ELEMENT_DATA_VIEW_TR,
  ELEMENT_DATA_VIEW_TH,
  DataViewElement,
  H1Element,
  useTEditorRef,
} from '@decipad/editor-types';
import { createServer, Server } from 'http';
import path from 'path';
import handler from 'serve-handler';
import getPort from 'get-port';
import { tryImport } from '@decipad/import';
import { getDefined, timeout } from '@decipad/utils';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { createDataViewPlugin } from './plugins';
import { useDataView, useDataViewLayoutData } from './hooks';
import { Column, AggregationKind } from './types';

setupDeciNumberSnapshotSerializer();

type TestValue = [H1Element, DataViewElement];
type TestEditor = PlateEditor<TestValue>;

const maxRunBigTableTimeoutMs = 35_000 * (process.env.CI ? 2 : 1);

const createEditor = (): TestEditor => {
  const editor = createPlateEditor<TestValue>({
    plugins: [createDataViewPlugin()],
  });
  editor.children = [
    {
      type: ELEMENT_H1,
      id: 'title',
      children: [{ text: 'Title' }],
    },
    {
      type: ELEMENT_DATA_VIEW,
      id: 'data-view',
      varName: 'data-source',
      children: [
        {
          id: 'caption',
          type: ELEMENT_DATA_VIEW_CAPTION,
          children: [
            {
              id: 'name',
              type: ELEMENT_DATA_VIEW_NAME,
              children: [{ text: 'Data view name' }],
            },
          ],
        },
        {
          type: ELEMENT_DATA_VIEW_TR,
          id: 'data-view-tr',
          children: [
            {
              id: 'th1',
              type: ELEMENT_DATA_VIEW_TH,
              cellType: { kind: 'number', unit: null },
              name: 'A',
              aggregation: 'sum',
              children: [{ text: '' }],
            },
            {
              id: 'th1',
              type: ELEMENT_DATA_VIEW_TH,
              cellType: { kind: 'number', unit: null },
              name: 'B',
              aggregation: 'max',
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
  ];
  return editor;
};

const WithProviders: FC<
  PropsWithChildren<{ computer: Computer; editor: TestEditor }>
> = ({ computer, editor, children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ComputerContextProvider computer={computer}>
        <Plate editor={editor as PlateEditor}>{children}</Plate>
      </ComputerContextProvider>
    </DndProvider>
  );
};

interface WithDataViewHookProps {
  element: DataViewElement;
  onDataViewResultChange: (result: ReturnType<typeof useDataView>) => void;
}

const WithDataViewHook: FC<WithDataViewHookProps> = ({
  element,
  onDataViewResultChange,
}) => {
  const editor = useTEditorRef();
  const results = useDataView({ editor, element });
  useEffect(() => {
    onDataViewResultChange(results);
  }, [onDataViewResultChange, results]);

  return null;
};

const loadAndPushTable = async (
  computer: Computer,
  fileName: string
): Promise<void> => {
  const server = await createStaticServer();

  const address = getDefined(server!.address());
  const url =
    typeof address === 'string'
      ? new URL(fileName, address)
      : new URL(fileName, `http://${address.address}:${address.port}/`);
  const table = await tryImport({ computer, url });
  expect(table).toHaveLength(1);
  await act(async () => {
    if (table[0].result) {
      computer.pushExternalDataUpdate('data-source', [
        ['data-source', table[0].result],
      ]);
    }

    computer.pushCompute({
      program: [
        {
          type: 'identified-block',
          id: 'data-source',
          block: {
            type: 'block',
            id: 'data-source',
            args: [
              {
                type: 'externalref',
                args: ['data-source'],
              },
            ],
          },
        },
      ],
    });

    await timeout(0);
  });

  await server.close();
};

interface RunTestProps {
  waitForCallbackCount?: number;
  computer?: Computer;
}

const runWithDataView = async ({
  waitForCallbackCount = 1,
  computer = new Computer(),
}: RunTestProps) => {
  return new Promise<[ReturnType<typeof useDataView>, TestEditor, Computer]>(
    (resolve, reject) => {
      try {
        let count = waitForCallbackCount;
        const editor = createEditor();
        const dataViewElement = editor.children[1];

        const onChange = (r: ReturnType<typeof useDataView>) => {
          count -= 1;
          expect(count).toBeGreaterThanOrEqual(0);
          if (count === 0) {
            resolve([r, editor, computer]);
          }
        };

        render(
          <WithProviders computer={computer} editor={editor}>
            <WithDataViewHook
              element={dataViewElement}
              onDataViewResultChange={onChange}
            />
          </WithProviders>
        );
      } catch (err) {
        reject(err);
      }
    }
  );
};

interface WithLayoutDataHookProps {
  tableName: string;
  columns: Column[];
  aggregationTypes: (AggregationKind | undefined)[];
  roundings: (string | undefined)[];
  expandedGroups: string[] | undefined;
  preventExpansion: boolean;
  onLayoutDataResultChange: (
    result: ReturnType<typeof useDataViewLayoutData>
  ) => void;
}

const WithLayoutDataHook: FC<WithLayoutDataHookProps> = ({
  tableName,
  columns,
  aggregationTypes,
  roundings,
  expandedGroups,
  preventExpansion,
  onLayoutDataResultChange,
}) => {
  const results = useDataViewLayoutData({
    tableName,
    columns,
    aggregationTypes,
    roundings,
    expandedGroups,
    preventExpansion,
    rotate: false,
  });
  useEffect(() => {
    onLayoutDataResultChange(results);
  }, [onLayoutDataResultChange, results]);

  return null;
};

const runWithLayoutData = async ({
  waitForCallbackCount,
  computer,
  editor,
  tableName,
  columns,
  aggregationTypes,
  expandedGroups,
}: {
  waitForCallbackCount: number;
  computer: Computer;
  editor: TestEditor;
  tableName: string;
  columns: Column[];
  aggregationTypes: (AggregationKind | undefined)[];
  expandedGroups: string[] | undefined;
}) => {
  return new Promise<ReturnType<typeof useDataViewLayoutData>>((resolve) => {
    let count = waitForCallbackCount;
    render(
      <WithProviders computer={computer} editor={editor}>
        <WithLayoutDataHook
          tableName={tableName}
          columns={columns}
          aggregationTypes={aggregationTypes}
          roundings={[]}
          preventExpansion={false}
          expandedGroups={expandedGroups}
          onLayoutDataResultChange={(r) => {
            count -= 1;
            if (count === 0) {
              resolve(r);
            }
          }}
        ></WithLayoutDataHook>
      </WithProviders>
    );
  });
};

const createStaticServer = async () => {
  const publicPath = path.resolve(__dirname, '__fixtures__');
  const server = createServer((req, res) => {
    handler(req, res, {
      public: publicPath,
    });
  });
  const port = await getPort();
  return new Promise<Server>((resolve, reject) => {
    server.once('error', reject);
    server.once('listening', () => resolve(server));
    server.listen({ port, host: '127.0.0.1' });
  });
};

describe('useDataView hook performance', () => {
  it('works on an empty computer', async () => {
    expect(
      (await runWithDataView({ waitForCallbackCount: 2 }))[0]
    ).toMatchObject({
      availableColumns: undefined,
      selectedAggregationTypes: ['sum', 'max'],
      sortedColumns: undefined,
      tableName: undefined,
      variableNames: [],
    });
  });

  it('works on a small table', async () => {
    const computer = new Computer();
    await loadAndPushTable(computer, '/small1.csv');
    const [testResult, editor] = await runWithDataView({
      waitForCallbackCount: 5,
      computer,
    });
    expect(testResult).toMatchSnapshot();

    const layoutDataResult = await runWithLayoutData({
      waitForCallbackCount: 2,
      computer,
      editor,
      tableName: 'table',
      columns: getDefined(testResult.sortedColumns),
      aggregationTypes: getDefined(testResult.selectedAggregationTypes),
      expandedGroups: [],
    });

    expect(layoutDataResult).toMatchSnapshot();
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('works on a big table', async () => {
    const computer = new Computer();
    await loadAndPushTable(computer, '/big1.csv');
    let startTime = Date.now();
    const [testResult, editor] = await runWithDataView({
      waitForCallbackCount: 5,
      computer,
    });
    let elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThanOrEqual(maxRunBigTableTimeoutMs);

    startTime = Date.now();
    await runWithLayoutData({
      waitForCallbackCount: 2,
      computer,
      editor,
      tableName: 'table',
      columns: getDefined(testResult.sortedColumns),
      aggregationTypes: getDefined(testResult.selectedAggregationTypes),
      expandedGroups: [],
    });
    elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThanOrEqual(maxRunBigTableTimeoutMs);
  }, 120_000);
});
