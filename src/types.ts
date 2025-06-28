export const supportedDirections = ["top", "bottom", "left", "right"] as const;
export type Direction = (typeof supportedDirections)[number];
