import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotebookSharingPopUp } from './NotebookSharingPopUp';

describe('Notebook Sharing Pop Up', () => {
  it('shows the share menu when clicking share', () => {
    const { getByText } = render(
      <NotebookSharingPopUp link="peanut-butter-jelly-time-peanut-" />
    );

    userEvent.click(getByText(/share/i));

    expect(getByText(/enable.+share/i)).toBeVisible();
  });

  it('does not initially show the sharing link', () => {
    const { getByText, queryByText } = render(
      <NotebookSharingPopUp link="peanut-butter-jelly-time-peanut-" />
    );

    userEvent.click(getByText(/share/i));

    expect(
      queryByText('peanut-butter-jelly-time-peanut-')
    ).not.toBeInTheDocument();
  });

  it('renders the share link after toggling on sharing', async () => {
    const { getByText, getByRole } = render(
      <NotebookSharingPopUp link="peanut-butter-jelly-time-peanut-" />
    );

    userEvent.click(getByText(/share/i));
    userEvent.click(getByRole('checkbox'));

    await waitFor(() => {
      expect(getByText('peanut-butter-jelly-time-peanut-')).toBeVisible();
    });
  });
});
