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

Available pages are `about`, `holy-grail`, `ssr`, `labs`, `mandelbrot`,
`dominant-color`, `image-optimize`, `not-found`, and `application-error`.
The original Home artwork and the dedicated RPC and error hero
illustrations remain independently authored assets.

`--mirror` reverses the corner arrangement while keeping the central reading
area clear. Include it when replaying the seed of a mirrored composition.

The current Holy Grail artwork uses seed
`916c72dd-58de-4de3-9965-e0f7c5c7f7ed` with `--page holy-grail --mirror`.
The current Mandelbrot artwork uses seed
`ae900c47-80a3-4395-a7e4-63ee9ace3f57` with `--page mandelbrot`.

The script writes to the existing asset paths used by each page's Vanilla
Extract styles. It does not run in the browser or randomly change artwork
between visits. Review light and dark themes, narrow screens, and text contrast
after regeneration. Commit the generated SVGs with any intentional seed change.

Home, About, Holy Grail, and SSR keep a shared 64px gap before their footer.
About, Holy Grail, and SSR place their artwork across the full main area. Other
generated backgrounds belong to their page's hero or error surface. The SVGs
leave the center clear for content, and page styles reduce opacity on mobile.

The Dominant Color page uses a unique fan of rounded color chips at opposite
edges. Reproduce it with:

```sh
pnpm backgrounds:generate --page dominant-color --seed issue-97-dominant-color-swatches
```

Its artwork covers the full main area,
repeating vertically at a width-based scale so result tabs do not stretch it.
