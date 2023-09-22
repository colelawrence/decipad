import { Meta, StoryFn } from '@storybook/react';
import { Code, Show } from '../../icons';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from './Tabs';

export default {
  title: 'Molecules / UI / Tabs',
  component: TabsRoot,
} as Meta;

export const Normal: StoryFn = () => (
  <TabsRoot defaultValue="code">
    <TabsList>
      <TabsTrigger
        name="code"
        trigger={{
          label: 'Code',
          onClick: () => {},
          disabled: false,
          selected: true,
        }}
      />
      <TabsTrigger
        name="preview"
        trigger={{
          label: 'Preview',
          onClick: () => {},
          disabled: false,
          selected: false,
        }}
      />
    </TabsList>
    <TabsContent name="code">
      <div>Code Data</div>
    </TabsContent>
    <TabsContent name="preview">
      <div>Preview Data</div>
    </TabsContent>
  </TabsRoot>
);

export const WithIcons: StoryFn = () => (
  <TabsRoot defaultValue="code">
    <TabsList>
      <TabsTrigger
        name="code"
        trigger={{
          label: 'Code',
          icon: <Code />,
          onClick: () => {},
          disabled: false,
          selected: true,
        }}
      />
      <TabsTrigger
        name="preview"
        trigger={{
          label: 'Preview',
          icon: <Show />,
          onClick: () => {},
          disabled: false,
          selected: false,
        }}
      />
    </TabsList>
    <TabsContent name="code">
      <div>Code Data</div>
    </TabsContent>
    <TabsContent name="preview">
      <div>Preview Data</div>
    </TabsContent>
  </TabsRoot>
);
