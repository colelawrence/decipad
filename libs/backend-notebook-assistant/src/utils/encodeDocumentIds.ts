import type { RootDocument } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { TNode, isElement } from '@udecode/plate';
import { encoder } from 'basex-encoder';
import { invertMap } from './invertMap';

type Decoder = (doc: RootDocument) => RootDocument;

type IdMap = Map<string, string>;

const codec = encoder('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

const magicPreamble = '🍏';

const nextId = (idMap: IdMap): string => {
  let nextNumber = idMap.size.toString(16);
  if (nextNumber.length % 2) {
    nextNumber = `0${nextNumber}`;
  }
  const buffer = Buffer.from(nextNumber, 'hex');
  return magicPreamble + codec.encodeFromBuffer(buffer);
};

const replaceProps = <T>(o: T, idMap: IdMap): T => {
  if (typeof o === 'string') {
    if (idMap.has(o)) {
      return getDefined(idMap.get(o)) as T;
    }
  }
  if (o != null && typeof o === 'object') {
    if (Array.isArray(o)) {
      return o.map((child) => replaceProps(child, idMap)) as typeof o;
    }
    const newEntries = Object.entries(o).map(([k, v]) => {
      return [k, replaceProps(v, idMap)];
    });
    return Object.fromEntries(newEntries);
  }
  return o;
};

const encodeNode = <T extends TNode>(node: T, idMap: IdMap): T => {
  if (isElement(node) && typeof node.id === 'string') {
    const { id } = node;
    const replacement = nextId(idMap);
    idMap.set(replacement, id);
    return {
      ...node,
      id: replacement,
      children: node.children.map((child) => encodeNode(child, idMap)),
    };
  }
  return node;
};

const decodeNode = <T extends TNode>(node: T, idMap: IdMap): T => {
  if (isElement(node) && typeof node.id === 'string') {
    const { id } = node;
    const replacement = idMap.get(id);
    return {
      ...node,
      id: replacement,
      children: node.children.map((child) => decodeNode(child, idMap)),
    };
  }
  return node;
};

export const encodeDocumentIds = (
  doc: RootDocument
): [RootDocument, Decoder] => {
  const idMap: IdMap = new Map();
  let encodedDoc = {
    children: doc.children.map((child) => encodeNode(child, idMap)),
  } as RootDocument;
  encodedDoc = replaceProps(encodedDoc, invertMap(idMap));

  const decodeDoc = (d: RootDocument): RootDocument => {
    const decoded = {
      children: d.children.map((child) => decodeNode(child, idMap)),
    } as RootDocument;
    return replaceProps(decoded, idMap);
  };

  return [encodedDoc, decodeDoc];
};
