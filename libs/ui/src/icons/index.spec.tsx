import { readdirSync } from 'fs';
import { basename } from 'path';
import { render, RenderResult } from '@testing-library/react';

import * as icons from '.';

it('exports every icon', () => {
  const numIconFolders = readdirSync(__dirname).filter(
    (entry) => entry !== 'index.ts' && entry !== basename(__filename)
  ).length;
  const numExportedIcons = Object.keys(icons).length;
  expect(numExportedIcons).toEqual(numIconFolders);
});

describe.each(Object.entries(icons))('the %s icon', (_name, Icon) => {
  let result!: RenderResult;
  beforeEach(() => {
    result = render(
      <Icon
        // some props that will fulfill every icons mandatory props interface
        type="expand"
      />
    );
  });

  it('has a title', () => {
    expect(result.getByTitle(/.+/)).toBeInTheDocument();
  });

  it('does not have fixed dimensions', () => {
    // so that it will fill even a large container without having to set styles like 'svg { width: 100% }'
    expect(result.container).not.toHaveAttribute('width');
    expect(result.container).not.toHaveAttribute('height');
  });
});
