# Tailwind → StyleX Utility Mapping

This reference translates the most commonly used Tailwind CSS utilities in the
project to their equivalent StyleX tokens or patterns.  It is intended for
developers who are writing new components or auditing existing ones during the
migration.

| Tailwind utility                          | StyleX replacement / notes                                         |
|-------------------------------------------|--------------------------------------------------------------------|
| `text-4xl`                                | `tokens.fontSize4xl`                                               |
| `font-bold`                               | `tokens.fontWeightBold`                                            |
| `text-center`                             | `tokens.textAlign`                                                  |
| `mb-8` / `mb-6`                            | `tokens.spacing8` (2rem) / `tokens.spacing6` if added (not yet)      |
| `text-slate-800` / `dark:text-white`      | `tokens.slate800` / global `textColor` toggled via `darkTheme`      |
| `text-slate-600` / `dark:text-slate-400`  | `tokens.slate600` / `tokens.slate400` (via media query)             |
| `max-w-2xl`                               | `utilities.maxWidth2xl`                                             |
| `mx-auto`                                 | `marginLeft: 'auto'; marginRight: 'auto'`                           |
| `leading-relaxed`                         | `lineHeight: 1.625`                                                 |
| `b-amber-200`                             | `tokens.amber200`                                                  |
| `p-16`                                    | `tokens.spacing16`                                                  |
| `w-fit`                                    | `width: 'fit-content'`                                              |
| `rounded-sm` / `rounded-xl`               | `tokens.borderRadiusSm` / `tokens.borderRadiusXl`                   |
| `shadow-lg`                               | `boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), ...'`               |
| `grid`, `gap-16`, `md:grid-cols-2`         | `display:'grid'; gap: tokens.spacing16; gridTemplateColumns` media   |
| `flex items-center gap-2`                 | `display:'flex'; alignItems:'center'; gap: tokens.spacing2`         |
| `text-blue-600 hover:text-blue-800`       | `color: tokens.info; ':hover': { color: tokens.infoHover }`         |
| `bg-white`, `dark:bg-slate-800`           | `bgColor` token plus darkTheme override                              |
| `border-gray-300 hover:border-gray-400`   | `borderColor: tokens.slate400; ':hover': { borderColor: tokens.slate600 }` |
| `transition-all duration-200`             | `transition: tokens.transitionColors`                               |
| `p-12`                                    | `tokens.spacing12`                                                  |

*Additional utilities should be added to this table as they arise during
Phase 4 audits.*

The mapping is intentionally lightweight; the goal is to provide clarity rather
than exhaustive coverage.
