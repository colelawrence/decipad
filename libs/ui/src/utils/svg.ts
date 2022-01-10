import { renderToStaticMarkup } from 'react-dom/server';

export const getSvgAspectRatio = (element: React.ReactElement): number => {
  const markup = renderToStaticMarkup(element);

  const container = document.createElement('div');
  container.innerHTML = markup;

  const svg = container.querySelector('svg');
  if (!svg) {
    throw new Error(
      'Failed to calculate SVG aspect ratio. Element does not contain an SVG.'
    );
  }
  const { width, height } = svg.viewBox.baseVal;
  return width / height;
};
