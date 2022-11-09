import { render, screen } from '@testing-library/react';
import { readdirSync } from 'fs';
import { basename } from 'path';
import { isValidElementType } from 'react-is';
import * as icons from '.';

function notIndexOrSelf(entry: string) {
  return (
    entry !== 'index.ts' &&
    entry !== 'index.stories.tsx' &&
    entry !== basename(__filename)
  );
}

const iconExports = Object.entries(icons).filter(([, icon]) =>
  isValidElementType(icon)
);

it('exports every icon', () => {
  const numIconFolders = readdirSync(__dirname).filter(notIndexOrSelf).length;
  const numExportedIcons = iconExports.length;
  expect(numExportedIcons).toEqual(numIconFolders);
});

describe.each(iconExports)('the %s icon', (_name, Icon) => {
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('has a title', () => {
    render(
      <Icon
        // some props that will fulfill every icons mandatory props interface
        type="expand"
        direction="right"
        variant="down"
        active={true}
        title="foonar"
      />
    );
    expect(screen.getByTitle(/.+/)).toBeInTheDocument();
  });

  it('does not have fixed dimensions', () => {
    const { container } = render(
      <Icon
        // some props that will fulfill every icons mandatory props interface
        type="expand"
        direction="right"
        variant="down"
        active={true}
        title="foomnar"
      />
    );
    const svg = container.querySelector('svg, span');
    expect(svg).not.toHaveAttribute('width');
    expect(svg).not.toHaveAttribute('height');
  });
});
