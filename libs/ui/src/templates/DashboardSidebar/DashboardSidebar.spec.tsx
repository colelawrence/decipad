import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';

const sampleWorkspace = {
  id: 'IoQ8F12AF1L6bAP5RSpjj',
  name: "Aspen's Workspace",
  pads: {
    items: [
      {
        id: 'Ha0cGcdmGVSauxf2oLl9w',
        name: 'Use of Funds',
        icon: 'Wallet-Sun',
        status: null,
        createdAt: '2022-11-25T22:19:56.000Z',
        archived: true,
        isPublic: null,
        __typename: 'Pad',
      },
      {
        id: 'fk8yMJPizBKOYuHNMOR26',
        name: 'I won the lottery! Now what',
        icon: 'Trophy-Perfume',
        status: null,
        createdAt: '2022-11-25T22:19:34.000Z',
        archived: null,
        isPublic: null,
        __typename: 'Pad',
      },
      {
        id: 'XFGBiuaxbB8YG0hOA60Zp',
        name: 'Welcome to Decipad',
        icon: 'Happy-Sulu',
        status: null,
        createdAt: '2022-11-25T22:19:15.000Z',
        archived: null,
        isPublic: null,
        __typename: 'Pad',
      },
    ],
    __typename: 'PagedPadResult',
  },
  __typename: 'Workspace',
};

const aWorkspace = {
  ...sampleWorkspace,
  numberOfMembers: 1,
  sections: [],
  isActive: false,
};
const props: ComponentProps<typeof DashboardSidebar> = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  Heading: 'h1',
  onDeleteSection: noop,
  onCreateSection: () => new Promise(noop),
  onUpdateSection: () => new Promise(noop),
  activeWorkspace: aWorkspace,
  allWorkspaces: [aWorkspace].map((workspace) => ({
    ...workspace,
    href: `/w/${aWorkspace.id}`,
    numberOfMembers: 1,
  })),
};

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('avatar interactions', () => {
  it('renders an account menu avatar', () => {
    const { getByLabelText } = render(
      <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          <DashboardSidebar {...props} />
        </DndProvider>
      </BrowserRouter>
    );
    expect(getByLabelText(/Avatar of user/i)).toBeVisible();
  });
  it('opens and closes the account menu', () => {
    const { queryByText } = render(
      <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          <DashboardSidebar {...props} />
        </DndProvider>
      </BrowserRouter>
    );
    expect(queryByText(/log.*out/i)).not.toBeInTheDocument();
  });
});
