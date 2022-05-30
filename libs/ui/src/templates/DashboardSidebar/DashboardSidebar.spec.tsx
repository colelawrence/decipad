import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { DashboardSidebar } from './DashboardSidebar';

const props: ComponentProps<typeof DashboardSidebar> = {
  Heading: 'h1',
  activeWorkspace: {
    id: '42',
    name: 'Active Workspace',
    numberOfMembers: 1,
  },
  otherWorkspaces: [],
};

it('renders the workspace switcher (which has a popup) stacked above the sidebar', () => {
  const { getByText } = render(
    <DashboardSidebar
      {...props}
      activeWorkspace={{ ...props.activeWorkspace, name: 'WS' }}
    />
  );
  expect(
    // eslint-disable-next-line no-bitwise
    getByText(/preference/i).compareDocumentPosition(getByText('WS')) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});
