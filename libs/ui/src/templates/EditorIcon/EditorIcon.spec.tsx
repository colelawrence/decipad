import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { EditorIcon } from '..';

const props: ComponentProps<typeof EditorIcon> = {
  icon: 'Spider',
  color: 'Sun',
};

describe('Icon Popover Molecule', () => {
  it('renders the initial icon', () => {
    const { getByTitle } = render(<EditorIcon {...props} icon="Spider" />);

    expect(getByTitle(/spider/i)).toBeInTheDocument();
  });
});
