import { SubtitleElement } from './Subtitle';

export default {
  title: 'Atoms/Editor/Elements/Subtitle',
  component: SubtitleElement,
  args: { children: 'Subtitle Element' },
};

interface ArgsType {
  children: string;
}

export const Subtitle = (args: ArgsType) => (
  <SubtitleElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </SubtitleElement>
);
