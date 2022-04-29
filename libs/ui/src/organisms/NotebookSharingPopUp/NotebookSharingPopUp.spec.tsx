import { act, render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotebookSharingPopUp } from './NotebookSharingPopUp';

let user = userEvent.setup();
beforeEach(() => {
  user = userEvent.setup();
});

describe('when the menu is open', () => {
  let result!: RenderResult;
  beforeEach(async () => {
    result = render(
      <NotebookSharingPopUp
        notebook={{ id: 'nbid', name: 'My notebook' }}
        sharingSecret="secret-to-put-in-link"
      />
    );
    await user.click(result.getByText(/share/i));
  });

  it('shows the menu description', () => {
    expect(result.getByText(/enable.+share/i)).toBeVisible();
  });

  it('closes the menu on click outside', async () => {
    result.rerender(
      <>
        <NotebookSharingPopUp
          notebook={{ id: 'nbid', name: 'My notebook' }}
          sharingSecret="secret-to-put-in-link"
        />
        outside
      </>
    );
    expect(result.getByText(/enable.+share/i)).toBeVisible();

    await user.click(result.getByText('outside'));
    expect(result.queryByText(/enable.+share/i)).not.toBeInTheDocument();
  });

  it('does not initially show the sharing link', () => {
    result.rerender(
      <NotebookSharingPopUp
        notebook={{ id: 'nbid', name: 'My notebook' }}
        sharingSecret={undefined}
      />
    );
    expect(result.queryByText(/secret-to-put-in-link/)).not.toBeInTheDocument();
  });

  describe('when enabling sharing', () => {
    beforeEach(async () => {
      await user.click(result.getByRole('checkbox'));
    });

    it('renders the share link', async () => {
      expect(result.getByText(/secret-to-put-in-link/)).toBeVisible();
    });

    describe('when copying the link', () => {
      const { execCommand } = document;
      let mockExecCommand: jest.MockedFunction<typeof document.execCommand>;
      beforeEach(() => {
        mockExecCommand = jest.fn((..._args) => true);
        document.execCommand = mockExecCommand;
      });
      afterEach(() => {
        document.execCommand = execCommand;
      });

      beforeEach(() => {
        jest.useFakeTimers();
        user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      });
      afterEach(() => {
        jest.useRealTimers();
      });

      beforeEach(async () => {
        await user.click(result.getByText(/copy/i));
      });

      it('shows a confirmation briefly', () => {
        expect(result.getByText(/copied/i)).toBeInTheDocument();

        act(() => {
          jest.advanceTimersByTime(5_000);
        });
        expect(result.queryByText(/copied/i)).not.toBeInTheDocument();
      });

      it('runs the copy command', () => {
        expect(mockExecCommand).toHaveBeenCalledWith('copy');
      });
    });
  });
});
