import { render, screen } from '@testing-library/react';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from './Tabs';

it('renders table data', () => {
  render(
    <TabsRoot defaultValue="table">
      <TabsList>
        <TabsTrigger
          name="table"
          trigger={{
            label: 'Table',
            onClick: () => {},
            disabled: false,
            selected: true,
          }}
        />
        <TabsTrigger
          name="chart"
          trigger={{
            label: 'Chart',
            onClick: () => {},
            disabled: false,
            selected: false,
          }}
        />
      </TabsList>
      <TabsContent name="table">
        <div>Table Data</div>
      </TabsContent>
      <TabsContent name="chart">
        <div>Chart Data</div>
      </TabsContent>
    </TabsRoot>
  );

  expect(screen.getByText('Table Data')).toBeVisible();
});

it('renders chart data', () => {
  render(
    <TabsRoot defaultValue="chart">
      <TabsList>
        <TabsTrigger
          testId="table-tab"
          name="table"
          trigger={{
            label: 'Table',
            onClick: () => {},
            disabled: false,
            selected: true,
          }}
        />
        <TabsTrigger
          testId="chart-tab"
          name="chart"
          trigger={{
            label: 'Chart',
            onClick: () => {},
            disabled: false,
            selected: false,
          }}
        />
      </TabsList>
      <TabsContent name="table">
        <div>Table Data</div>
      </TabsContent>
      <TabsContent name="chart">
        <div>Chart Data</div>
      </TabsContent>
    </TabsRoot>
  );

  expect(screen.getByText('Chart Data')).toBeVisible();
});
