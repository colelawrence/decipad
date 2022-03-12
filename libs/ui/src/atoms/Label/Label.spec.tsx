import { render } from '@testing-library/react';
import { noop } from '@decipad/utils';
import { Label } from './Label';

it('renders the text and referenced content', () => {
  const { getByLabelText } = render(
    <Label
      renderContent={(id) => (
        <input id={id} type="text" value="val" onChange={noop} />
      )}
    >
      text
    </Label>
  );
  expect(getByLabelText('text')).toHaveValue('val');
});

it('generates different ids for each label', () => {
  const { getByLabelText } = render(
    <>
      <Label renderContent={(id) => <input id={id} />}>text1</Label>,
      <Label renderContent={(id) => <input id={id} />}>text2</Label>,
    </>
  );
  expect(getByLabelText('text1')).not.toBe(getByLabelText('text2'));
});
