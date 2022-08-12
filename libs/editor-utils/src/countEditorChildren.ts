import { MyEditor, ELEMENT_COLUMNS } from '@decipad/editor-types';

// Gets a unique name for Input and Sliders and any other widget type element,
// regardless of reloads, user deleting elements, slash inserts or column inserts.
export const getElementUniqueName = (
  editor: MyEditor,
  type: string,
  variant: string,
  name: string
): string => {
  try {
    // Get all relevant children from the editor.
    const elements = [];
    for (const child of editor.children) {
      if (child.type === type && child.variant === variant) {
        elements.push((child as any).children[0].children[0].text);
      } else if (child.type === ELEMENT_COLUMNS) {
        for (const childCol of child.children) {
          if (childCol.type === type && childCol.variant === variant) {
            elements.push((childCol as any).children[0].children[0].text);
          }
        }
      }
    }

    // if the name exists already (due to user deleting some), return new
    // + 1 because i'd rather have Slider1, Slider2 instead of Slider0, Slider1.
    let count = elements.length + 1;
    let returnName = name + count;
    while (elements.includes(returnName)) {
      count += 1;
      returnName = name + count;
    }

    return returnName;
  } catch (error) {
    console.error(error);
    return '';
  }
};
