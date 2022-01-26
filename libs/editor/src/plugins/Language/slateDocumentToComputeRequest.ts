import { ComputeRequest, Program, AST } from '@decipad/language';
import {
  getCodeFromBlock,
  SlateNode,
  FetchDataNode,
  getAssignmentBlock,
} from './common';
import {
  ExtractedTable,
  extractTable,
  isInteractiveTable,
} from './extractTable';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_FETCH,
} from '../../elements';

export function slateDocumentToComputeRequest(
  slateDoc: SlateNode[]
): ComputeRequest {
  const program: Program = [];

  for (const block of slateDoc) {
    if (block.type === ELEMENT_CODE_BLOCK) {
      // Add each line of a code block as its own block.
      for (const innerBlock of block.children ?? []) {
        if (innerBlock.type === ELEMENT_CODE_LINE) {
          program.push({
            id: innerBlock.id,
            type: 'unparsed-block',
            source: getCodeFromBlock(innerBlock),
          });
        }
      }
    }

    if (block.type === ELEMENT_FETCH && (block as FetchDataNode)['data-href']) {
      program.push({
        id: block.id,
        type: 'parsed-block',
        block: getAstFromFetchData(block as FetchDataNode),
      });
    }

    if (isInteractiveTable(block)) {
      const tableData = extractTable(block);

      if (tableData != null) {
        program.push({
          id: block.id,
          type: 'parsed-block',
          block: getAstFromInteractiveTable(block.id, tableData),
        });
      }
    }
  }

  return { program };
}

function getAstFromFetchData(fetchData: FetchDataNode): AST.Block {
  return getAssignmentBlock(fetchData.id, fetchData['data-varname'], {
    type: 'fetch-data',
    args: [fetchData['data-href'], fetchData['data-contenttype']],
  });
}

function getAstFromInteractiveTable(
  id: string,
  { name, node }: ExtractedTable
): AST.Block {
  return getAssignmentBlock(id, name, node);
}
