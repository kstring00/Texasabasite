export type Room = {
  id: string;
  n: number;
  name: string;
  short: string;
  x: number;
  y: number;
  w: number;
  d: number;
  /** CSS color for the floor (a material token or a hex). */
  floor: string;
  lede: string;
  what: string;
  skills: string[];
  why: string;
  home: string[];
  fit: string;
};

export type PathStage = {
  id: string;
  title: string;
  blurb: string;
  looks: string;
  skills: string[];
  rooms: string[];
  family: string;
  /** Links the stage to the homepage hero's graduation-day milestone. */
  graduation?: boolean;
};

export type RoomModule =
  | { kind: 'stepper'; title: string; note: string; steps: { label: string; sub: string; text: string }[] }
  | { kind: 'moments'; title: string; note: string; moments: { label: string; text: string }[] }
  | { kind: 'routine'; title: string; note: string; steps: string[]; fading?: { title: string; note: string; levels: { label: string; text: string }[] } }
  | { kind: 'cards'; title: string; note: string; cards: { title: string; text: string }[] };

export type CenterModel = {
  centerId: string;
  slug: string;
  name: string;
  building: { w: number; d: number };
  rooms: Room[];
  path: PathStage[];
  modules: Record<string, RoomModule>;
};
