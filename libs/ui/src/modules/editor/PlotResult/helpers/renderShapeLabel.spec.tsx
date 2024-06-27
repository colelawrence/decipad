import { render } from '@testing-library/react';
import { renderShapeLabel } from '.';
import { BarLabelProps } from '../Charts/types';

const BarLabelDefaultProps: BarLabelProps = {
  orientation: 'vertical',
  barVariant: 'grouped',
  referenceValue: 100,
};

const BarLabelHorizontalProps: BarLabelProps = {
  ...BarLabelDefaultProps,
  orientation: 'horizontal',
};

const BarLabelStackedProps: BarLabelProps = {
  ...BarLabelDefaultProps,
  barVariant: 'stacked',
};

const BarLabelStacked100Props: BarLabelProps = {
  ...BarLabelDefaultProps,
  barVariant: 'stacked100',
};

const invalidLabelProps = {
  x: undefined,
  y: undefined,
  value: undefined,
  index: undefined,
  height: undefined,
  width: undefined,
};

const validLabelProps = {
  x: 10,
  y: 20,
  value: 50,
  index: 1,
  height: 100,
  width: 30,
};

describe('renderShapeLabel', () => {
  describe('vertical & grouped', () => {
    it('renders the label correctly with valid props', () => {
      const RenderedLabel =
        renderShapeLabel(BarLabelDefaultProps)(validLabelProps);
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('text')).toHaveTextContent('50');
      expect(container.querySelector('rect')).toBeInTheDocument();
    });

    it('handles invalid props gracefully', () => {
      const RenderedLabel =
        renderShapeLabel(BarLabelDefaultProps)(invalidLabelProps);
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('rect')).not.toBeInTheDocument();
      expect(container.querySelector('text')).not.toBeInTheDocument();
    });

    it('does not render the label when it does not fit', () => {
      const nonFittingLabelProps = {
        x: 10,
        y: 20,
        value: 50,
        index: 1,
        height: 10,
        width: 30,
      };

      const RenderedLabel =
        renderShapeLabel(BarLabelDefaultProps)(nonFittingLabelProps);
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('rect')).not.toBeInTheDocument();
      expect(container.querySelector('text')).not.toBeInTheDocument();
    });
  });

  describe('horizontal & grouped', () => {
    it('renders the label correctly with valid props', () => {
      const RenderedLabel = renderShapeLabel(BarLabelHorizontalProps)(
        validLabelProps
      );
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('text')).toHaveTextContent('50');
      expect(container.querySelector('rect')).toBeInTheDocument();
    });

    it('does not render the label when it does not fit', () => {
      const nonFittingLabelProps = {
        x: 20,
        y: 10,
        value: 50,
        index: 1,
        height: 30,
        width: 10,
      };

      const RenderedLabel = renderShapeLabel(BarLabelHorizontalProps)(
        nonFittingLabelProps
      );
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('rect')).not.toBeInTheDocument();
      expect(container.querySelector('text')).not.toBeInTheDocument();
    });

    it('rotates the label when it exceeds the bar width', () => {
      const rotatedLabelProps = {
        x: 10,
        y: 20,
        value: 1,
        index: 1,
        height: 100,
        width: 30,
      };

      const RenderedLabel = renderShapeLabel({
        ...BarLabelHorizontalProps,
        referenceValue: 1000,
      })(rotatedLabelProps);
      const { container } = render(<svg>{RenderedLabel}</svg>);
      expect(container.querySelector('rect')).toHaveAttribute(
        'transform',
        expect.stringContaining('rotate')
      );
      expect(container.querySelector('text')).toHaveAttribute(
        'transform',
        expect.stringContaining('rotate')
      );
    });
  });

  describe('vertical & stacked', () => {
    it('renders the label correctly with valid props', () => {
      const RenderedLabel =
        renderShapeLabel(BarLabelStackedProps)(validLabelProps);
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('text')).toHaveTextContent('50');
      expect(container.querySelector('rect')).toBeInTheDocument();
    });

    it('does not render the label when it does not fit', () => {
      const nonFittingLabelProps = {
        x: 10,
        y: 20,
        value: 50,
        index: 1,
        height: 10,
        width: 30,
      };

      const RenderedLabel =
        renderShapeLabel(BarLabelStackedProps)(nonFittingLabelProps);
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('rect')).not.toBeInTheDocument();
      expect(container.querySelector('text')).not.toBeInTheDocument();
    });
  });

  describe('horizontal & stacked', () => {
    it('renders the label correctly with valid props', () => {
      const RenderedLabel = renderShapeLabel({
        ...BarLabelStackedProps,
        orientation: 'horizontal',
      })(validLabelProps);
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('text')).toHaveTextContent('50');
      expect(container.querySelector('rect')).toBeInTheDocument();
    });

    it('does not render the label when it does not fit', () => {
      const nonFittingLabelProps = {
        x: 20,
        y: 10,
        value: 50,
        index: 1,
        height: 30,
        width: 10,
      };

      const RenderedLabel = renderShapeLabel({
        ...BarLabelStackedProps,
        orientation: 'horizontal',
      })(nonFittingLabelProps);
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('rect')).not.toBeInTheDocument();
      expect(container.querySelector('text')).not.toBeInTheDocument();
    });
  });

  describe('horizontal & stacked100', () => {
    it('renders the label correctly with valid props', () => {
      const RenderedLabel = renderShapeLabel({
        ...BarLabelStacked100Props,
        orientation: 'horizontal',
      })(validLabelProps);
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('text')).toHaveTextContent('50');
      expect(container.querySelector('rect')).toBeInTheDocument();
    });

    it('does not render the label when it does not fit', () => {
      const nonFittingLabelProps = {
        x: 20,
        y: 10,
        value: 50,
        index: 1,
        height: 30,
        width: 10,
      };

      const RenderedLabel = renderShapeLabel({
        ...BarLabelStacked100Props,
        orientation: 'horizontal',
      })(nonFittingLabelProps);
      const { container } = render(<svg>{RenderedLabel}</svg>);

      expect(container.querySelector('rect')).not.toBeInTheDocument();
      expect(container.querySelector('text')).not.toBeInTheDocument();
    });
  });
});
