import { RemoteComputer, parseStatement } from '@decipad/remote-computer';
import {
  AnyElement,
  CodeLineElement,
  CodeLineV2Element,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
  StructuredInputElement,
  TableElement,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';

function deduplicateVarNameInDef(
  computer: RemoteComputer,
  e: VariableDefinitionElement
) {
  e.children[0].children[0].text = computer.getAvailableIdentifier(
    `${getNodeString(e.children[0])}Copy`
  );
}

function deduplicateAssignmentVarName(
  computer: RemoteComputer,
  e: CodeLineElement
) {
  const code = getNodeString(e);
  const parsed = parseStatement(code);
  if (!parsed.error && parsed.solution && parsed.solution.type === 'assign') {
    const varName = parsed.solution.args[0].args[0];
    const newVarName = computer.getAvailableIdentifier(`${varName}Copy`);
    e.children[0].text = code.replace(varName, newVarName);
  }
}

function deduplicateVarNameInCodeLineV2(
  computer: RemoteComputer,
  e: CodeLineV2Element
) {
  e.children[0].children[0].text = computer.getAvailableIdentifier(
    `${getNodeString(e.children[0])}Copy`
  );
}

function deduplicateVarNameInStructuredIn(
  computer: RemoteComputer,
  e: StructuredInputElement
) {
  e.children[0].children[0].text = computer.getAvailableIdentifier(
    `${getNodeString(e.children[0])}Copy`
  );
}

function deduplicateTableVarName(computer: RemoteComputer, e: TableElement) {
  const captionEl = e.children[0].children[0];
  const varName = getNodeString(captionEl);
  e.children[0].children[0].children[0].text = computer.getAvailableIdentifier(
    `${varName}Copy`
  );
}

export const deduplicateVarNameInBlock = <T extends AnyElement>(
  computer: RemoteComputer,
  el: T
): T => {
  switch (el.type) {
    case ELEMENT_VARIABLE_DEF:
      deduplicateVarNameInDef(computer, el);
      break;
    case ELEMENT_CODE_LINE:
      deduplicateAssignmentVarName(computer, el);
      break;
    case ELEMENT_CODE_LINE_V2:
      deduplicateVarNameInCodeLineV2(computer, el);
      break;
    case ELEMENT_STRUCTURED_IN:
      deduplicateVarNameInStructuredIn(computer, el);
      break;
    case ELEMENT_TABLE:
      deduplicateTableVarName(computer, el);
      break;
  }
  return el;
};
