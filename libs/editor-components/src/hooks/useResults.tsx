import { Computer } from '@decipad/computer-interfaces';
import { useComputer } from '@decipad/editor-hooks';
import type { CodeLineElement, SmartRefElement } from '@decipad/editor-types';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_SMART_REF,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { AutocompleteNameWithSerializedType } from '@decipad/language-interfaces';
import { ResultIcon, SelectItems } from '@decipad/ui';
import { getNodeString } from '@udecode/plate-common';
import { useMemo, useCallback } from 'react';

const debounceNamesDefinedMs = 500;

export interface UseResultsOptions {
  // Results from computer are NOT calculated until the menu is actually open.
  // Saving a lot of CPU when the editor is re-rendering when the user is busy
  // doing other work.
  enabled: boolean;
}

export const useResults = (options: UseResultsOptions) => {
  const namesDefined = useNamesDefined(options);

  // Decilang codelines do not need to have a name defining them.
  // But we still want to add them.
  const calculations = useCalculations();

  return useMemo(
    (): SelectItems[] =>
      [...namesDefined, ...calculations].map(selectedItemForName),
    [namesDefined, calculations]
  );
};

const selectedItemForName = (
  name: AutocompleteNameWithSerializedType
): SelectItems => {
  // Group columns by table name
  const [tableName = undefined, columnName = undefined] = name.columnId
    ? name.name.split('.')
    : [];

  const blockId = name.columnId ?? name.blockId;

  return {
    id: blockId ?? '',
    item: columnName ?? name.name,
    blockId,
    blockType: name.serializedType,
    group: {
      variable: 'Variables',
      function: 'Functions',
      column: tableName,
      calculation: 'Calculations',
    }[name.autocompleteGroup],
    icon: <ResultIcon kind={name.kind} />,
  };
};

const useCalculations = (): AutocompleteNameWithSerializedType[] => {
  const computer = useComputer();
  const editor = useMyEditorRef();

  // Decilang codelines do not need to have a name defining them.
  // But we still want to add them.
  return editor.children
    .map((node): AutocompleteNameWithSerializedType | undefined => {
      if (node.type !== ELEMENT_CODE_LINE) return;
      if (computer.getSymbolDefinedInBlock(node.id ?? '')) return;

      const result = computer.getBlockIdResult$.get(node.id);
      if (!result) return;
      if (result.type === 'identified-error') return;

      const serializedType = result.result?.type;
      if (!serializedType) return;

      const text = getCodeLineText(computer, node);
      if (!text) return;

      return {
        kind: serializedType.kind,
        serializedType,
        autocompleteGroup: 'calculation',
        name: text,
        blockId: node.id ?? '',
      };
    })
    .filter(
      (name): name is AutocompleteNameWithSerializedType => name !== undefined
    );
};

const getCodeLineText = (
  computer: Computer,
  codeLine: CodeLineElement
): string | undefined => {
  let text = '';
  for (const c of codeLine.children) {
    if ((c as SmartRefElement)?.type === 'smart-ref') {
      assertElementType(c, ELEMENT_SMART_REF);
      const varName = computer.getSymbolDefinedInBlock(c.blockId);
      if (!varName) return;
      text += varName;
    }
    text += getNodeString(c);
  }
  return text;
};

const useNamesDefined = ({
  enabled,
}: UseResultsOptions): AutocompleteNameWithSerializedType[] => {
  const computer = useComputer();
  return computer.getNamesDefined$.useWithSelectorDebounced(
    debounceNamesDefinedMs,
    useCallback(
      (names) => {
        if (!enabled) return [];
        return names.filter((name) => name.kind !== 'type-error');
      },
      [enabled]
    )
  );
};
