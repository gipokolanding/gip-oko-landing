declare module "d3-geo" {
  export interface GeoProjection {
    scale(scale: number): this;
    translate(translate: [number, number]): this;
    rotate(angles: [number, number] | [number, number, number]): this;
    precision(precision: number): this;
  }

  export interface GeoPath {
    (object: unknown): string | null;
  }

  export function geoOrthographic(): GeoProjection;
  export function geoPath(projection?: GeoProjection): GeoPath;
}

declare module "d3-selection" {
  export interface Selection {
    selectAll(selector: string): Selection;
    remove(): this;
    append(name: string): Selection;
    attr(
      name: string,
      value: string | number | ((datum: unknown) => string | number),
    ): this;
    data(data: unknown[]): Selection;
    join(name: string): Selection;
  }

  export function select(
    node: Element | null | undefined,
  ): Selection;
}

declare module "topojson-client" {
  export function feature(
    topology: unknown,
    object: unknown,
  ): { type: string; features: unknown[] };
}
