// Scale2x (EPX) pixel-art upscaler: doubles a sprite and rounds off the stair-stepped diagonals without blurring or
// inventing colours. Cells are single characters; '.' is transparent.
export function scale2x(rows: string[]): string[] {
  const h = rows.length;
  const w = rows[0]?.length ?? 0;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? '.' : rows[y][x]);
  const out: string[] = [];
  for (let y = 0; y < h; y++) {
    let top = '';
    let bottom = '';
    for (let x = 0; x < w; x++) {
      const p = at(x, y);
      const a = at(x, y - 1); // up
      const b = at(x + 1, y); // right
      const c = at(x - 1, y); // left
      const d = at(x, y + 1); // down
      top += c === a && c !== d && a !== b ? a : p;
      top += a === b && a !== c && b !== d ? b : p;
      bottom += d === c && d !== b && c !== a ? c : p;
      bottom += b === d && b !== a && d !== c ? d : p;
    }
    out.push(top, bottom);
  }
  return out;
}

// Merge horizontal runs of the same colour into one rect each (keeps the SVG small and seam-free).
export function runs(rows: string[]): { x: number; y: number; w: number; ch: string }[] {
  const result: { x: number; y: number; w: number; ch: string }[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      if (ch !== '.') result.push({ x, y, w: end - x, ch });
      x = end;
    }
  });
  return result;
}

// Vertically centre a sprite inside a square grid of `size` rows.
export function centreRows(rows: string[], size: number): string[] {
  const filled = rows.map((r) => /[^.]/.test(r));
  const first = filled.indexOf(true);
  const last = filled.lastIndexOf(true);
  if (first < 0) return rows;
  const trimmed = rows.slice(first, last + 1);
  const blank = '.'.repeat(rows[0].length);
  const top = Math.floor((size - trimmed.length) / 2);
  return [...Array(top).fill(blank), ...trimmed, ...Array(size - top - trimmed.length).fill(blank)];
}
