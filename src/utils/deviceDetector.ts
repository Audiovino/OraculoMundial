import UAParser from 'ua-parser-js';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function getBrowserDeviceType(): DeviceType {
  const parser = new UAParser(window.navigator.userAgent);
  const device = parser.getDevice();
  const type = device.type;

  if (type === 'mobile') return 'mobile';
  if (type === 'tablet') return 'tablet';
  return 'desktop';
}

export function isMobileDevice(): boolean {
  return getBrowserDeviceType() === 'mobile';
}

export function isTabletDevice(): boolean {
  return getBrowserDeviceType() === 'tablet';
}
