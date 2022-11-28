import { render } from '@testing-library/react';
import { ComponentProps } from 'react';

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
};
const props: ComponentProps<typeof DashboardSidebar> = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  Heading: 'h1',
  activeWorkspace: aWorkspace,
  allWorkspaces: [aWorkspace].map((workspace) => ({
    ...workspace,
    href: `/w/${aWorkspace.id}`,
    numberOfMembers: 1,
  })),
};

describe('avatar interactions', () => {
  it('renders an account menu avatar', () => {
    const { getByLabelText } = render(<DashboardSidebar {...props} />);
    expect(getByLabelText(/Avatar of user A/i)).toBeVisible();
  });
  it('opens and closes the account menu', async () => {
    const { queryByText } = render(<DashboardSidebar {...props} />);
    expect(queryByText(/log.*out/i)).not.toBeInTheDocument();
  });
});
