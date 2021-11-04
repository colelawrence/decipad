import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';

import { MenuWrapper as wrapper } from '../../test-utils';
import { SlashCommandsMenuItem } from './SlashCommandsMenuItem';

const props: ComponentProps<typeof SlashCommandsMenuItem> = {
  title: 'Title',
  description: 'Description',
  icon: <svg />,
};

it('emits click events', () => {
  const handleSelect = jest.fn();
  const { getByText } = render(
    <SlashCommandsMenuItem {...props} title="Title" onSelect={handleSelect} />,
    { wrapper }
  );

  userEvent.click(getByText('Title'));
  expect(handleSelect).toHaveBeenCalled();
});
