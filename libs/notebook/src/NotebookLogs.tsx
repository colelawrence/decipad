/* eslint-disable no-console */
import { isFlagEnabled } from '@decipad/feature-flags';
import { LogEntry, useCreateLogsMutation } from '@decipad/graphql-client';
import { getDefined } from '@decipad/utils';
import stringify from 'json-stringify-safe';
import { debounce } from 'lodash';
import { FC, PropsWithChildren, useCallback, useEffect } from 'react';

type Fn = (...args: unknown[]) => unknown;
type CreateLogsFn = (
  resource: string,
  entries: Array<LogEntry>
) => Promise<unknown>;
type ResourceLogEntries = {
  resource: string;
  entries: LogEntry[];
};

const entrySize = (current: number, next: LogEntry): number =>
  current + next.content.length;

const DEBOUNCE_PUSH_TO_REMOTE_MS = 5_000;
const MAX_PAYLOAD_SIZE = 200_000;

let entries: ResourceLogEntries[] = [];
let pushing = false;

const pushToRemote = debounce(async (createLogs: CreateLogsFn) => {
  const toInsert = entries;
  if (pushing || toInsert.length < 1) {
    return;
  }
  entries = [];
  pushing = true;

  let resource: string | undefined;
  let sameResourceEntries: LogEntry[] = [];
  let payloadSize = 0;
  const push = async () => {
    try {
      if (sameResourceEntries.length > 0) {
        await createLogs(getDefined(resource), sameResourceEntries);
      }
    } catch (err) {
      console.error(err);
    }
  };

  for (const entry of toInsert) {
    if (resource == null) {
      resource = entry.resource;
    } else if (resource === entry.resource) {
      payloadSize += entry.entries.reduce<number>(entrySize, 0);
      sameResourceEntries = sameResourceEntries.concat(entry.entries);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await push();
      resource = entry.resource;
      payloadSize = entry.entries.reduce<number>(entrySize, 0);
      sameResourceEntries = [...entry.entries];
    }
    if (payloadSize > MAX_PAYLOAD_SIZE) {
      // eslint-disable-next-line no-await-in-loop
      await push();
      payloadSize = 0;
      sameResourceEntries = [];
    }
  }
  await push();
  pushing = false;
}, DEBOUNCE_PUSH_TO_REMOTE_MS);

const pushConsoleCall = (
  resource: string,
  method: string,
  args: unknown[],
  createLogs: CreateLogsFn
) => {
  const newEntries = args.map((arg) => ({
    content: stringify(arg),
    createdAt: new Date(),
    source: method,
  }));
  entries.push({ resource, entries: newEntries });
  pushToRemote(createLogs);
};

const override = <F extends Fn>(
  resource: string,
  fn: F,
  name: string,
  createLogs: CreateLogsFn
): F => {
  if (!isFlagEnabled('SAVE_NOTEBOOK_LOGS')) {
    return fn;
  }

  return ((...args) => {
    const [arg] = args;
    if (typeof arg !== 'string' || !arg.startsWith('Warning')) {
      pushConsoleCall(resource, name, args, createLogs);
    }
    return fn.apply(console, args);
  }) as F;
};

const overrideConsole =
  (notebookId: string, createLogs: CreateLogsFn) => () => {
    const { log, trace, dir, debug, info, warn, error } = console;

    const resource = `/pads/${notebookId}`;

    console.log = override(resource, console.log, 'log', createLogs);
    console.trace = override(resource, console.trace, 'trace', createLogs);
    console.dir = override(resource, console.dir, 'dir', createLogs);
    console.debug = override(resource, console.debug, 'debug', createLogs);
    console.info = override(resource, console.info, 'info', createLogs);
    console.warn = override(resource, console.warn, 'warn', createLogs);
    console.error = override(resource, console.warn, 'error', createLogs);

    return () => {
      console.log = log;
      console.trace = trace;
      console.dir = dir;
      console.debug = debug;
      console.info = info;
      console.warn = warn;
      console.error = error;
    };
  };

interface NotebookLogsProps {
  notebookId: string;
}

export const NotebookLogs: FC<PropsWithChildren<NotebookLogsProps>> = ({
  notebookId,
  children,
}) => {
  const [, createLogs] = useCreateLogsMutation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    overrideConsole(
      notebookId,
      useCallback(
        (resource: string, e: LogEntry[]) =>
          createLogs({ resource, entries: e }),
        [createLogs]
      )
    ),
    []
  );
  return <>{children}</>;
};
