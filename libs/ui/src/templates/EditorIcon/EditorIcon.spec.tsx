import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { EditorIcon } from '..';

const props: ComponentProps<typeof EditorIcon> = {
  icon: 'Spider',
  color: 'Sun',
};

it('renders the initial icon', () => {
  const { getByTitle } = render(<EditorIcon {...props} icon="Spider" />);

  expect(getByTitle(/spider/i)).toBeInTheDocument();
});

describe('when not readonly', () => {
  it('has a popup', () => {
    const { queryByRole } = render(<EditorIcon {...props} readOnly={false} />);
    expect(queryByRole('button')).toBeInTheDocument();
  });
});
describe('when readonly', () => {
  it('does not have a popup', () => {
    const { queryByRole } = render(<EditorIcon {...props} readOnly />);
    expect(queryByRole('button')).not.toBeInTheDocument();
  });
});
