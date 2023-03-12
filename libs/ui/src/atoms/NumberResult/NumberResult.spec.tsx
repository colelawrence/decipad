import { render, screen } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { NumberResult } from './NumberResult';

describe('NumberResult', () => {
  it('renders value', async () => {
    render(<NumberResult {...await runCode(`10`)} />);

    expect(screen.getByText('10')).toBeVisible();
  });

  it('renders negative values', async () => {
    const { container } = render(<NumberResult {...await runCode(`-10`)} />);
    expect(container.textContent).toMatchInlineSnapshot(`"-10"`);
  });

  it('renders formatted value', async () => {
    const { container } = render(<NumberResult {...await runCode(`10000`)} />);
    expect(container.textContent).toMatchInlineSnapshot(`"10 thousand"`);
  });

  it('renders zero', async () => {
    const { container } = render(<NumberResult {...await runCode(`0`)} />);
    expect(container.textContent).toMatchInlineSnapshot(`"0"`);
  });

  it('renders 0.0', async () => {
    const { container } = render(<NumberResult {...await runCode(`0.0`)} />);
    expect(container.textContent).toMatchInlineSnapshot(`"0"`);
  });

  it('renders decimal value', async () => {
    const { container } = render(<NumberResult {...await runCode(`0.1`)} />);
    expect(container.textContent).toMatchInlineSnapshot(`"0.1"`);
  });

  it('renders super small decimal value', async () => {
    const { container } = render(<NumberResult {...await runCode(`10^-20`)} />);
    expect(container.textContent).toMatchInlineSnapshot(`"≈10×10⁻²¹"`);
  });

  it('renders super super small decimal value', async () => {
    const { container } = render(
      <NumberResult {...await runCode(`10^-101`)} />
    );
    expect(container.textContent).toMatchInlineSnapshot(`"≈0.00"`);
  });

  it('rounds fraction', async () => {
    const { container } = render(
      <NumberResult {...await runCode(`1/27932716234532345672234567`)} />
    );
    expect(container.textContent).toMatchInlineSnapshot(`"≈0.00"`);
  });

  it('negative exponents are not nan', async () => {
    const { container } = render(
      <NumberResult {...await runCode(`(1+(4%/12))^-140`)} />
    );
    expect(container.textContent).toMatchInlineSnapshot(`"≈0.63"`);
  });

  it('renders huge number', async () => {
    const { container } = render(<NumberResult {...await runCode(`10^101`)} />);
    expect(container.textContent).toMatchInlineSnapshot(
      `"100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"`
    );
  });

  it('renders repetitive decimal', async () => {
    const { container } = render(<NumberResult {...await runCode(`1/3`)} />);
    expect(container.textContent).toMatchInlineSnapshot(`"≈0.33"`);
  });

  it('shows approximation of long decimal (1)', async () => {
    const { container } = render(
      <NumberResult {...await runCode(`5.81 / 41248.20`)} />
    );
    expect(container.textContent).toMatchInlineSnapshot(`"≈140.85×10⁻⁶"`);
  });

  it('shows approximation of long decimal (2)', async () => {
    const { container } = render(
      <NumberResult {...await runCode(`0.000007 / 2`)} />
    );
    expect(container.textContent).toMatchInlineSnapshot(`"≈3.5×10⁻⁶"`);
  });

  describe('units', () => {
    it('renders unit', async () => {
      const { container } = render(
        <NumberResult {...await runCode('1 banana')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(`"1 banana"`);
    });

    it('renders unit pluralization', async () => {
      const { container } = render(
        <NumberResult {...await runCode('1 banana + 1 banana')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(`"2 bananas"`);
    });

    it('renders in stuff', async () => {
      const { container } = render(
        <NumberResult {...await runCode('1 decimeter in centimeter')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(`"10 centimeters"`);
    });

    it('can operate crazy numbers (2)', async () => {
      const { container } = render(
        <NumberResult {...await runCode('69 meter^100 in ft^100')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(
        `"≈273749178131136126854001791227874085602067535229707755.77 ft¹⁰⁰"`
      );
    });

    it('knows heavy', async () => {
      const { container } = render(
        <NumberResult {...await runCode('1 pound in kg')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(`"≈0.45 kg"`);
    });

    it('can count mississipis', async () => {
      const { container } = render(
        <NumberResult
          {...await runCode(
            '1 Mississippi 2 Mississippi 3 Mississippi 4 Mississippi 5 Mississippi 6 Mississippi 7 Mississippi 8 Mississippi 9 Mississippi 10 Mississippi'
          )}
        />
      );
      expect(container.textContent).toMatchInlineSnapshot(
        `"≈3.63 million Mississippis¹⁰"`
      );
    });

    it('dont loose my cash', async () => {
      const { container } = render(
        <NumberResult {...await runCode('12.5 gbp/day')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(`"£12.5 per day"`);
    });

    it('my kilos', async () => {
      const { container } = render(
        <NumberResult {...await runCode('21.75 kg')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(`"21.75 kg"`);
    });

    it('my liters', async () => {
      const { container } = render(
        <NumberResult {...await runCode('0.001 liters / kmeter')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(
        `"≈0 liters per kilometer"`
      );
    });

    it('$1K', async () => {
      const { container } = render(<NumberResult {...await runCode('$1K')} />);
      expect(container.textContent).toMatchInlineSnapshot(`"$1,000"`);
    });

    it('0.4 M£', async () => {
      const { container } = render(
        <NumberResult {...await runCode('0.4 M£')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(`"£400K"`);
    });

    it('my minutes', async () => {
      const { container } = render(
        <NumberResult {...await runCode('5 minutes/kilometer')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(
        `"5 minutes per kilometer"`
      );
    });

    it('£/kWh', async () => {
      const { container } = render(
        <NumberResult {...await runCode('5 £/kWh')} />
      );
      expect(container.textContent).toMatchInlineSnapshot(`"£5 per kWh"`);
    });
  });
});

it('renders percentage', async () => {
  const { container } = render(<NumberResult {...await runCode('11%')} />);
  expect(container.textContent).toMatchInlineSnapshot(`"11%"`);
});

// eslint-disable-next-line jest/no-disabled-tests
it.skip('does time conversions', async () => {
  const { container } = render(
    <NumberResult {...await runCode('1 minute in seconds')} />
  );
  expect(container.textContent).toMatchInlineSnapshot(`"60 seconds"`);
});
