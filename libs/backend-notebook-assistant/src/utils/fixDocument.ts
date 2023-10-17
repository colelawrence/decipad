/* eslint-disable no-param-reassign */
import {
  type AnyElement,
  ELEMENT_DATA_VIEW,
  type RootDocument,
} from '@decipad/editor-types';
import {
  ELEMENT_TABLE,
  ELEMENT_TH,
  getNodeString,
  isElement,
} from '@udecode/plate';
import cloneDeep from 'lodash.clonedeep';
import { findNode } from './findNode';

const fixDataViews = (doc: RootDocument): void => {
  const fixDataView = (el: AnyElement) => {
    if (el.type === ELEMENT_DATA_VIEW) {
      const tableId = el.varName;
      let foundTable = findNode(
        doc,
        (node) =>
          isElement(node) && node.type === ELEMENT_TABLE && node.id === tableId
      );
      if (!foundTable) {
        // see if there is a table with that variable name
        foundTable = findNode(
          doc,
          (node) =>
            isElement(node) &&
            node.type === ELEMENT_TABLE &&
            getNodeString(node.children[0].children[0]) === tableId
        );
        if (foundTable && isElement(foundTable)) {
          // fix varname to point to table id
          el.varName = foundTable.id;
        }
      }

      for (const dataViewCol of el.children[1].children) {
        const columnId = dataViewCol.name;
        let foundColumn = findNode(
          doc,
          (node) =>
            isElement(node) && node.type === ELEMENT_TH && node.id === columnId
        );
        if (foundColumn) {
          continue;
        }
        // no column matches this name by id
        // let's try by column name
        foundColumn = findNode(
          doc,
          (node) =>
            isElement(node) &&
            node.type === ELEMENT_TH &&
            getNodeString(node) === columnId
        );
        if (foundColumn && isElement(foundColumn)) {
          dataViewCol.name = foundColumn.id;
          dataViewCol.label = getNodeString(foundColumn);
        }
      }
    } else {
      for (const child of el.children) {
        if (isElement(child)) {
          fixDataView(child);
        }
      }
    }
  };

  for (const child of doc.children) {
    fixDataView(child);
  }
};

export const fixDocument = (_doc: RootDocument): RootDocument => {
  const doc = cloneDeep(_doc);
  fixDataViews(doc);
  return doc;
};
