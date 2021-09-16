import { ELEMENT_CODE_BLOCK } from '@udecode/plate';
import { ELEMENT_IMPORT_DATA } from '@decipad/ui';
import {
  ComputeRequest,
  Program,
  AST,
  ExternalDataMap,
} from '@decipad/language';
import {
  getCodeFromBlock,
  SlateNode,
  ImportDataNode,
  getAssignmentBlock,
} from './common';
import { extractTable, isInteractiveTable } from './extractTable';

export function slateDocumentToComputeRequest(
  slateDoc: SlateNode[]
): ComputeRequest {
  const program: Program = [];
  const externalData: ExternalDataMap = new Map();

  for (const block of slateDoc) {
    if (block.type === ELEMENT_CODE_BLOCK) {
      program.push({
        id: block.id,
        type: 'unparsed-block',
        source: getCodeFromBlock(block),
      });
    }

    if (
      block.type === ELEMENT_IMPORT_DATA &&
      (block as ImportDataNode)['data-href']
    ) {
      program.push({
        id: block.id,
        type: 'parsed-block',
        block: getAstFromImportData(block as ImportDataNode),
      });
    }

    if (isInteractiveTable(block)) {
      const tableData = extractTable(block);

      if (tableData != null) {
        program.push({
          id: block.id,
          type: 'parsed-block',
          block: getAstFromInteractiveTable(block.id, tableData.variableName),
        });

        externalData.set(block.id, tableData.externalData);
      }
    }
  }

  return { program, externalData };
}

function getAstFromImportData(importData: ImportDataNode): AST.Block {
  return getAssignmentBlock(importData.id, importData['data-varname'], {
    type: 'imported-data',
    args: [importData['data-href'], importData['data-contenttype']],
  });
}

function getAstFromInteractiveTable(id: string, name: string): AST.Block {
  return getAssignmentBlock(id, name, { type: 'externalref', args: [id] });
}
