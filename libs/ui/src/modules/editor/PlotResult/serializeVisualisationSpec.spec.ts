import { serializeVisualisationSpec } from './serializeVisualisationSpec';

const testCases = [
  [
    'simple pie chart',
    {
      data: {
        table: [
          {
            Name: 'Marta',
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Marbles: 62,
          },
        ],
      },
      repeatedColumns: ['Marbles'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'arc',
          tooltip: true,
          theta: 0,
          innerRadius: 50,
        },
        encoding: {
          color: {
            field: 'Name',
            type: 'nominal',
            title: '',
            sort: null,
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          theta: {
            field: 'Marbles',
            type: 'quantitative',
            title: '',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Name: 'Marta',
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Marbles: 62,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      mark: {
        interpolate: 'natural',
        type: 'arc',
        tooltip: true,
        theta: 0,
        innerRadius: 50,
      },
      encoding: {
        color: {
          field: 'Name',
          type: 'nominal',
          title: '',
          legend: {
            orient: 'bottom',
            direction: 'horizontal',
          },
          sort: null,
          scale: {
            scheme: 'multicolor_yellow_light',
          },
        },
        theta: {
          field: 'Marbles',
          type: 'quantitative',
          title: '',
        },
      },
      config: {
        encoding: {
          color: {
            scheme: 'multicolor_yellow_light',
          },
        },
        mark: {
          strokeWidth: 3,
        },
        autosize: 'fit',
        axis: {
          titleColor: '#323b49',
        },
      },
    },
  ],
  [
    'line charts with two lines',
    {
      data: {
        table: [
          {
            Name: 'Marta',
            Marbles: 14,
            Plants: 43,
          },
          {
            Name: 'Nuno',
            Marbles: 53,
            Plants: 23,
          },
          {
            Name: 'Tony',
            Marbles: 62,
            Plants: 53,
          },
        ],
      },
      repeatedColumns: ['Plants', 'Marbles'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'line',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'Name',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: '',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Name: 'Marta',
            Marbles: 14,
            Plants: 43,
          },
          {
            Name: 'Nuno',
            Marbles: 53,
            Plants: 23,
          },
          {
            Name: 'Tony',
            Marbles: 62,
            Plants: 53,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['Plants', 'Marbles'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'line',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'Name',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: '',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
  [
    'simple bar chart',
    {
      data: {
        table: [
          {
            Name: 'Marta',
            Plants: 43,
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Plants: 23,
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Plants: 53,
            Marbles: 62,
          },
        ],
      },
      repeatedColumns: ['Plants'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'bar',
          tooltip: true,
          width: {
            band: 0.8,
          },
          cornerRadiusEnd: 4,
        },
        encoding: {
          x: {
            field: 'Name',
            type: 'nominal',
            title: '',
            legend: null,
            sort: null,
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            field: 'Plants',
            type: 'quantitative',
            title: '',
            legend: null,
            scale: {
              domain: [0, 56],
            },
          },
          color: {
            field: 'Name',
            type: 'nominal',
            title: '',
            legend: null,
            sort: null,
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Name: 'Marta',
            Plants: 43,
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Plants: 23,
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Plants: 53,
            Marbles: 62,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      mark: {
        interpolate: 'natural',
        type: 'bar',
        tooltip: true,
        width: {
          band: 0.8,
        },
        cornerRadiusEnd: 4,
      },
      encoding: {
        x: {
          field: 'Name',
          type: 'nominal',
          title: '',
          legend: null,
          sort: null,
          axis: {
            labelAngle: 0,
            labelOverlap: true,
            domainColor: '#ecf0f6',
            tickColor: '#ecf0f6',
            labelColor: '#aab1bd',
            labelFontWeight: 700,
            grid: false,
          },
        },
        y: {
          field: 'Plants',
          type: 'quantitative',
          title: '',
          legend: null,
          scale: {
            domain: [0, 56],
          },
        },
        color: {
          field: 'Name',
          type: 'nominal',
          title: '',
          legend: {
            orient: 'bottom',
            direction: 'horizontal',
          },
          sort: null,
          scale: {
            scheme: 'multicolor_yellow_light',
          },
        },
      },
      config: {
        encoding: {
          color: {
            scheme: 'multicolor_yellow_light',
          },
        },
        mark: {
          fill: '#5b85f7',
          strokeWidth: 3,
        },
        autosize: 'fit',
        axis: {
          titleColor: '#323b49',
        },
      },
    },
  ],
  [
    'bar chart with multiple bars',
    {
      data: {
        table: [
          {
            Name: 'Marta',
            Plants: 43,
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Plants: 23,
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Plants: 53,
            Marbles: 62,
          },
        ],
      },
      repeatedColumns: ['Marbles', 'Plants'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'bar',
          tooltip: true,
          width: {
            band: 0.8,
          },
          cornerRadiusEnd: 4,
        },
        encoding: {
          x: {
            field: 'Name',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: '',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
              labelAlign: 'right',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Name: 'Marta',
            Plants: 43,
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Plants: 23,
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Plants: 53,
            Marbles: 62,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['Marbles', 'Plants'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'bar',
          tooltip: true,
          width: {
            band: 0.8,
          },
          cornerRadiusEnd: 4,
        },
        encoding: {
          x: {
            field: 'Name',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: '',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
              labelAlign: 'right',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
  [
    'area chart with two line',
    {
      data: {
        table: [
          {
            Name: 'Marta',
            Plants: 43,
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Plants: 23,
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Plants: 53,
            Marbles: 62,
          },
        ],
      },
      repeatedColumns: ['Marbles', 'Plants'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'area',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'Name',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: '',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Name: 'Marta',
            Plants: 43,
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Plants: 23,
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Plants: 53,
            Marbles: 62,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['Marbles', 'Plants'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'area',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'Name',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: '',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
  [
    'scatter two points',
    {
      data: {
        table: [
          {
            Name: 'Marta',
            Plants: 43,
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Plants: 23,
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Plants: 53,
            Marbles: 62,
          },
        ],
      },
      repeatedColumns: ['Marbles', 'Plants'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'point',
          tooltip: true,
        },
        encoding: {
          x: {
            field: 'Name',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: '',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Name: 'Marta',
            Plants: 43,
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Plants: 23,
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Plants: 53,
            Marbles: 62,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['Marbles', 'Plants'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'point',
          tooltip: true,
        },
        encoding: {
          x: {
            field: 'Name',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: '',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
  [
    'scatter one point',
    {
      data: {
        table: [
          {
            Name: 'Marta',
            Plants: 43,
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Plants: 23,
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Plants: 53,
            Marbles: 62,
          },
        ],
      },
      repeatedColumns: ['Plants'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'point',
          tooltip: true,
        },
        encoding: {
          x: {
            field: 'Name',
            type: 'nominal',
            title: '',
            legend: null,
            sort: null,
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            field: 'Plants',
            type: 'quantitative',
            title: '',
            legend: null,
            scale: {
              domain: [0, 56],
            },
          },
          color: {
            field: 'Name',
            type: 'nominal',
            title: '',
            legend: null,
            sort: null,
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Name: 'Marta',
            Plants: 43,
            Marbles: 14,
          },
          {
            Name: 'Nuno',
            Plants: 23,
            Marbles: 53,
          },
          {
            Name: 'Tony',
            Plants: 53,
            Marbles: 62,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      mark: {
        interpolate: 'natural',
        type: 'point',
        tooltip: true,
      },
      encoding: {
        x: {
          field: 'Name',
          type: 'nominal',
          title: '',
          legend: null,
          sort: null,
          axis: {
            labelAngle: 0,
            labelOverlap: true,
            domainColor: '#ecf0f6',
            tickColor: '#ecf0f6',
            labelColor: '#aab1bd',
            labelFontWeight: 700,
            grid: false,
          },
        },
        y: {
          field: 'Plants',
          type: 'quantitative',
          title: '',
          legend: null,
          scale: {
            domain: [0, 56],
          },
        },
        color: {
          field: 'Name',
          type: 'nominal',
          title: '',
          legend: {
            orient: 'bottom',
            direction: 'horizontal',
          },
          sort: null,
          scale: {
            scheme: 'multicolor_yellow_light',
          },
        },
      },
      config: {
        encoding: {
          color: {
            scheme: 'multicolor_yellow_light',
          },
        },
        mark: {
          fill: '#5b85f7',
          strokeWidth: 3,
        },
        autosize: 'fit',
        axis: {
          titleColor: '#323b49',
        },
      },
    },
  ],
  [
    'line chart with two datasets just numbers no nominal',
    {
      data: {
        table: [
          {
            TCOPs: 31,
            TElecAdd: 967.741935483871,
            TSavings: -653.8984594010639,
          },
          {
            TCOPs: 32,
            TElecAdd: 937.5,
            TSavings: -623.6565239171929,
          },
          {
            TCOPs: 33,
            TElecAdd: 909.090909090909,
            TSavings: -595.247433008102,
          },
          {
            TCOPs: 34,
            TElecAdd: 882.3529411764705,
            TSavings: -568.5094650936635,
          },
          {
            TCOPs: 35,
            TElecAdd: 857.1428571428571,
            TSavings: -543.29938106005,
          },
          {
            TCOPs: 36,
            TElecAdd: 833.3333333333334,
            TSavings: -519.4898572505263,
          },
          {
            TCOPs: 37,
            TElecAdd: 810.8108108108107,
            TSavings: -496.9673347280037,
          },
          {
            TCOPs: 38,
            TElecAdd: 789.4736842105264,
            TSavings: -475.6302081277192,
          },
          {
            TCOPs: 39,
            TElecAdd: 769.2307692307693,
            TSavings: -455.38729314796205,
          },
          {
            TCOPs: 40,
            TElecAdd: 750,
            TSavings: -436.1565239171929,
          },
          {
            TCOPs: 41,
            TElecAdd: 731.7073170731707,
            TSavings: -417.86384099036366,
          },
          {
            TCOPs: 42,
            TElecAdd: 714.2857142857143,
            TSavings: -400.4422382029072,
          },
          {
            TCOPs: 43,
            TElecAdd: 697.6744186046511,
            TSavings: -383.830942521844,
          },
          {
            TCOPs: 44,
            TElecAdd: 681.8181818181818,
            TSavings: -367.9747057353747,
          },
          {
            TCOPs: 45,
            TElecAdd: 666.6666666666666,
            TSavings: -352.82319058385957,
          },
          {
            TCOPs: 46,
            TElecAdd: 652.1739130434783,
            TSavings: -338.33043696067114,
          },
          {
            TCOPs: 47,
            TElecAdd: 638.2978723404254,
            TSavings: -324.45439625761844,
          },
          {
            TCOPs: 48,
            TElecAdd: 625,
            TSavings: -311.1565239171929,
          },
          {
            TCOPs: 49,
            TElecAdd: 612.2448979591836,
            TSavings: -298.40142187637656,
          },
          {
            TCOPs: 50,
            TElecAdd: 600,
            TSavings: -286.1565239171929,
          },
        ],
      },
      repeatedColumns: ['TSavings', 'TElecAdd'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'line',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'TCOPs',
            type: 'quantitative',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
            scale: {
              domain: [0, 52],
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            field: 'repeat',
            type: 'quantitative',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            TCOPs: 31,
            TElecAdd: 967.741935483871,
            TSavings: -653.8984594010639,
          },
          {
            TCOPs: 32,
            TElecAdd: 937.5,
            TSavings: -623.6565239171929,
          },
          {
            TCOPs: 33,
            TElecAdd: 909.090909090909,
            TSavings: -595.247433008102,
          },
          {
            TCOPs: 34,
            TElecAdd: 882.3529411764705,
            TSavings: -568.5094650936635,
          },
          {
            TCOPs: 35,
            TElecAdd: 857.1428571428571,
            TSavings: -543.29938106005,
          },
          {
            TCOPs: 36,
            TElecAdd: 833.3333333333334,
            TSavings: -519.4898572505263,
          },
          {
            TCOPs: 37,
            TElecAdd: 810.8108108108107,
            TSavings: -496.9673347280037,
          },
          {
            TCOPs: 38,
            TElecAdd: 789.4736842105264,
            TSavings: -475.6302081277192,
          },
          {
            TCOPs: 39,
            TElecAdd: 769.2307692307693,
            TSavings: -455.38729314796205,
          },
          {
            TCOPs: 40,
            TElecAdd: 750,
            TSavings: -436.1565239171929,
          },
          {
            TCOPs: 41,
            TElecAdd: 731.7073170731707,
            TSavings: -417.86384099036366,
          },
          {
            TCOPs: 42,
            TElecAdd: 714.2857142857143,
            TSavings: -400.4422382029072,
          },
          {
            TCOPs: 43,
            TElecAdd: 697.6744186046511,
            TSavings: -383.830942521844,
          },
          {
            TCOPs: 44,
            TElecAdd: 681.8181818181818,
            TSavings: -367.9747057353747,
          },
          {
            TCOPs: 45,
            TElecAdd: 666.6666666666666,
            TSavings: -352.82319058385957,
          },
          {
            TCOPs: 46,
            TElecAdd: 652.1739130434783,
            TSavings: -338.33043696067114,
          },
          {
            TCOPs: 47,
            TElecAdd: 638.2978723404254,
            TSavings: -324.45439625761844,
          },
          {
            TCOPs: 48,
            TElecAdd: 625,
            TSavings: -311.1565239171929,
          },
          {
            TCOPs: 49,
            TElecAdd: 612.2448979591836,
            TSavings: -298.40142187637656,
          },
          {
            TCOPs: 50,
            TElecAdd: 600,
            TSavings: -286.1565239171929,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['TSavings', 'TElecAdd'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'line',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'TCOPs',
            type: 'quantitative',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
            scale: {
              domain: [0, 52],
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          xOffset: {
            field: 'repeat',
            type: 'quantitative',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
  [
    'line chart with two dimensions and label as string',
    {
      data: {
        table: [
          {
            Column1: 'John',
            Column2: 3,
            Column3: 6,
          },
          {
            Column1: 'Alice',
            Column2: 4,
            Column3: 4,
          },
          {
            Column1: 'Mark',
            Column2: 5,
            Column3: 3,
          },
        ],
      },
      repeatedColumns: ['Column3', 'Column2'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'line',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'Column1',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            field: 'repeat',
            type: 'nominal',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Column1: 'John',
            Column2: 3,
            Column3: 6,
          },
          {
            Column1: 'Alice',
            Column2: 4,
            Column3: 4,
          },
          {
            Column1: 'Mark',
            Column2: 5,
            Column3: 3,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['Column3', 'Column2'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'line',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'Column1',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          xOffset: {
            field: 'repeat',
            type: 'nominal',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
  [
    'bar chart according to design specs with two dimensions',
    {
      data: {
        table: [
          {
            Column1: 'John',
            Column2: 3,
            Column3: 6,
          },
          {
            Column1: 'Alice',
            Column2: 4,
            Column3: 4,
          },
          {
            Column1: 'Mark',
            Column2: 5,
            Column3: 3,
          },
        ],
      },
      repeatedColumns: ['Column3', 'Column2'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'bar',
          tooltip: true,
          width: {
            band: 0.8,
          },
          cornerRadiusEnd: 4,
        },
        encoding: {
          x: {
            field: 'Column1',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
              labelAlign: 'right',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Column1: 'John',
            Column2: 3,
            Column3: 6,
          },
          {
            Column1: 'Alice',
            Column2: 4,
            Column3: 4,
          },
          {
            Column1: 'Mark',
            Column2: 5,
            Column3: 3,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['Column3', 'Column2'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'bar',
          tooltip: true,
          width: {
            band: 0.8,
          },
          cornerRadiusEnd: 4,
        },
        encoding: {
          x: {
            field: 'Column1',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
              labelAlign: 'right',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
  [
    'bar chart with two dimensions where all data is numbers',
    {
      data: {
        table: [
          {
            TCOPs: 31,
            TElecAdd: 967.741935483871,
            TSavings: -653.8984594010639,
          },
          {
            TCOPs: 32,
            TElecAdd: 937.5,
            TSavings: -623.6565239171929,
          },
          {
            TCOPs: 33,
            TElecAdd: 909.090909090909,
            TSavings: -595.247433008102,
          },
          {
            TCOPs: 34,
            TElecAdd: 882.3529411764705,
            TSavings: -568.5094650936635,
          },
          {
            TCOPs: 35,
            TElecAdd: 857.1428571428571,
            TSavings: -543.29938106005,
          },
          {
            TCOPs: 36,
            TElecAdd: 833.3333333333334,
            TSavings: -519.4898572505263,
          },
          {
            TCOPs: 37,
            TElecAdd: 810.8108108108107,
            TSavings: -496.9673347280037,
          },
          {
            TCOPs: 38,
            TElecAdd: 789.4736842105264,
            TSavings: -475.6302081277192,
          },
          {
            TCOPs: 39,
            TElecAdd: 769.2307692307693,
            TSavings: -455.38729314796205,
          },
          {
            TCOPs: 40,
            TElecAdd: 750,
            TSavings: -436.1565239171929,
          },
          {
            TCOPs: 41,
            TElecAdd: 731.7073170731707,
            TSavings: -417.86384099036366,
          },
          {
            TCOPs: 42,
            TElecAdd: 714.2857142857143,
            TSavings: -400.4422382029072,
          },
          {
            TCOPs: 43,
            TElecAdd: 697.6744186046511,
            TSavings: -383.830942521844,
          },
          {
            TCOPs: 44,
            TElecAdd: 681.8181818181818,
            TSavings: -367.9747057353747,
          },
          {
            TCOPs: 45,
            TElecAdd: 666.6666666666666,
            TSavings: -352.82319058385957,
          },
          {
            TCOPs: 46,
            TElecAdd: 652.1739130434783,
            TSavings: -338.33043696067114,
          },
          {
            TCOPs: 47,
            TElecAdd: 638.2978723404254,
            TSavings: -324.45439625761844,
          },
          {
            TCOPs: 48,
            TElecAdd: 625,
            TSavings: -311.1565239171929,
          },
          {
            TCOPs: 49,
            TElecAdd: 612.2448979591836,
            TSavings: -298.40142187637656,
          },
          {
            TCOPs: 50,
            TElecAdd: 600,
            TSavings: -286.1565239171929,
          },
        ],
      },
      repeatedColumns: ['TSavings', 'TElecAdd'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'bar',
          tooltip: true,
          width: {
            band: 0.8,
          },
          cornerRadiusEnd: 4,
        },
        encoding: {
          x: {
            field: 'TCOPs',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
              labelAlign: 'right',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            TCOPs: 31,
            TElecAdd: 967.741935483871,
            TSavings: -653.8984594010639,
          },
          {
            TCOPs: 32,
            TElecAdd: 937.5,
            TSavings: -623.6565239171929,
          },
          {
            TCOPs: 33,
            TElecAdd: 909.090909090909,
            TSavings: -595.247433008102,
          },
          {
            TCOPs: 34,
            TElecAdd: 882.3529411764705,
            TSavings: -568.5094650936635,
          },
          {
            TCOPs: 35,
            TElecAdd: 857.1428571428571,
            TSavings: -543.29938106005,
          },
          {
            TCOPs: 36,
            TElecAdd: 833.3333333333334,
            TSavings: -519.4898572505263,
          },
          {
            TCOPs: 37,
            TElecAdd: 810.8108108108107,
            TSavings: -496.9673347280037,
          },
          {
            TCOPs: 38,
            TElecAdd: 789.4736842105264,
            TSavings: -475.6302081277192,
          },
          {
            TCOPs: 39,
            TElecAdd: 769.2307692307693,
            TSavings: -455.38729314796205,
          },
          {
            TCOPs: 40,
            TElecAdd: 750,
            TSavings: -436.1565239171929,
          },
          {
            TCOPs: 41,
            TElecAdd: 731.7073170731707,
            TSavings: -417.86384099036366,
          },
          {
            TCOPs: 42,
            TElecAdd: 714.2857142857143,
            TSavings: -400.4422382029072,
          },
          {
            TCOPs: 43,
            TElecAdd: 697.6744186046511,
            TSavings: -383.830942521844,
          },
          {
            TCOPs: 44,
            TElecAdd: 681.8181818181818,
            TSavings: -367.9747057353747,
          },
          {
            TCOPs: 45,
            TElecAdd: 666.6666666666666,
            TSavings: -352.82319058385957,
          },
          {
            TCOPs: 46,
            TElecAdd: 652.1739130434783,
            TSavings: -338.33043696067114,
          },
          {
            TCOPs: 47,
            TElecAdd: 638.2978723404254,
            TSavings: -324.45439625761844,
          },
          {
            TCOPs: 48,
            TElecAdd: 625,
            TSavings: -311.1565239171929,
          },
          {
            TCOPs: 49,
            TElecAdd: 612.2448979591836,
            TSavings: -298.40142187637656,
          },
          {
            TCOPs: 50,
            TElecAdd: 600,
            TSavings: -286.1565239171929,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['TSavings', 'TElecAdd'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'bar',
          tooltip: true,
          width: {
            band: 0.8,
          },
          cornerRadiusEnd: 4,
        },
        encoding: {
          x: {
            field: 'TCOPs',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
              labelAlign: 'right',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
  [
    'stand with ukraine',
    {
      data: {
        table: [
          {
            TCOPs: 31,
            TElecAdd: 967.741935483871,
            TElecUse: 3870.967741935484,
            TSavings: -653.8984594010639,
          },
          {
            TCOPs: 32,
            TElecAdd: 937.5,
            TElecUse: 3750,
            TSavings: -623.6565239171929,
          },
          {
            TCOPs: 33,
            TElecAdd: 909.090909090909,
            TElecUse: 3636.363636363636,
            TSavings: -595.247433008102,
          },
          {
            TCOPs: 34,
            TElecAdd: 882.3529411764705,
            TElecUse: 3529.411764705882,
            TSavings: -568.5094650936635,
          },
          {
            TCOPs: 35,
            TElecAdd: 857.1428571428571,
            TElecUse: 3428.5714285714284,
            TSavings: -543.29938106005,
          },
          {
            TCOPs: 36,
            TElecAdd: 833.3333333333334,
            TElecUse: 3333.3333333333335,
            TSavings: -519.4898572505263,
          },
          {
            TCOPs: 37,
            TElecAdd: 810.8108108108107,
            TElecUse: 3243.243243243243,
            TSavings: -496.9673347280037,
          },
          {
            TCOPs: 38,
            TElecAdd: 789.4736842105264,
            TElecUse: 3157.8947368421054,
            TSavings: -475.6302081277192,
          },
          {
            TCOPs: 39,
            TElecAdd: 769.2307692307693,
            TElecUse: 3076.923076923077,
            TSavings: -455.38729314796205,
          },
          {
            TCOPs: 40,
            TElecAdd: 750,
            TElecUse: 3000,
            TSavings: -436.1565239171929,
          },
          {
            TCOPs: 41,
            TElecAdd: 731.7073170731707,
            TElecUse: 2926.8292682926826,
            TSavings: -417.86384099036366,
          },
          {
            TCOPs: 42,
            TElecAdd: 714.2857142857143,
            TElecUse: 2857.1428571428573,
            TSavings: -400.4422382029072,
          },
          {
            TCOPs: 43,
            TElecAdd: 697.6744186046511,
            TElecUse: 2790.6976744186045,
            TSavings: -383.830942521844,
          },
          {
            TCOPs: 44,
            TElecAdd: 681.8181818181818,
            TElecUse: 2727.272727272727,
            TSavings: -367.9747057353747,
          },
          {
            TCOPs: 45,
            TElecAdd: 666.6666666666666,
            TElecUse: 2666.6666666666665,
            TSavings: -352.82319058385957,
          },
          {
            TCOPs: 46,
            TElecAdd: 652.1739130434783,
            TElecUse: 2608.695652173913,
            TSavings: -338.33043696067114,
          },
          {
            TCOPs: 47,
            TElecAdd: 638.2978723404254,
            TElecUse: 2553.1914893617018,
            TSavings: -324.45439625761844,
          },
          {
            TCOPs: 48,
            TElecAdd: 625,
            TElecUse: 2500,
            TSavings: -311.1565239171929,
          },
          {
            TCOPs: 49,
            TElecAdd: 612.2448979591836,
            TElecUse: 2448.9795918367345,
            TSavings: -298.40142187637656,
          },
          {
            TCOPs: 50,
            TElecAdd: 600,
            TElecUse: 2400,
            TSavings: -286.1565239171929,
          },
        ],
      },
      repeatedColumns: ['TSavings', 'TElecAdd'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'area',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'TCOPs',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            field: 'repeat',
            type: 'nominal',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            TCOPs: 31,
            TElecAdd: 967.741935483871,
            TElecUse: 3870.967741935484,
            TSavings: -653.8984594010639,
          },
          {
            TCOPs: 32,
            TElecAdd: 937.5,
            TElecUse: 3750,
            TSavings: -623.6565239171929,
          },
          {
            TCOPs: 33,
            TElecAdd: 909.090909090909,
            TElecUse: 3636.363636363636,
            TSavings: -595.247433008102,
          },
          {
            TCOPs: 34,
            TElecAdd: 882.3529411764705,
            TElecUse: 3529.411764705882,
            TSavings: -568.5094650936635,
          },
          {
            TCOPs: 35,
            TElecAdd: 857.1428571428571,
            TElecUse: 3428.5714285714284,
            TSavings: -543.29938106005,
          },
          {
            TCOPs: 36,
            TElecAdd: 833.3333333333334,
            TElecUse: 3333.3333333333335,
            TSavings: -519.4898572505263,
          },
          {
            TCOPs: 37,
            TElecAdd: 810.8108108108107,
            TElecUse: 3243.243243243243,
            TSavings: -496.9673347280037,
          },
          {
            TCOPs: 38,
            TElecAdd: 789.4736842105264,
            TElecUse: 3157.8947368421054,
            TSavings: -475.6302081277192,
          },
          {
            TCOPs: 39,
            TElecAdd: 769.2307692307693,
            TElecUse: 3076.923076923077,
            TSavings: -455.38729314796205,
          },
          {
            TCOPs: 40,
            TElecAdd: 750,
            TElecUse: 3000,
            TSavings: -436.1565239171929,
          },
          {
            TCOPs: 41,
            TElecAdd: 731.7073170731707,
            TElecUse: 2926.8292682926826,
            TSavings: -417.86384099036366,
          },
          {
            TCOPs: 42,
            TElecAdd: 714.2857142857143,
            TElecUse: 2857.1428571428573,
            TSavings: -400.4422382029072,
          },
          {
            TCOPs: 43,
            TElecAdd: 697.6744186046511,
            TElecUse: 2790.6976744186045,
            TSavings: -383.830942521844,
          },
          {
            TCOPs: 44,
            TElecAdd: 681.8181818181818,
            TElecUse: 2727.272727272727,
            TSavings: -367.9747057353747,
          },
          {
            TCOPs: 45,
            TElecAdd: 666.6666666666666,
            TElecUse: 2666.6666666666665,
            TSavings: -352.82319058385957,
          },
          {
            TCOPs: 46,
            TElecAdd: 652.1739130434783,
            TElecUse: 2608.695652173913,
            TSavings: -338.33043696067114,
          },
          {
            TCOPs: 47,
            TElecAdd: 638.2978723404254,
            TElecUse: 2553.1914893617018,
            TSavings: -324.45439625761844,
          },
          {
            TCOPs: 48,
            TElecAdd: 625,
            TElecUse: 2500,
            TSavings: -311.1565239171929,
          },
          {
            TCOPs: 49,
            TElecAdd: 612.2448979591836,
            TElecUse: 2448.9795918367345,
            TSavings: -298.40142187637656,
          },
          {
            TCOPs: 50,
            TElecAdd: 600,
            TElecUse: 2400,
            TSavings: -286.1565239171929,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['TSavings', 'TElecAdd'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'area',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'TCOPs',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          xOffset: {
            field: 'repeat',
            type: 'nominal',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
  [
    'line chart with two lines over dates',
    {
      data: {
        table: [
          {
            Year: '2022',
            NetRevenue: 25000,
            OperatingIncome: 10000,
          },
          {
            Year: '2023',
            NetRevenue: 35000,
            OperatingIncome: 12600,
          },
          {
            Year: '2024',
            NetRevenue: 49000,
            OperatingIncome: 17640,
          },
          {
            Year: '2025',
            NetRevenue: 68600,
            OperatingIncome: 24696,
          },
          {
            Year: '2026',
            NetRevenue: 96025,
            OperatingIncome: 34569,
          },
          {
            Year: '2027',
            NetRevenue: 134450,
            OperatingIncome: 48402,
          },
        ],
      },
      repeatedColumns: ['OperatingIncome', 'NetRevenue'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'line',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'Year',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            field: 'repeat',
            type: 'nominal',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Year: '2022',
            NetRevenue: 25000,
            OperatingIncome: 10000,
          },
          {
            Year: '2023',
            NetRevenue: 35000,
            OperatingIncome: 12600,
          },
          {
            Year: '2024',
            NetRevenue: 49000,
            OperatingIncome: 17640,
          },
          {
            Year: '2025',
            NetRevenue: 68600,
            OperatingIncome: 24696,
          },
          {
            Year: '2026',
            NetRevenue: 96025,
            OperatingIncome: 34569,
          },
          {
            Year: '2027',
            NetRevenue: 134450,
            OperatingIncome: 48402,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['OperatingIncome', 'NetRevenue'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'line',
          tooltip: true,
          point: {
            filled: true,
            size: 20,
            strokeWidth: 3,
          },
        },
        encoding: {
          x: {
            field: 'Year',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
            },
          },
          xOffset: {
            field: 'repeat',
            type: 'nominal',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
  [
    'bar chart with two lines over dates',
    {
      data: {
        table: [
          {
            Year: '2022',
            NetRevenue: 25000,
            OperatingIncome: 10000,
          },
          {
            Year: '2023',
            NetRevenue: 35000,
            OperatingIncome: 12600,
          },
          {
            Year: '2024',
            NetRevenue: 49000,
            OperatingIncome: 17640,
          },
          {
            Year: '2025',
            NetRevenue: 68600,
            OperatingIncome: 24696,
          },
          {
            Year: '2026',
            NetRevenue: 96025,
            OperatingIncome: 34569,
          },
          {
            Year: '2027',
            NetRevenue: 134450,
            OperatingIncome: 48402,
          },
        ],
      },
      repeatedColumns: ['OperatingIncome', 'NetRevenue'],
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'bar',
          tooltip: true,
          width: {
            band: 0.8,
          },
          cornerRadiusEnd: 4,
        },
        encoding: {
          x: {
            field: 'Year',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
              labelAlign: 'right',
            },
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        values: [
          {
            Year: '2022',
            NetRevenue: 25000,
            OperatingIncome: 10000,
          },
          {
            Year: '2023',
            NetRevenue: 35000,
            OperatingIncome: 12600,
          },
          {
            Year: '2024',
            NetRevenue: 49000,
            OperatingIncome: 17640,
          },
          {
            Year: '2025',
            NetRevenue: 68600,
            OperatingIncome: 24696,
          },
          {
            Year: '2026',
            NetRevenue: 96025,
            OperatingIncome: 34569,
          },
          {
            Year: '2027',
            NetRevenue: 134450,
            OperatingIncome: 48402,
          },
        ],
      },
      width: 'container',
      height: 'container',
      view: {
        stroke: 'transparent',
      },
      repeat: {
        layer: ['OperatingIncome', 'NetRevenue'],
      },
      spec: {
        mark: {
          interpolate: 'natural',
          type: 'bar',
          tooltip: true,
          width: {
            band: 0.8,
          },
          cornerRadiusEnd: 4,
        },
        encoding: {
          x: {
            field: 'Year',
            type: 'nominal',
            title: '',
            axis: {
              labelAngle: 0,
              labelOverlap: true,
              domainColor: '#ecf0f6',
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              grid: false,
            },
          },
          y: {
            aggregate: 'sum',
            field: {
              repeat: 'layer',
            },
            type: 'quantitative',
            title: 'Values',
            axis: {
              labelAngle: 0,
              tickColor: '#ecf0f6',
              labelColor: '#aab1bd',
              labelFontWeight: 700,
              gridColor: '#f5f7fa',
              labelAlign: 'right',
            },
          },
          xOffset: {
            datum: {
              repeat: 'layer',
            },
            type: 'nominal',
          },
          color: {
            datum: {
              repeat: 'layer',
            },
            scale: {
              scheme: 'multicolor_yellow_light',
            },
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
            },
          },
        },
        config: {
          encoding: {
            color: {
              scheme: 'multicolor_yellow_light',
            },
          },
          mark: {
            fill: '#5b85f7',
            strokeWidth: 3,
          },
          autosize: 'fit',
          axis: {
            titleColor: '#323b49',
          },
        },
      },
    },
  ],
];

describe('serializeVisualisationSpec', () => {
  testCases.forEach(([testName, testSpec, expectedSpec], i) => {
    // @ts-ignore
    const { data, repeatedColumns, spec } = testSpec;
    it(`VisualizationSpec#${i + 1} (${testName})`, () => {
      const result = serializeVisualisationSpec({
        data,
        repeatedColumns,
        spec,
      });
      expect(result).toEqual(expectedSpec);
    });
  });
});
