export const regionWidth = (r: Region): number => Math.abs(r.x.max - r.x.min);
export const regionHeight = (r: Region): number => Math.abs(r.y.max - r.y.min);
export const regionCenter = (r: Region): Point => {
  return {
    x: r.x.min + regionWidth(r) / 2,
    y: r.y.min + regionHeight(r) / 2,
  };
};
export const regionArea = (r: Region): number =>
  regionWidth(r) * regionHeight(r);
