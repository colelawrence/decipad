export interface Command {
  type: string;
  mode: 'inline' | 'block' | 'inline-block';
  title: string;
  description: string;
  darkImage: string;
  lightImage: string;
}

const getLightImage = (name: string) =>
  `/assets/dash-commands-images/light/${name}.svg`;
const getDarkImage = (name: string) =>
  `/assets/dash-commands-images/dark/${name}.svg`;

export const commands: Command[] = [
  {
    type: 'code_block',
    mode: 'block',
    title: 'Code Block',
    description: 'Write some Decilang inside this code block',
    darkImage: getDarkImage('code_block'),
    lightImage: getLightImage('code_block'),
  },
  {
    type: 'blockquote',
    mode: 'block',
    title: 'Quote',
    description: 'Perfect for descriptions or quotes',
    darkImage: getDarkImage('blockquote'),
    lightImage: getLightImage('blockquote'),
  },
  {
    type: 'h1',
    mode: 'block',
    title: 'Heading One',
    description: 'The biggest header',
    darkImage: getDarkImage('H1'),
    lightImage: getLightImage('H1'),
  },
  {
    type: 'h2',
    mode: 'block',
    title: 'Heading Two',
    description: 'Second biggest header',
    darkImage: getDarkImage('H2'),
    lightImage: getLightImage('H2'),
  },
  {
    type: 'h3',
    mode: 'block',
    title: 'Heading Three',
    description: 'Third biggest header',
    darkImage: getDarkImage('H3'),
    lightImage: getLightImage('H3'),
  },
  {
    type: 'h4',
    mode: 'block',
    title: 'Heading Four',
    description: 'Third smallest header',
    darkImage: getDarkImage('H4'),
    lightImage: getLightImage('H4'),
  },
  {
    type: 'h5',
    mode: 'block',
    title: 'Heading Five',
    description: 'Second smallest header',
    darkImage: getDarkImage('H5'),
    lightImage: getLightImage('H5'),
  },
  {
    type: 'h6',
    mode: 'block',
    title: 'Heading Six',
    description: 'Smallest header',
    darkImage: getDarkImage('H6'),
    lightImage: getLightImage('H6'),
  },
];
