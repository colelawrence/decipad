import { MemoryRouter } from 'react-router-dom';
import { GlobalStyles, GlobalThemeStyles } from '../src/index';

export default {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <GlobalStyles>
          <GlobalThemeStyles color="Catskill" />
          <div style={{ width: '100%', padding: '24px' }}>
            <Story />
          </div>
        </GlobalStyles>
      </MemoryRouter>
    ),
  ],
  parameters: {},
} satisfies Preview;
