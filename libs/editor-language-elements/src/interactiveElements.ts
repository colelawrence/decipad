import { InteractiveLanguageElement } from './types';
import * as interactiveLanguageElements from './elements';
// Register new interactive elements here:

const interactiveElements = Object.values(
  interactiveLanguageElements
) as InteractiveLanguageElement[];

type InteractiveElementRegistry = Record<string, InteractiveLanguageElement>;

export const interactiveElementsByElementType: InteractiveElementRegistry =
  interactiveElements.reduce((registry, ie) => {
    // eslint-disable-next-line no-param-reassign
    registry[ie.type] = ie;
    return registry;
  }, {} as InteractiveElementRegistry);
