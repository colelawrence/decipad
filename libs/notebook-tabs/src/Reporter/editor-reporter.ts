import { isElement, TOperation } from '@udecode/plate-common';
import { createReporter, Reporter } from './reporter';
import { EditorController } from '../EditorController';
import { filter, map } from 'rxjs/operators';
import { ELEMENT_INTEGRATION } from '@decipad/editor-types';
import { analytics } from '@decipad/client-events';

export const createEditorReporter = (
  controller: EditorController
): Reporter<TOperation> => {
  const anyChange = controller.events.pipe(
    filter((e) => e.type === 'any-change'),
    filter((e) => (e as any).op != null),
    map((e) => (e as any).op!) // Typescript being weird here. newer versions allow this.
  );

  const reporter = createReporter<TOperation>({
    subject: anyChange,
    maxEvents: 100,
    shouldTriggerFlush: {
      condition: (e) =>
        e.type === 'remove_node' &&
        isElement(e.node) &&
        e.node.type === ELEMENT_INTEGRATION,
      flushCallback: (events) => {
        analytics.track({ type: 'incident', events });
      },
    },
  });

  return reporter;
};
