import { render } from '@testing-library/react';
import { CustomTooltip } from '.';
import { CustomTooltipWithGrowthProps } from './types';

const funnelTooltipProps = {
  type: 'Line',
  viewBox: {
    top: 1,
    bottom: 31,
    left: -38.666666666666664,
    right: -38.666666666666664,
    width: 657.3333333333333,
    height: 333,
    x: -38.666666666666664,
    y: 1,
  },
  active: true,
  label: 'We are all in this together',
  payload: [
    {
      fill: '#ffba75',
      stroke: '#ffba75',
      opacity: 0.2,
      strokeWidth: 0,
      fillOpacity: 0.6,
      dataKey: 'Valuation',
      name: 'Valuation',
      color: '#ffba75',
      value: 50000000,
      payload: {
        Scenario: 'We are all in this together',
        Valuation: 50000000,
      },
      hide: false,
    },
    {
      fill: '#ffba75',
      radius: [4, 4, 0, 0],
      dataKey: 'Valuation',
      name: 'Valuation',
      color: '#ffba75',
      value: 50000000,
      payload: {
        Scenario: 'We are all in this together',
        Valuation: 50000000,
      },
      hide: false,
    },
  ],
  growth: {
    Valuation: 233,
  },
} as unknown as CustomTooltipWithGrowthProps;

const scatterTooltipProps = {
  viewBox: {
    top: 1,
    bottom: 31,
    left: 1,
    right: 1,
    width: 578,
    height: 333,
    x: 1,
    y: 1,
  },
  active: true,
  payload: [
    {
      name: 'Revenue_Opportunity',
      unit: '',
      value: 150000,
      payload: {
        Revenue_Opportunity: 150000,
        Revenue_Booked: 50000,
        Company: 'Company Thirteen',
        Deal_Stage: 'closed',
      },
      dataKey: 'Revenue_Opportunity',
    },
    {
      name: 'Revenue_Opportunity',
      unit: '',
      value: 150000,
      payload: {
        Revenue_Opportunity: 150000,
        Revenue_Booked: 50000,
        Company: 'Company Thirteen',
        Deal_Stage: 'closed',
      },
      dataKey: 'Revenue_Opportunity',
    },
    {
      name: 'Revenue_Booked',
      unit: '',
      value: 50000,
      payload: {
        Revenue_Opportunity: 150000,
        Revenue_Booked: 50000,
        Company: 'Company Thirteen',
        Deal_Stage: 'closed',
      },
      dataKey: 'Revenue_Booked',
    },
  ],
  type: 'Scatter',
  labelColumnName: 'Company',
} as CustomTooltipWithGrowthProps;

const pieTooltipProps = {
  type: 'Pie',
  viewBox: {
    top: 5,
    bottom: 53,
    left: 5,
    right: 5,
    width: 570,
    height: 307,
    x: 5,
    y: 5,
  },
  active: true,
  label: 'Valuation',
  payload: [
    {
      name: 'A wild creature appears',
      value: 1000000000,
      payload: {
        payload: {
          Scenario: 'A wild creature appears',
          Valuation: 1000000000,
        },
        cx: '50%',
        cy: '50%',
        fill: '#e5e9f0',
        stroke: '#fff',
        Scenario: 'A wild creature appears',
        Valuation: 1000000000,
      },
      dataKey: 'Valuation',
    },
  ],
  total: 1065000000,
} as CustomTooltipWithGrowthProps;

describe('CustomTooltip', () => {
  describe('PieTooltip', () => {
    it('Works on a pie chart', () => {
      const { getByText, getAllByText } = render(
        <CustomTooltip {...pieTooltipProps} />
      );

      expect(getByText('Valuation')).toBeInTheDocument();
      const percentageElement = getAllByText((_, element) => {
        return element?.textContent?.includes('93.90%') || false;
      }).find((el) => el.textContent?.includes('of total'));

      expect(percentageElement).toBeInTheDocument();
      expect(getByText('A wild creature appears')).toBeInTheDocument();
    });

    it('Doesnt render when inactive', () => {
      const { queryByText } = render(
        <CustomTooltip {...pieTooltipProps} active={false} />
      );

      expect(queryByText('Valuation')).not.toBeInTheDocument();
    });

    it('Handles no payload gracefully', () => {
      const incorrectPayloadProps = {
        ...pieTooltipProps,
        payload: [],
      } as CustomTooltipWithGrowthProps;

      const { queryByText } = render(
        <CustomTooltip {...incorrectPayloadProps} />
      );

      expect(queryByText('Valuation')).not.toBeInTheDocument();
    });

    it('Handles incorrect dataKey gracefully', () => {
      const incorrectDataKeyProps = {
        ...pieTooltipProps,
        payload: [
          {
            ...pieTooltipProps.payload?.[0],
            dataKey: 'IncorrectValuation',
          },
        ],
      } as CustomTooltipWithGrowthProps;

      const { queryByText } = render(
        <CustomTooltip {...incorrectDataKeyProps} />
      );

      expect(queryByText('Valuation')).toBeInTheDocument();
    });
  });

  describe('DefaultTooltip', () => {
    it('Works on a chart', () => {
      const { queryByText, getAllByText } = render(
        <CustomTooltip {...funnelTooltipProps} />
      );

      expect(queryByText('Valuation')).toBeInTheDocument();
      const percentageElement = getAllByText((_, element) => {
        return element?.textContent?.includes('233') || false;
      }).find((el) => el.textContent?.includes('vs. previous'));

      expect(percentageElement).toBeInTheDocument();
      expect(queryByText('We are all in this together')).toBeInTheDocument();
    });
  });

  describe('ScatterTooltip', () => {
    it('Works on a scatter chart', () => {
      const { queryByText, getByText, getAllByText, container } = render(
        <CustomTooltip {...scatterTooltipProps} />
      );

      const revenueOpportunityButton = getByText('Revenue_Opportunity');
      expect(revenueOpportunityButton).toBeInTheDocument();

      expect(queryByText('Company Thirteen')).toBeInTheDocument();

      const separator = container.querySelector('div[role="separator"]');
      expect(separator).toBeInTheDocument();

      const revenueOpportunityValue = getAllByText((_, element) => {
        return element?.textContent?.includes('150K') || false;
      }).find((_, i) => i === 0);

      expect(revenueOpportunityValue).toBeInTheDocument();

      const revenueBookedButton = getByText('Revenue_Booked');
      expect(revenueBookedButton).toBeInTheDocument();

      const revenueBookedValue = getAllByText((_, element) => {
        return element?.textContent?.includes('50K') || false;
      }).find((_, i) => i === 0);

      expect(revenueBookedValue).toBeInTheDocument();
    });
  });
});
