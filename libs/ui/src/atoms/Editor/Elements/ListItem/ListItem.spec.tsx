import { render } from '@testing-library/react';
import { ListItemElement } from './ListItem';

describe('Editor List Item Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <ListItemElement
        attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
        leaf={{ text: '' }}
        text={{ text: '' }}
        nodeProps={{ styles: { root: { css: null } } }}
      >
        List Item Element
      </ListItemElement>
    );

    expect(getByText('List Item Element')).toBeVisible();
  });
});
