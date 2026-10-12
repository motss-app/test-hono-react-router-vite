# Page backgrounds

Run `pnpm backgrounds:generate` to generate the baseline decorative SVGs.
The default seed is `issue-97-v1`. Each page name contributes to its seed, so
pages share a palette and visual style but have different curves.

```sh
# Generate a new random set and print its seed.
pnpm backgrounds:generate --random

# Change just one page.
pnpm backgrounds:generate --page holy-grail --random

# Move the large sweep to the upper left for a different composition.
pnpm backgrounds:generate --page holy-grail --mirror --random

# Reproduce a chosen composition.
pnpm backgrounds:generate --page holy-grail --seed my-seed
```

Available pages are `about`, `holy-grail`, `labs`, `mandelbrot`,
`dominant-color`, `image-optimize`, `not-found`, and `application-error`.
The original Home artwork and the dedicated SSR, RPC, and error hero
illustrations remain independently authored assets.

`--mirror` reverses the corner arrangement while keeping the central reading
area clear. Include it when replaying the seed of a mirrored composition.

The current Holy Grail artwork uses seed
`916c72dd-58de-4de3-9965-e0f7c5c7f7ed` with `--page holy-grail --mirror`.

The script writes to the existing asset paths used by each page's Vanilla
Extract styles. It does not run in the browser or randomly change artwork
between visits. Review light and dark themes, narrow screens, and text contrast
after regeneration. Commit the generated SVGs with any intentional seed change.

About and Holy Grail place their artwork across the full main area. Other
generated backgrounds belong to their page's hero or error surface. The SVGs
leave the center clear for content, and page styles reduce opacity on mobile.
