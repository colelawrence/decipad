import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render } from '@testing-library/react';
import { EditorPlaceholder } from './EditorPlaceholder';

describe('Editor placeholder template', () => {
  it('renders the heading placeholder', () => {
    const { getAllByRole } = render(<EditorPlaceholder />);

    const placeholders = getAllByRole('presentation');

    const header = placeholders[0];

    expect(header).toBeInTheDocument();

    const height = Number(
      findParentWithStyle(header, 'height')!.height.replace('px', '')
    );

    expect(height).toBeGreaterThan(28);
  });

  it('renders 8 total placeholders', () => {
    const { getAllByRole } = render(<EditorPlaceholder />);

    expect(getAllByRole('presentation').length).toBe(8);
  });
});
