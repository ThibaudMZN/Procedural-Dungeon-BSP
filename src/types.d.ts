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
  room?: Room;
};

type Room = {
  position: Point; // Top-Left
  width: number;
  height: number;
};

type Corridor = {
  position: Point; // Top-Left
  width: number;
  height: number;
};
