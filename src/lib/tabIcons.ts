// 12x12 pixel-art tab icons: deliberately chunky and simple (2px per art pixel at the default size 24), one
// solid colour that follows currentColor so each icon takes the tab's active / idle / hover palette.
//   user -> MAIN (person)   share -> SOCIALS (chat bubble)   grid -> INTERESTS (book with a heart)   cpu -> SPECS (chip)
// Rows shorter than 12 are centred vertically when drawn.
export const TAB_ICON_GRID = 12;

export const TAB_ICONS: Record<string, string[]> = {
  user: [
    '....####....',
    '...######...',
    '...######...',
    '....####....',
    '............',
    '..########..',
    '.##########.',
    '############',
    '############',
  ],
  share: [
    '.##########.',
    '############',
    '############',
    '##.##.##.###',
    '##.##.##.###',
    '############',
    '.##########.',
    '..####......',
    '..###.......',
    '..##........',
  ],
  grid: [
    '.##########.',
    '############',
    '###..##..###',
    '###......###',
    '####....####',
    '#####..#####',
    '############',
    '############',
    '############',
    '.##########.',
  ],
  cpu: [
    '....#..#....',
    '..########..',
    '..########..',
    '############',
    '..###..###..',
    '..###..###..',
    '############',
    '..########..',
    '..########..',
    '....#..#....',
  ],
};
