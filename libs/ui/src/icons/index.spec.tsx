import { render, screen } from '@testing-library/react';
import { isValidElementType } from 'react-is';
import * as icons from '.';

const iconExports = Object.entries(icons).filter(([, icon]) =>
  isValidElementType(icon)
);

describe.each(iconExports)('the %s icon', (_name, Icon) => {
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('has a title', () => {
    render(
      <Icon
        // some props that will fulfill every icons mandatory props interface
        {...({
          type: 'expand',
          direction: 'right',
          variant: 'down',
          active: true,
          title: 'foonar',
        } as any)}
      />
    );
    expect(screen.getByTitle(/.+/)).toBeInTheDocument();
  });

  it('does not have fixed dimensions', () => {
    const { container } = render(
      <Icon
        // some props that will fulfill every icons mandatory props interface
        {...({
          type: 'expand',
          direction: 'right',
          variant: 'down',
          active: true,
          title: 'foonar',
        } as any)}
      />
    );
    const svg = container.querySelector('svg, span');
    expect(svg).not.toHaveAttribute('width');
    expect(svg).not.toHaveAttribute('height');
  });
});
