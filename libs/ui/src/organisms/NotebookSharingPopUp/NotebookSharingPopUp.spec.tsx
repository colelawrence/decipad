import { act, render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotebookSharingPopUp } from './NotebookSharingPopUp';

describe('when the menu is open', () => {
  let result!: RenderResult;
  beforeEach(() => {
    result = render(
      <NotebookSharingPopUp
        link="peanut-butter-jelly-time-peanut-"
        sharingActive={true}
      />
    );
    userEvent.click(result.getByText(/share/i));
  });

  it('shows the menu description', () => {
    expect(result.getByText(/enable.+share/i)).toBeVisible();
  });

  it('closes the menu on click outside', () => {
    result.rerender(
      <>
        <NotebookSharingPopUp link="peanut-butter-jelly-time-peanut-" />
        outside
      </>
    );
    expect(result.getByText(/enable.+share/i)).toBeVisible();

    userEvent.click(result.getByText('outside'));
    expect(result.queryByText(/enable.+share/i)).not.toBeInTheDocument();
  });

  it('does not initially show the sharing link', () => {
    result.rerender(
      <NotebookSharingPopUp
        link="peanut-butter-jelly-time-peanut-"
        sharingActive={false}
      />
    );
    expect(
      result.queryByText('peanut-butter-jelly-time-peanut-')
    ).not.toBeInTheDocument();
  });

  describe('when enabling sharing', () => {
    beforeEach(() => {
      userEvent.click(result.getByRole('checkbox'));
    });

    it('renders the share link', async () => {
      expect(
        result.getByText('peanut-butter-jelly-time-peanut-')
      ).toBeVisible();
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

      beforeAll(() => {
        jest.useFakeTimers();
      });
      afterAll(() => {
        jest.useRealTimers();
      });

      beforeEach(() => {
        userEvent.click(result.getByText(/copy/i));
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
