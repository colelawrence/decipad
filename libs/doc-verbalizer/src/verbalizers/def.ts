import { ELEMENT_VARIABLE_DEF } from '../../../editor-types/src';
import stringify from 'json-stringify-safe';
import { assertElementType } from '../utils/assertElementType';
import { Verbalizer } from './types';

export const defVerbalizer: Verbalizer = (element, verbalize) => {
  assertElementType(element, ELEMENT_VARIABLE_DEF);

  const varName = verbalize(element.children[0]);
  const expression = verbalize(element.children[1]);

  switch (element.variant) {
    case 'slider': {
      const { max, min, step } = element.children[2];
      return `Slider with variable named \`${varName}\`, value of ${stringify(
        expression
      )}, minimum = ${min}, maximum = ${max}, step = ${step}.`;
    }
    case 'toggle':
    case 'expression': {
      return `\`\`\`deci\n${varName} = ${expression}\n\`\`\``;
    }
    case 'date': {
      return `\`\`\`deci\n${varName} = date(${expression})\n\`\`\``;
    }
    case 'dropdown': {
      const dropDown = element.children[1];
      const options = dropDown.options.map(({ value }) => stringify(value));
      return `Dropdown list that exposes a variable named \`${varName}\`, currently has the value of ${stringify(
        expression
      )}, where the user can select from any of the elements: \`[${options.join(
        ', '
      )}]\`.`;
    }
  }
};
