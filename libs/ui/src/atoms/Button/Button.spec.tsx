import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

it('renders the button text', () => {
  render(<Button>text</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('text');
});

it('emits click events', async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>text</Button>);

  await userEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});

describe('when disabled', () => {
  it('has a different background color', () => {
    const { rerender } = render(<Button type="primary">text</Button>);
    const normalBackgroundColor = getComputedStyle(
      screen.getByRole('button')
    ).color;

    rerender(
      <Button type="primary" disabled={true}>
        text
      </Button>
    );
    const disabledBackgroundColor = getComputedStyle(
      screen.getByRole('button')
    ).color;

    expect(disabledBackgroundColor).not.toEqual(normalBackgroundColor);
  });
});

describe('when extra large', () => {
  it('has bigger vertical padding', () => {
    const { rerender } = render(<Button>text</Button>);
    const normalPaddingTop = Number(
      getComputedStyle(screen.getByRole('button')).paddingTop.replace(/px$/, '')
    );

    rerender(<Button size="extraLarge">text</Button>);
    const extraLargePaddingTop = Number(
      getComputedStyle(screen.getByRole('button')).paddingTop.replace(/px$/, '')
    );

    expect(extraLargePaddingTop).toBeGreaterThan(normalPaddingTop);
  });
});

describe('when extra slim', () => {
  it('has lower vertical padding', () => {
    const { rerender } = render(<Button>text</Button>);
    const normalPaddingTop = Number(
      getComputedStyle(screen.getByRole('button')).paddingTop.replace(/px$/, '')
    );

    rerender(<Button size="extraSlim">text</Button>);
    const extraSlimPaddingTop = Number(
      getComputedStyle(screen.getByRole('button')).paddingTop.replace(/px$/, '')
    );

    expect(extraSlimPaddingTop).toBeLessThan(normalPaddingTop);
  });
});

describe('the type', () => {
  it('is button by default', () => {
    render(<Button>text</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('is submit by default for a primary button', () => {
    render(<Button type="primary">text</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('can be overriden', () => {
    render(
      <Button type="primary" submit={false}>
        text
      </Button>
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('type', 'submit');
  });
});

describe('with an href', () => {
  it('renders as a link', () => {
    render(<Button href="/page">icon</Button>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/page');
  });

  it('still emits click events', async () => {
    const handleClick = jest.fn();
    render(
      <Button href="/page" onClick={handleClick}>
        icon
      </Button>
    );

    await userEvent.click(screen.getByRole('link'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders a noop href when disabled', () => {
    render(
      <Button href="/page" disabled>
        icon
      </Button>
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '');
  });
});
