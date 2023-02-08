import sharp, { Sharp } from 'sharp';
import { Dimensions } from './types';

const MAX_WIDTH = 580;

const resizeToDimensions = async (image: Sharp): Promise<Dimensions> => {
  const metadata = await image.metadata();
  const imageWidth = metadata.width ?? Infinity;
  const width = Math.min(imageWidth, MAX_WIDTH);
  const originalImageHeight = metadata.height ?? Infinity;
  const ratio = imageWidth / originalImageHeight;
  const height = Math.round(width / ratio);
  return { width, height };
};

export const resize = async (imageSource: Buffer): Promise<Buffer> => {
  const image = sharp(imageSource);
  const { width, height } = await resizeToDimensions(image);
  return image.resize(width, height).png().toBuffer();
};
