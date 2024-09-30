export type MultipleNodeProxy<N, P extends object, A extends object> = {
  nodes: N[];
  properties: MultipleNodeProxyProperties<P>;
  actions: A;
};

export type MultipleNodeProxyProperty<T> = 'varies' | { value: T };

export type MultipleNodeProxyProperties<P extends object> = {
  [K in keyof P]: MultipleNodeProxyProperty<P[K]>;
};
