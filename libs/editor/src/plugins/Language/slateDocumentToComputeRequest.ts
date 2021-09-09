import { ELEMENT_CODE_BLOCK, ELEMENT_PARAGRAPH } from '@udecode/plate';
import { ELEMENT_IMPORT_DATA } from '@decipad/ui';
import {
  ComputeRequest,
  Program,
  AST,
  ExternalDataMap,
  buildType,
  Column,
  Scalar,
  InjectableExternalData,
} from '@decipad/language';
import { getCodeFromBlock, SlateNode, ImportDataNode } from './common';

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

    if (
      block.type === ELEMENT_PARAGRAPH &&
      block.children?.some((child) =>
        child.text?.toLowerCase().includes('hi this is a demo')
      )
    ) {
      const externalDataId = `${block.id}/external-data`;

      program.push({
        id: block.id,
        type: 'parsed-block',
        block: getAstFromInteractiveTable(externalDataId, 'Table'),
      });

      externalData.set(externalDataId, getDemoExternalData());
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

function getDemoExternalData(): InjectableExternalData {
  return {
    type: buildType.table({
      length: 3,
      columnTypes: [buildType.string(), buildType.number()],
      columnNames: ['PersonName', 'Bananas'],
    }),
    value: Column.fromNamedValues(
      [
        Column.fromValues([
          Scalar.fromValue('Joaquim'),
          Scalar.fromValue('Manuel'),
          Scalar.fromValue('Catarina'),
        ]),
        Column.fromValues([
          Scalar.fromValue(51),
          Scalar.fromValue(10),
          Scalar.fromValue(25),
        ]),
      ],
      ['PersonName', 'Bananas']
    ),
  };
}

function getAssignmentBlock(
  id: string,
  name: string,
  value: AST.Expression
): AST.Block {
  return {
    type: 'block',
    id,
    args: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: [name],
          },
          value,
        ],
      },
    ],
  };
}
