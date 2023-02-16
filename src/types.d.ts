type Point = {
  x: number;
  y: number;
};

type MinMax = {
  min: number;
  max: number;
};
type Region = {
  x: MinMax;
  y: MinMax;
};

type Room = {
  position: Point; // Top-Left
  width: number;
  height: number;
  node: Node<Region>;
};

type Corridor = {
  position: Point; // Top-Left
  width: number;
  height: number;
};
