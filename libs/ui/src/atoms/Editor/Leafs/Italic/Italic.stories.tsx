import { ItalicLeaf } from './Italic';

export default {
  title: 'Atoms/Editor/Leafs/Italic',
  component: ItalicLeaf,
  args: {
    text: 'Italic text',
  },
};

export const Italic = (args: { text: string }) => (
  <ItalicLeaf
    leaf={{ attributes: {}, text: '' }}
    element={{ children: [{ text: '' }] }}
    text={{ text: '' }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
      'data-slate-leaf': true,
    }}
  >
    {args.text}
  </ItalicLeaf>
);
