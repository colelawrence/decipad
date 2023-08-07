// These should generally not be imported directly and rendered individually in a frontend,
// instead templates and pages should be composed of them.
// But in some cases, like when using Slate to render a component tree, direct access is needed.
import * as allIcons from './icons';

export * from './atoms';
export * from './hooks';
export * from './molecules';
export * from './organisms';
export * from './pages';
export * from './primitives';
export * from './templates';
export * from './utils';
export * from './utils/useEventNoEffect';
export * from './images';
export * from './styles';

export const icons = allIcons;
