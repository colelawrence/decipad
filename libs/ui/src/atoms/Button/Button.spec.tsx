import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

it('renders the button text', () => {
  const { getByRole } = render(<Button>text</Button>);
  expect(getByRole('button')).toHaveTextContent('text');
});

it('emits click events', () => {
  const handleClick = jest.fn();
  const { getByRole } = render(<Button onClick={handleClick}>text</Button>);

  userEvent.click(getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});

describe('when primary', () => {
  it('has a different background color', () => {
    const { rerender, getByRole } = render(<Button>text</Button>);
    const normalBackgroundColor = getComputedStyle(
      getByRole('button')
    ).backgroundColor;

    rerender(<Button primary>text</Button>);
    const primaryBackgroundColor = getComputedStyle(
      getByRole('button')
    ).backgroundColor;

    expect(primaryBackgroundColor).not.toEqual(normalBackgroundColor);
  });
});

describe('when extra slim', () => {
  it('has lower vertical padding', () => {
    const { rerender, getByRole } = render(<Button>text</Button>);
    const normalPaddingTop = Number(
      getComputedStyle(getByRole('button')).paddingTop.replace(/px$/, '')
    );

    rerender(<Button extraSlim>text</Button>);
    const extraSlimPaddingTop = Number(
      getComputedStyle(getByRole('button')).paddingTop.replace(/px$/, '')
    );

    expect(extraSlimPaddingTop).toBeLessThan(normalPaddingTop);
  });
});

describe('the type', () => {
  it('is button by default', () => {
    const { getByRole } = render(<Button>text</Button>);
    expect(getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('is submit by default for a primary button', () => {
    const { getByRole } = render(<Button primary>text</Button>);
    expect(getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('can be overriden', () => {
    const { getByRole } = render(
      <Button primary submit={false}>
        text
      </Button>
    );
    expect(getByRole('button')).not.toHaveAttribute('type', 'submit');
  });
});

describe('with an href', () => {
  it('renders as a link', () => {
    const { getByRole } = render(<Button href="/page">icon</Button>);
    expect(getByRole('link')).toHaveAttribute('href', '/page');
  });

  it('renders a noop href when disabled', () => {
    const { getByRole } = render(
      <Button href="/page" disabled>
        icon
      </Button>
    );
    expect(getByRole('link')).toHaveAttribute('href', '');
  });
});
