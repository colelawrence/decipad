import { readdirSync } from 'fs';
import { basename } from 'path';
import { render, RenderResult } from '@testing-library/react';

import * as icons from '.';

// __esModule should be non-enumerable but for some reason it shows up
const iconExports = Object.entries(icons).filter((key) => {
  return !String(key).startsWith('_');
});

it('exports every icon', () => {
  const numIconFolders = readdirSync(__dirname).filter(notIndexOrSelf).length;
  const numExportedIcons = iconExports.length;
  expect(numExportedIcons).toEqual(numIconFolders);
});

describe.each(iconExports)('the %s icon', (_name, Icon) => {
  let result!: RenderResult;
  beforeEach(() => {
    result = render(
      <Icon
        // some props that will fulfill every icons mandatory props interface
        type="expand"
        direction="right"
        variant="down"
      />
    );
  });

  it('has a title', () => {
    expect(result.getByTitle(/.+/)).toBeInTheDocument();
  });

  it('does not have fixed dimensions', () => {
    // so that it will fill even a large container without having to set styles like 'svg { width: 100% }'
    const svg = result.container.querySelector('svg');
    expect(svg).not.toHaveAttribute('width');
    expect(svg).not.toHaveAttribute('height');
  });
});

function notIndexOrSelf(entry: string) {
  return entry !== 'index.ts' && entry !== basename(__filename);
}
