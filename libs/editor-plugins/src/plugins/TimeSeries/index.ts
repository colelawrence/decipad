// import { createMigrateDataviewPlugin } from '../../Migrations';
import { createEventInterceptorPluginFactory } from '@decipad/editor-plugin-factories';
import {
  ELEMENT_TIME_SERIES,
  ELEMENT_TIME_SERIES_CAPTION,
  ELEMENT_TIME_SERIES_TH,
  ELEMENT_TIME_SERIES_TR,
} from '@decipad/editor-types';
import { createPluginFactory } from '@udecode/plate-common';
import {
  TimeSeries,
  TimeSeriesCaption,
  TimeSeriesColumnHeader,
  TimeSeriesColumnHeaderRow,
} from '@decipad/editor-components';
import { createNormalizeTimeSeriesPlugin } from './createNormalizeTimeSeriesPlugin';
import { createNormalizeTimeSeriesHeaderAggregationPlugin } from './createNormalizeTimeSeriesHeaderAggregationPlugin';

export const createTimeSeriesPlugin = createPluginFactory({
  key: ELEMENT_TIME_SERIES,
  isElement: true,
  component: TimeSeries,
  plugins: [
    {
      key: ELEMENT_TIME_SERIES_CAPTION,
      isElement: true,
      component: TimeSeriesCaption,
    },
    {
      key: ELEMENT_TIME_SERIES_TR,
      isElement: true,
      isVoid: false,
      component: TimeSeriesColumnHeaderRow,
    },
    {
      key: ELEMENT_TIME_SERIES_TH,
      isElement: true,
      component: TimeSeriesColumnHeader,
    },
    createNormalizeTimeSeriesPlugin(),
    createNormalizeTimeSeriesHeaderAggregationPlugin(),
    createEventInterceptorPluginFactory({
      name: 'INTERCEPT_DATA_VIEW',
      elementTypes: [ELEMENT_TIME_SERIES],
      interceptor: () => true,
    })(),
    // createMigrateDataviewPlugin(),
  ],
});
