import type { RemoteComputer } from '@decipad/remote-computer';
import { parseStatement } from '@decipad/remote-computer';
import type {
  AnyElement,
  CodeLineElement,
  CodeLineV2Element,
  IntegrationTypes,
  StructuredInputElement,
  TableElement,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_INTEGRATION,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate-common';

async function deduplicateVarNameInDef(
  computer: RemoteComputer,
  e: VariableDefinitionElement
) {
  e.children[0].children[0].text = await computer.getAvailableIdentifier(
    `${getNodeString(e.children[0])}Copy`
  );
}

async function deduplicateAssignmentVarName(
  computer: RemoteComputer,
  e: CodeLineElement
) {
  const code = getNodeString(e);
  const parsed = parseStatement(code);
  if (!parsed.error && parsed.solution && parsed.solution.type === 'assign') {
    const varName = parsed.solution.args[0].args[0];
    const newVarName = await computer.getAvailableIdentifier(`${varName}Copy`);
    e.children[0].text = code.replace(varName, newVarName);
  }
}

async function deduplicateVarNameInCodeLineV2(
  computer: RemoteComputer,
  e: CodeLineV2Element
) {
  e.children[0].children[0].text = await computer.getAvailableIdentifier(
    `${getNodeString(e.children[0])}Copy`
  );
}

async function deduplicateVarNameInStructuredIn(
  computer: RemoteComputer,
  e: StructuredInputElement
) {
  e.children[0].children[0].text = await computer.getAvailableIdentifier(
    `${getNodeString(e.children[0])}Copy`
  );
}

async function deduplicateTableVarName(
  computer: RemoteComputer,
  e: TableElement
) {
  const captionEl = e.children[0].children[0];
  const varName = getNodeString(captionEl);
  e.children[0].children[0].children[0].text =
    await computer.getAvailableIdentifier(`${varName}Copy`);
}

async function deduplicateIntegrationVarName(
  computer: RemoteComputer,
  e: IntegrationTypes.IntegrationBlock
): Promise<void> {
  const varName = getNodeString(e.children[0]);

  e.children[0].text = await computer.getAvailableIdentifier(`${varName}Copy`);
}

export const deduplicateVarNameInBlock = async <T extends AnyElement>(
  computer: RemoteComputer,
  el: T
): Promise<T> => {
  switch (el.type) {
    case ELEMENT_VARIABLE_DEF:
      await deduplicateVarNameInDef(computer, el);
      break;
    case ELEMENT_CODE_LINE:
      await deduplicateAssignmentVarName(computer, el);
      break;
    case ELEMENT_CODE_LINE_V2:
      await deduplicateVarNameInCodeLineV2(computer, el);
      break;
    case ELEMENT_STRUCTURED_IN:
      await deduplicateVarNameInStructuredIn(computer, el);
      break;
    case ELEMENT_TABLE:
      await deduplicateTableVarName(computer, el);
      break;
    case ELEMENT_INTEGRATION:
      await deduplicateIntegrationVarName(computer, el);
      break;
  }
  return el;
};
