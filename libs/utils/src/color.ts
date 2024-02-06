interface Color {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
}

export interface OpaqueColor extends Color {
  readonly rgb: string;
  readonly hex: string;
}

export interface TransparentColor extends Color {
  readonly rgba: string;
}
