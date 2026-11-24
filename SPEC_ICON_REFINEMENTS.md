# Specs icon refinements

Updated the PC specifications icon artwork using the five pixel-art references supplied in the conversation.

| Specs card | Reference | Implementation |
|---|---|---|
| RAM | `image(6).png` | Custom pixel-grid RAM stick with contacts along the long edge |
| SSD 1 | `image(7).png` | Custom NVMe module with contacts on the left |
| SSD 2 | `image(7).png` | Same NVMe module icon as SSD 1 |
| PSU | `image(8).png` | Custom power-supply icon with the lightning motif |
| Case | `image(9).png` | Custom PC tower/case icon |
| Cooler | `image(10).png` | Custom fan/cooler icon |

## Implementation notes

- Reference masks are stored in `src/lib/customPixelIcons.ts` as 24×24 transparent pixel grids.
- They use the existing single-path SVG generation and `currentColor` styling, so they inherit Novoumy's existing purple/wine icon color.
- The two SSD cards intentionally share the same icon.
- The Specs view mapping and card sizing/layout are unchanged.
- The Pixelarticons `PcCase` import was removed because the owner-supplied case sprite now fills that role.
