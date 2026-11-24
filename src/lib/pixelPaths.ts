// Convert compact pixel grids into a single SVG path. One path per icon keeps
// the DOM small and avoids the seam artifacts of rendering separate rectangles.
function runs(rows: string[]): { x: number; y: number; w: number; ch: string }[] {
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

export function pathData(rows: string[], character: string): string {
  let path = '';
  for (const run of runs(rows)) {
    if (run.ch === character) path += `M${run.x} ${run.y}h${run.w}v1h-${run.w}z`;
  }
  return path;
}
