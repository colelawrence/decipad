// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Meta, Story } from '@storybook/react';
import { CSSProperties } from 'react';
import * as Icons from '.';
import { UserIconKey, userIconKeys } from '../utils';

const wrapperStyle = {
  display: 'grid',
  gridGap: '5px',
  gridTemplateColumns: 'repeat(10, 30px)',
  gridTemplateRows: '30px 30px 30px',
};

function icon(nr = '24') {
  return {
    width: `${nr}px`,
    height: `${nr}px`,
  };
}

const allIcons = Object.values(Icons).slice(0, -1);
const userIcons = allIcons.filter((Icon) =>
  userIconKeys.includes(Icon.name as UserIconKey)
);
const slashIcons = allIcons.filter((Icon) =>
  [
    'Input',
    'Slider',
    'TableSlash',
    'Calculations',
    'Chart',
    'DatePicker',
    'Heading1',
    'Heading2',
    'Divider',
    'Callout',
    'Blockquote',
    'CodeBlock',
    'Sketch',
  ].includes(Icon.name)
);
const markIcons = allIcons.filter((Icon) =>
  [
    'Bold',
    'Italic',
    'Strikethrough',
    'Underline',
    'Highlight',
    'Code',
  ].includes(Icon.name)
);

const tableIcons = allIcons.filter((Icon) =>
  ['Text', 'All', 'Calendar'].includes(Icon.name)
);

function renderWithStyle(IC: JSX.Element, style: CSSProperties | undefined) {
  return (
    <span style={style}>
      <IC variant="down" type="expand" direction="down" />
    </span>
  );
}

export default {
  title: 'Atoms / UI / Icons',
} as Meta;

export const Normal: Story = () => (
  <>
    <div>
      <p>User Icons</p>
      <br />
      <div style={wrapperStyle}>
        {userIcons.map((IC) => renderWithStyle(IC, icon()))}
      </div>
    </div>
    <br />
    <div>
      <p>Slash Icons</p>
      <br />
      <div style={wrapperStyle}>
        {slashIcons.map((IC) => renderWithStyle(IC, icon('32')))}
      </div>
    </div>
    <div>
      <p>Mark Icons</p>
      <br />
      <div style={wrapperStyle}>
        {markIcons.map((IC) => renderWithStyle(IC, icon()))}
      </div>
    </div>
    <div>
      <p>Table Icons</p>
      <br />
      <div style={wrapperStyle}>
        {tableIcons.map((IC) => renderWithStyle(IC, icon('14')))}
      </div>
    </div>
    <div>
      <p>Other Icons</p>
      <br />
      <div style={wrapperStyle}>
        {allIcons
          .filter((Icon) => !slashIcons.includes(Icon))
          .filter((Icon) => !userIcons.includes(Icon))
          .filter((Icon) => !markIcons.includes(Icon))
          .filter((Icon) => !tableIcons.includes(Icon))
          .map((IC) => renderWithStyle(IC, icon()))}
      </div>
    </div>
  </>
);
