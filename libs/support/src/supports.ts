export type SupportFeature = 'document' | 'websockets' | 'indexeddb';

export const supports = (feature: SupportFeature): boolean => {
  switch (feature) {
    case 'document':
      return typeof document !== 'undefined';
    case 'websockets':
      return typeof WebSocket !== 'undefined';
    case 'indexeddb':
      return typeof indexedDB !== 'undefined';
  }
};
