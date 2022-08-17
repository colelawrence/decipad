import { render, waitFor } from '@testing-library/react';
import { noop } from 'lodash';
import { EditorBubblesContext } from '@decipad/react-contexts';
import { BubbleEditor } from './BubbleEditor';

it('shows when editing is present', async () => {
  const blockId = 'random';

  const { queryByText } = render(
    <EditorBubblesContext.Provider
      value={{
        setEditing() {},
        editing: {
          blockId,
          formula: {
            name: 'sumResult',
            expression: '2 + 2',
          },
          deleteBubble() {},
          updateValue() {},
        },
      }}
    >
      <BubbleEditor
        defaultName="sumResult"
        defaultExpr="2 + 2"
        onClose={noop}
        onChange={noop}
      />
    </EditorBubblesContext.Provider>
  );

  await waitFor(() => {
    expect(queryByText('Result')).toBeInTheDocument();
  });
});

it('is hidden otherwise', async () => {
  const { queryByText } = render(
    <BubbleEditor
      defaultName="sumResult"
      defaultExpr="2 + 2"
      onClose={noop}
      onChange={noop}
    />
  );

  await waitFor(() => {
    expect(queryByText('Result')).not.toBeInTheDocument();
  });
});
