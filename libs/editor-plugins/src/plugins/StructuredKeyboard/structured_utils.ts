import { CodeLineV2Element } from '@decipad/editor-types';

// Utils can be expanded to work with any code that has smart refs + text nodes.
const utils = {
  getTextLength(element: CodeLineV2Element): number {
    let length = 0;
    for (const c of element.children[1].children) {
      // Is a smart ref
      if ('type' in c) {
        if (c.lastSeenVariableName) {
          length += c.lastSeenVariableName.length;
        } else {
          length += 1;
        }
      } else {
        length += c.text.length;
      }
    }
    return length;
  },

  // Gets the "absolute" length of the selection, this means it will ignore paths
  // and others and just give you how long the UI thinks this line is
  getSelectionLength(
    element: CodeLineV2Element,
    cursorPath: number,
    offset: number
  ): number {
    let length = 0;
    let c: CodeLineV2Element['children'][1]['children'][number] | undefined;
    for (
      let i = 0;
      i < element.children[1].children.length && i <= cursorPath;
      i += 1
    ) {
      c = element.children[1].children[i];
      // Is a smart ref
      if ('type' in c) {
        if (c.lastSeenVariableName) {
          length += c.lastSeenVariableName.length;
        } else {
          // Hacky: The size of the smart ref makes it seem like it has 2 spaces.
          length += 2;
        }
      } else {
        length += c.text.length;
      }
    }

    if (c && !('type' in c)) {
      return length - (c.text.length - offset);
    }
    return length;
  },

  // Given an absolute offset (Obtained by the getSelectionLength), you can
  // select a specific part of the code line V2
  // @returns [number, number] where the 1st number is the element number (Text + SmartRef + Text)
  // if you select the smart ref the 1st number is 1
  // 2nd number of return statement is the offset within that text node.
  getTargetSelection(
    nextElement: CodeLineV2Element,
    offset: number
  ): [number, number] {
    let length = 0;
    let i = 0;
    let c: CodeLineV2Element['children'][1]['children'][number] | undefined;

    for (
      i = 0;
      i < nextElement.children[1].children.length && length < offset;
      i += 1
    ) {
      c = nextElement.children[1].children[i];
      if ('type' in c) {
        if (c.lastSeenVariableName) {
          length += c.lastSeenVariableName.length;
        } else {
          // Hacky: The size of the smart ref makes it seem like it has 2 spaces.
          length += 2;
        }
      } else {
        length += c.text.length;
      }
    }

    if (!c) return [0, 0];

    if (c && 'type' in c) {
      return [i - 1, 0];
    }

    return [i - 1, c.text.length - Math.max(length - offset, 0)];
  },
};

export default utils;
