export type SupportFeature = 'websockets' | 'indexeddb';

export const supports = (feature: SupportFeature): boolean => {
  switch (feature) {
    case 'websockets':
      return typeof WebSocket !== 'undefined';
    case 'indexeddb':
      return typeof indexedDB !== 'undefined';
  }
};
