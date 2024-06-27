import Jimp from 'jimp';
import type { Dimensions } from './types';

const MAX_WIDTH = 580;

const resizeToDimensions = (image: Jimp): Dimensions => {
  const imageWidth = image.bitmap.width;
  const width = Math.min(imageWidth, MAX_WIDTH);
  const originalImageHeight = image.bitmap.height;
  const ratio = imageWidth / originalImageHeight;
  const height = Math.round(width / ratio);
  return { width, height };
};

export const resize = async (imageSource: Buffer): Promise<Buffer> => {
  const image = await Jimp.read(imageSource);
  const { width, height } = resizeToDimensions(image);
  image.resize(width, height);

  return image.getBufferAsync(Jimp.MIME_PNG);
};
