import { noop } from '@decipad/utils';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';

it('renders the text and referenced content', () => {
  render(
    <Label
      renderContent={(id) => (
        <input id={id} type="text" value="val" onChange={noop} />
      )}
    >
      text
    </Label>
  );
  expect(screen.getByLabelText('text')).toHaveValue('val');
});

it('generates different ids for each label', () => {
  render(
    <>
      <Label renderContent={(id) => <input id={id} />}>text1</Label>,
      <Label renderContent={(id) => <input id={id} />}>text2</Label>,
    </>
  );
  expect(screen.getByLabelText('text1')).not.toBe(
    screen.getByLabelText('text2')
  );
});
