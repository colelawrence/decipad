import { readdirSync } from 'fs';
import { basename } from 'path';
import { render, RenderResult } from '@testing-library/react';

import * as icons from '.';

it('exports every icon', () => {
  const numIconFolders = readdirSync(__dirname).filter(notIndexOrSelf).length;
  const numExportedIcons = Object.entries(icons).filter(isComponent).length;
  expect(numExportedIcons).toEqual(numIconFolders);
});

describe.each(Object.entries(icons).filter(isComponent))(
  'the %s icon',
  (_name, Icon) => {
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
  }
);

function notIndexOrSelf(entry: string) {
  return entry !== 'index.ts' && entry !== basename(__filename);
}

function isComponent(c: [string, unknown]): boolean {
  return typeof c[1] === 'function';
}
