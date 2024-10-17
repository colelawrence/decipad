import { Meta, StoryFn } from '@storybook/react';
import { ImageGallery, ImageGalleryProps } from './ImageGallery';

const unsplashImages = [
  'https://images.unsplash.com/photo-1493612276216-ee3925520721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxfHxyYW5kb218ZW58MHx8fHwxNzA5ODkyMDA4fDA&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyfHxyYW5kb218ZW58MHx8fHwxNzA5ODkyMDA4fDA&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwzfHxyYW5kb218ZW58MHx8fHwxNzA5ODkyMDA4fDA&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHw0fHxyYW5kb218ZW58MHx8fHwxNzA5ODkyMDA4fDA&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1509281373149-e957c6296406?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHw1fHxyYW5kb218ZW58MHx8fHwxNzA5ODkyMDA4fDA&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1508138221679-760a23a2285b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHw2fHxyYW5kb218ZW58MHx8fHwxNzA5ODkyMDA4fDA&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1485550409059-9afb054cada4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHw3fHxyYW5kb218ZW58MHx8fHwxNzA5ODkyMDA4fDA&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1494253109108-2e30c049369b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHw4fHxyYW5kb218ZW58MHx8fHwxNzA5ODkyMDA4fDA&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHw5fHxyYW5kb218ZW58MHx8fHwxNzA5ODkyMDA4fDA&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxMHx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxMXx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1519750783826-e2420f4d687f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxMnx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxM3x8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1577401239170-897942555fb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxNHx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1550686041-366ad85a1355?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxNXx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1613336026275-d6d473084e85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxNnx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1504470695779-75300268aa0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxN3x8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxOHx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwxOXx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1494059980473-813e73ee784b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyMHx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1429087969512-1e85aab2683d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyMXx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1631931413024-38ed4229d10d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyMnx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1521178010706-baefe2334211?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyM3x8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1472898965229-f9b06b9c9bbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyNHx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1521133573892-e44906baee46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyNXx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1468487422149-5edc5034604f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyNnx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1524856949007-80db29955b17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyN3x8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyOHx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1473172707857-f9e276582ab6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwyOXx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1605142859862-978be7eba909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzIzMzZ8MHwxfHNlYXJjaHwzMHx8cmFuZG9tfGVufDB8fHx8MTcwOTg5MjAwOHww&ixlib=rb-4.0.3&q=80&w=400',
];

const meta: Meta<typeof ImageGallery> = {
  title: 'Molecule / AI / ImageGallery',
  component: ImageGallery,
};

export default meta;
const Template: StoryFn<ImageGalleryProps> = (args: ImageGalleryProps) => (
  <ImageGallery {...args} />
);

export const Default: StoryFn<ImageGalleryProps> = Template.bind({});
Default.args = {
  imageUrls: unsplashImages,
  loading: false,
  count: unsplashImages.length,
  insertFromPreview: () => 1,
};

export const LoadingState: StoryFn<ImageGalleryProps> = Template.bind({});
LoadingState.args = {
  imageUrls: [],
  loading: true,
  count: 20,
  insertFromPreview: () => 1,
};
