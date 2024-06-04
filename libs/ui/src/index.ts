// These should generally not be imported directly and rendered individually in a frontend,
// instead templates and pages should be composed of them.
// But in some cases, like when using Slate to render a component tree, direct access is needed.
import * as allIcons from './icons';

export * from './hooks';

export * from './pages';
export { FigCaption } from './utils/resizing';
export * from './primitives';
export * from './shared';
export * from './modules';
export * from './utils';
export * from './utils/useEventNoEffect';
export * from './images';
export * from './styles';
export * from './global-styles';

export { type Identifier } from './modules/editor/AutoCompleteMenu/types';

export const icons = allIcons;
