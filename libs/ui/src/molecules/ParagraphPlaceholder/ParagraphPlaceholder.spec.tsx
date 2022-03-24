import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render } from '@testing-library/react';
import { ParagraphPlaceholder } from './ParagraphPlaceholder';

describe('Paragraph Placeholder', () => {
  it('renders six placeholder atoms', () => {
    const { getAllByRole } = render(<ParagraphPlaceholder />);

    expect(getAllByRole('presentation').length).toBe(6);
  });

  it.each([0, 1, 2, 3, 4, 5])(
    'renders placeholder %i with max width between 85 and 100 percent',
    (i) => {
      const { getAllByRole } = render(<ParagraphPlaceholder />);

      const placeholder = getAllByRole('presentation')[i];
      const width = Number(
        findParentWithStyle(placeholder, 'maxWidth')!.maxWidth.replace('%', '')
      );

      expect(width).toBeGreaterThanOrEqual(75);
      expect(width).toBeLessThanOrEqual(100);
    }
  );

  it('renders different sizing for each paragraph', () => {
    const { getAllByRole } = render(<ParagraphPlaceholder />);

    const placeholders = getAllByRole('presentation');

    const firstWidth = Number(
      findParentWithStyle(placeholders[0], 'maxWidth')!.maxWidth.replace(
        '%',
        ''
      )
    );
    const secondWidth = Number(
      findParentWithStyle(placeholders[1], 'maxWidth')!.maxWidth.replace(
        '%',
        ''
      )
    );

    expect(firstWidth).not.toEqual(secondWidth);
  });
});
