import { SubheadingElement } from './Subheading';

export default {
  title: 'Atoms/Editor/Elements/Subheading',
  component: SubheadingElement,
  args: {
    children: 'Subheading Element',
  },
};

interface ArgsType {
  children: string;
}

export const Subheading = (args: ArgsType) => (
  <SubheadingElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </SubheadingElement>
);
