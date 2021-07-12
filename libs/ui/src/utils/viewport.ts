import { Device } from '../primitives';

type ViewportUnit = 'vmin' | 'vmax' | 'vw' | 'vh';

/**
 * If vmin, our scale goes from the small side of the small device to the small side of the large device.
 * If vmax, our scale goes from the large side of the small device to the large side of the large device.
 * If vw or vw, our scale goes from the small side of the small device to the large side of the large device,
 * to ensure that in any orientation we stay within the bounds.
 */
const relevantDeviceDimension = (
  device: Device,
  viewportUnit: ViewportUnit,
  isLargerDevice: boolean
): number => {
  return viewportUnit === 'vmax' || (viewportUnit !== 'vmin' && isLargerDevice)
    ? device.landscape.width
    : device.landscape.height;
};

export const viewportCalc = (
  smallDevice: Device,
  smallValue: number,
  largeDevice: Device,
  largeValue: number,
  baseUnit: string,
  viewportUnit: ViewportUnit = 'vmin'
): string => {
  const valueDiff = largeValue - smallValue;
  const screenDiff =
    relevantDeviceDimension(largeDevice, viewportUnit, true) -
    relevantDeviceDimension(smallDevice, viewportUnit, false);

  const valuePerViewportUnit = (valueDiff * 100) / screenDiff;
  const minValue =
    smallValue -
    (valueDiff * relevantDeviceDimension(smallDevice, viewportUnit, false)) /
      screenDiff;

  return `calc(${minValue}${baseUnit} + ${valuePerViewportUnit}${viewportUnit})`;
};

export const viewportClampCalc: typeof viewportCalc = (
  smallDevice,
  smallValue,
  largeDevice,
  largeValue,
  baseUnit,
  viewportUnit
) =>
  `clamp(${Math.min(smallValue, largeValue)}${baseUnit}, ${viewportCalc(
    smallDevice,
    smallValue,
    largeDevice,
    largeValue,
    baseUnit,
    viewportUnit
  )}, ${Math.max(smallValue, largeValue)}${baseUnit})`;
