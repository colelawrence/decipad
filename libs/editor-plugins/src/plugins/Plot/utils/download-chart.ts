import html2canvas from 'html2canvas';
import { poweredBy } from 'libs/ui/src/images';
import { slimBlockWidth } from 'libs/ui/src/styles/editor-layout';

export const handleExportSVGUsingHtml2Canvas = (elementId: string) => () => {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  const targetElement = element.querySelector('.recharts-wrapper');
  if (!targetElement) {
    return;
  }

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = `${slimBlockWidth}px`; // Set desired width here

  container.appendChild(targetElement.cloneNode(true));

  const poweredByImage = new Image();
  poweredByImage.src = poweredBy;
  poweredByImage.style.position = 'absolute';
  poweredByImage.style.top = '10px';
  poweredByImage.style.left = '10px';
  poweredByImage.style.width = '175px';
  poweredByImage.style.height = 'auto';
  container.appendChild(poweredByImage);

  document.body.appendChild(container);

  // Temporarily hide placeholders
  const placeholders = container.querySelectorAll(
    '[data-remove-on-export="true"]'
  );
  placeholders.forEach((placeholder) => {
    const htmlElement = placeholder as HTMLElement;
    htmlElement.style.visibility = 'hidden';
  });

  html2canvas(container, {
    width: 600,
    scale: 4,
  }).then((canvas) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `decipad-${elementId.replace('#', '')}-1x.png`;
    link.click();

    placeholders.forEach((placeholder) => {
      const htmlElement = placeholder as HTMLElement;
      htmlElement.style.visibility = 'visible';
    });

    document.body.removeChild(container);
  });
};
