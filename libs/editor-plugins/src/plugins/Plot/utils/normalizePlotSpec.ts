/* eslint-disable no-param-reassign */
import { cssVarHex } from '@decipad/ui';
import { PlotSpec } from './plotUtils.interface';

export const normalizePlotSpec = (
  spec: PlotSpec | undefined
): PlotSpec | undefined => {
  if (!spec) {
    return spec;
  }
  if (spec.mark.type === 'arc') {
    // pie charts
    if (spec.encoding.x) {
      spec.encoding.x = undefined;
    }
    if (spec.encoding.y) {
      spec.encoding.y = undefined;
    }
    if (spec.encoding.size) {
      spec.encoding.size = undefined;
    }
    if (!spec.mark.theta) {
      spec.mark.theta = 0;
    }
    if (!spec.mark.innerRadius) {
      spec.mark.innerRadius = 50;
    }
    if (spec.encoding.theta?.scale) {
      spec.encoding.theta.scale = undefined;
    }
  } else if (spec.encoding.theta) {
    spec.encoding.theta = undefined;
  }

  if (spec.mark.type === 'line' || spec.mark.type === 'area') {
    if (!spec.mark.point) {
      spec.mark.point = {
        fill: !spec.encoding.color
          ? cssVarHex('chartThemeMonochromeBlue5')
          : undefined,
        filled: true,
        size: 20,
        strokeWidth: 3,
      };
    }
  }

  if (spec.mark.type === 'line') {
    if (spec.encoding.size) {
      spec.encoding.size = undefined;
    }
  }

  if (spec.mark.type === 'bar' && !spec.mark.cornerRadiusEnd) {
    spec.mark.cornerRadiusEnd = 4;
    if (spec.encoding?.y?.axis) {
      spec.encoding.y.axis.labelAlign = 'right';
    }
    if (spec.encoding.size) {
      spec.encoding.size = undefined;
    }
  }

  if (!spec.config) {
    spec.config = {};
  }
  if (!spec.config.autosize) {
    spec.config.autosize = 'fit';
  }
  if (!spec.config.axis) {
    spec.config.axis = {
      titleColor: cssVarHex('chartThemeMonochromeGrey7'),
    };
  }

  if (spec.encoding.color) {
    if (!spec.encoding.color.scale?.scheme) {
      spec.encoding.color.scale = {
        scheme: 'sameblue',
      };
    }
  }

  return spec;
};
