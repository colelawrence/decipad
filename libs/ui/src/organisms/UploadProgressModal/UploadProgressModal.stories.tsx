import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { UploadProgressModal } from './UploadProgressModal';

export default {
  title: 'Organisms / Editor / Drag and Drop / Upload Progress',
  component: UploadProgressModal,
} as Meta;

export const Normal: Story<ComponentProps<typeof UploadProgressModal>> = () => {
  return (
    <UploadProgressModal
      files={[
        { name: 'Myfile.csv', progress: 100 },
        { name: 'An image.png', progress: 25 },
      ]}
    />
  );
};
