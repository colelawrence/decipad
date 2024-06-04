import type { Computer } from '@decipad/computer-interfaces';
import type { MyElement } from '@decipad/editor-types';
import { ELEMENT_TABLE, ELEMENT_VARIABLE_DEF } from '@decipad/editor-types';
import { clone } from '@decipad/editor-utils';
import { nanoid } from 'nanoid';

const utils = {
  /**
   * If you need any extra business logic on clone,
   * add it onto this function,
   * otherwise the function `clone` is used.
   */
  async cloneProxy(computer: Computer, element: MyElement) {
    const newElement = await clone(computer, element);
    switch (newElement.type) {
      case ELEMENT_VARIABLE_DEF: {
        if (newElement.variant === 'dropdown') {
          for (const c of newElement.children[1].options) {
            c.id = nanoid();
          }
        }
        break;
      }
      case ELEMENT_TABLE: {
        //
        // Look for category values, and de-duplicate the IDs
        //

        for (const col of newElement.children[1].children) {
          if (col.categoryValues == null) {
            continue;
          }

          for (const category of col.categoryValues) {
            category.id = nanoid();
          }
        }
      }
    }
    return newElement;
  },
};

export default utils;
