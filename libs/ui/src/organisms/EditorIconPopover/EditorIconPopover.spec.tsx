import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { baseSwatches } from '../../primitives';
import { EditorIconPopover } from './EditorIconPopover';

describe('Editor Icon Popover Organism', () => {
  it('renders the initial colour', () => {
    const { getByRole } = render(<EditorIconPopover initialColor="Sun" />);

    expect(getComputedStyle(getByRole('button')).backgroundColor).toBe(
      baseSwatches.Sun.rgb
    );
  });

  it('renders the initial icon', () => {
    const { getByTitle } = render(<EditorIconPopover initialIcon="Spider" />);

    expect(getByTitle(/spider/i)).toBeInTheDocument();
  });

  it('emits the icon onchange when called', async () => {
    const handler = jest.fn();

    const { getByRole, getByTitle } = render(
      <EditorIconPopover onChangeIcon={handler} />
    );

    await userEvent.click(getByRole('button'));

    await userEvent.click(getByTitle(/spider/i));

    expect(handler).toHaveBeenCalledWith('Spider');
  });

  it('emits the color onchange when called', async () => {
    const handler = jest.fn();

    const { getByRole } = render(<EditorIconPopover onChangeColor={handler} />);

    await userEvent.click(getByRole('button'));

    await userEvent.click(getByRole('button', { name: 'Sun' }));

    expect(handler).toHaveBeenCalledWith('Sun');
  });
});
