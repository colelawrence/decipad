import { UnorderedList } from '@chakra-ui/layout';

import { render } from 'test-utils';
import { ListItem } from './ListItem.component';

describe('ListItem Block', () => {
  it('renders', () => {
    const { container } = render(
      <UnorderedList>
        <ListItem
          element={{
            children: [{ text: 'Hello World' }],
          }}
          attributes={{ 'data-slate-node': 'element', ref: null }}
        >
          Hello World
        </ListItem>
      </UnorderedList>
    );

    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <UnorderedList>
        <ListItem
          element={{
            children: [{ text: 'Hello World' }],
          }}
          attributes={{ 'data-slate-node': 'element', ref: null }}
        >
          Hello World
        </ListItem>
      </UnorderedList>
    );

    expect(container).toMatchSnapshot();
  });
});
