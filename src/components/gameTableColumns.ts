export interface GameTableColumnSetting {
  key: string;
  label: string;
  maxWidth: number;
  minWidth: number;
  visible: boolean;
  order: number;
}

export const defaultGameTableColumns: GameTableColumnSetting[] = [
  { key: 'cover', label: 'Cover', maxWidth: 60, minWidth: 60, visible: true, order: 0 },
  { key: 'photo', label: 'Photo', maxWidth: 99, minWidth: 99, visible: false, order: 1 },
  { key: 'screenshot', label: 'Screenshot', maxWidth: 99, minWidth: 99, visible: false, order: 2 },
  { key: 'title', label: 'Title', maxWidth: 300, minWidth: 200, visible: true, order: 3 },
  { key: 'alternativeNames', label: 'Alternative Names', maxWidth: 140, minWidth: 140, visible: true, order: 4 },
  { key: 'production', label: 'Production', maxWidth: 180, minWidth: 100, visible: true, order: 5 },
  { key: 'rating', label: 'Rating', maxWidth: 110, minWidth: 110, visible: true, order: 6 },
  { key: 'console', label: 'Console', maxWidth: 120, minWidth: 60, visible: true, order: 7 },
  { key: 'condition', label: 'Condition', maxWidth: 250, minWidth: 160, visible: true, order: 8 },
  { key: 'region', label: 'Region', maxWidth: 170, minWidth: 130, visible: true, order: 9 },
  { key: 'genres', label: 'Genres', maxWidth: 200, minWidth: 140, visible: false, order: 10 },
  { key: 'franchises', label: 'Franchises', maxWidth: 200, minWidth: 140, visible: false, order: 11 },
  { key: 'multiplayerModes', label: 'Multiplayer Modes', maxWidth: 120, minWidth: 120, visible: false, order: 12 },
  { key: 'createdAt', label: 'Created At', maxWidth: 140, minWidth: 100, visible: false, order: 13 },
  { key: 'gameLocation', label: 'Location', maxWidth: 140, minWidth: 100, visible: false, order: 14 },
  { key: 'releaseYear', label: 'Release Year', maxWidth: 100, minWidth: 100, visible: false, order: 15 },
  { key: 'completed', label: 'Completed', maxWidth: 100, minWidth: 100, visible: true, order: 14 },
  { key: 'favorite', label: 'Favorite', maxWidth: 100, minWidth: 100, visible: true, order: 15 },
  { key: 'actions', label: 'Actions', maxWidth: 120, minWidth: 120, visible: true, order: 16 },
];
