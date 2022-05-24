import { render, screen } from '@testing-library/react';
import { Bullet } from './Bullet';

it('renders a bullet icon', () => {
  render(<Bullet />);
  expect(screen.getByTitle(/bullet/i)).toBeInTheDocument();
});

it('cycles through different icons at different depths', () => {
  const d1InnerHTML = render(<Bullet depth={1} />).container.innerHTML;

  let depthRepeatingFirst;
  // I'm usually in favor of readable over concise code, but this is an art exhibition now
  for (
    depthRepeatingFirst = 2;
    render(<Bullet depth={depthRepeatingFirst} />).container.innerHTML !==
    d1InnerHTML;
    depthRepeatingFirst += 1
  );

  expect(depthRepeatingFirst).toBe(4);
});
