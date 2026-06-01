import { create, keyframes, props } from '@stylexjs/stylex';
import { type JSX, useEffect, useLayoutEffect, useRef } from 'react';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/text.tsx';
import {
  IconArrowLeft,
  IconCircleInfo,
  IconGears,
  IconHome,
  IconServer,
  IconShield,
} from '../icons.ts';
import { iconStyles } from '../styles/icon.stylex.ts';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/holy-grail.ts';

const fadeUp = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, 1rem, 0)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  },
});

const layoutNotes = [
  'The document shell stays in `root.tsx`.',
  'The page shell is a grid with `header`, `main`, and `footer` rows.',
  'The middle track uses grid columns so the sidebars never steal the spotlight.',
] as const;

const leftRailNotes = [
  'Persistent navigation stays out of the main reading flow.',
  'Useful metadata belongs in the rail, not in the hero copy.',
  'The layout still works when the rails collapse on mobile.',
] as const;

const rightRailNotes = [
  'Sticky sidebars create the classic holy grail silhouette.',
  'The center column is the only region that should stretch hard.',
  'Header and footer frame the content without boxing it in.',
] as const;

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: 'Holy Grail Layout · React Router + Hono Demo',
    },
    {
      content:
        'A prerendered holy grail layout demo with header, main, footer, and responsive side rails.',
      name: 'description',
    },
  ];
}

const s = create({
  article: {
    animationDelay: '180ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: fadeUp,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    display: 'grid',
    gap: '1.25rem',
    minWidth: 0,
  },
  articleBody: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '1rem',
    lineHeight: '1.75',
    margin: 0,
    maxWidth: '54ch',
  },
  articleEyebrow: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    fontSize: '0.82rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '0.16em',
    margin: 0,
    textTransform: 'uppercase',
  },
  articleTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: {
      '@container (min-width: 48rem)': '3.2rem',
      default: '2.25rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.05em',
    lineHeight: '0.95',
    margin: 0,
    maxWidth: '12ch',
  },
  bodyCopy: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '1rem',
    lineHeight: '1.75',
    margin: 0,
    maxWidth: '62ch',
  },
  brand: {
    alignItems: 'center',
    display: 'grid',
    gap: '0.9rem',
    gridAutoColumns: 'max-content',
    gridAutoFlow: 'column',
    minWidth: 0,
  },
  brandIcon: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate900,
      default: colorTokens.white,
    },
    height: '1.25rem',
    width: '1.25rem',
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    borderRadius: '1rem',
    display: 'inline-grid',
    flexShrink: 0,
    height: '3rem',
    justifyContent: 'center',
    placeItems: 'center',
    width: '3rem',
  },
  footer: {
    borderTopColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate200,
    },
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '96rem',
    paddingBottom: '1.25rem',
    paddingLeft: '1.25rem',
    paddingRight: '1.25rem',
    paddingTop: '0.75rem',
    width: '100%',
  },
  footerInner: {
    alignItems: 'center',
    animationDelay: '280ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: fadeUp,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: {
      '@container (min-width: 48rem)': '1fr auto',
      default: '1fr',
    },
  },
  footerLink: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: 'rgba(125, 211, 252, 0.14)',
        default: 'rgba(14, 165, 233, 0.1)',
      },
      transform: 'translate3d(0.25rem, 0, 0)',
    },
    alignItems: 'center',
    borderRadius: '9999px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    display: 'inline-grid',
    gap: '0.45rem',
    gridAutoColumns: 'max-content',
    gridAutoFlow: 'column',
    padding: '0.55rem 0.9rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  footerNote: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: colorTokens.slate600,
    },
    fontSize: '0.92rem',
    margin: 0,
  },
  header: {
    backdropFilter: 'blur(20px)',
    backgroundColor: {
      [themeConditions.dataThemeDark]: 'rgba(2, 6, 23, 0.7)',
      default: 'rgba(250, 250, 250, 0.82)',
    },
    borderBottomColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate200,
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
  headerInner: {
    alignItems: 'center',
    animationDelay: '60ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: fadeUp,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: {
      '@container (min-width: 48rem)': 'auto 1fr',
      default: '1fr',
    },
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '96rem',
    paddingBottom: '1rem',
    paddingLeft: '1.25rem',
    paddingRight: '1.25rem',
    paddingTop: '1rem',
    width: '100%',
  },
  layoutBlock: {
    borderColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate700,
      default: colorTokens.slate300,
    },
    borderRadius: '1rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: '1rem',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  },
  layoutBlockCenter: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: 'rgba(8, 15, 31, 0.92)',
      default: 'rgba(255, 255, 255, 0.9)',
    },
    minHeight: '15rem',
  },
  layoutBlockLeft: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: 'rgba(15, 23, 42, 0.54)',
      default: 'rgba(239, 246, 255, 0.92)',
    },
  },
  layoutBlockRight: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: 'rgba(15, 23, 42, 0.38)',
      default: 'rgba(249, 250, 251, 0.92)',
    },
  },
  layoutDiagram: {
    containerType: 'inline-size',
    display: 'grid',
    gap: '0.85rem',
  },
  layoutDiagramBody: {
    display: 'grid',
    gap: '0.85rem',
    gridTemplateColumns: {
      '@container (min-width: 40rem)': 'minmax(12rem, 1fr) minmax(0, 2fr) minmax(12rem, 1fr)',
      default: '1fr',
    },
  },
  layoutDiagramFooter: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: 'rgba(15, 23, 42, 0.5)',
      default: 'rgba(241, 245, 249, 0.92)',
    },
    textAlign: 'center',
  },
  layoutDiagramHeader: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#0f172a',
      default: '#dbeafe',
    },
    textAlign: 'center',
  },
  layoutDiagramMain: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: 'rgba(125, 211, 252, 0.14)',
      default: 'rgba(14, 165, 233, 0.08)',
    },
    containerType: 'inline-size',
    display: 'grid',
    gap: '0.85rem',
    gridTemplateColumns: {
      '@container (min-width: 40rem)': 'minmax(12rem, 1fr) minmax(0, 2fr) minmax(12rem, 1fr)',
      default: '1fr',
    },
    minHeight: '15rem',
  },
  layoutLabel: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    fontSize: '0.78rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '0.18em',
    margin: 0,
    textTransform: 'uppercase',
  },
  layoutTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: {
      '@container (min-width: 48rem)': '3.6rem',
      default: '2.4rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.06em',
    lineHeight: '0.94',
    margin: 0,
    maxWidth: 'none',
    whiteSpace: 'nowrap',
  },
  nav: {
    alignItems: 'center',
    display: 'grid',
    gap: '0.5rem',
    gridAutoColumns: 'max-content',
    gridAutoFlow: 'column',
  },
  navLink: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: 'rgba(125, 211, 252, 0.12)',
        default: 'rgba(14, 165, 233, 0.08)',
      },
    },
    borderRadius: '9999px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    fontSize: '0.92rem',
    padding: '0.55rem 0.8rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  page: {
    backgroundImage: {
      [themeConditions.dataThemeDark]:
        'radial-gradient(circle at top, rgba(14, 165, 233, 0.12), transparent 40%), linear-gradient(180deg, rgba(2, 6, 23, 0.92) 0%, rgba(2, 6, 23, 1) 55%)',
      default:
        'radial-gradient(circle at top, rgba(14, 165, 233, 0.1), transparent 40%), linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(241, 245, 249, 1) 55%)',
    },
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    containerType: 'inline-size',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    minHeight: '100svh',
  },
  pageVars: {
    '--holy-grail-header-height': '0px',
    '--holy-grail-sticky-gap': '1rem',
  },
  rail: {
    alignSelf: 'start',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: fadeUp,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    display: 'grid',
    gap: '1rem',
    minWidth: 0,
    position: {
      '@container (min-width: 60rem)': 'sticky',
      default: 'static',
    },
    top: {
      '@container (min-width: 60rem)':
        'calc(var(--holy-grail-header-height) + var(--holy-grail-sticky-gap))',
      default: 'auto',
    },
  },
  railBody: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '0.96rem',
    lineHeight: '1.7',
    margin: 0,
  },
  railHeading: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: '1.15rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '-0.03em',
    lineHeight: '1.05',
    margin: 0,
  },
  railIcon: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    height: '1rem',
    width: '1rem',
  },
  railIconWrap: {
    alignItems: 'center',
    display: 'inline-grid',
    placeItems: 'center',
  },
  railList: {
    display: 'grid',
    gap: '0.75rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  railListItem: {
    borderTopColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate300,
    },
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: '0.75rem',
  },
  railSection: {
    borderColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate200,
    },
    borderRadius: '1.25rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'grid',
    gap: '0.95rem',
    padding: '1rem',
  },
  railSectionAccent: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: 'rgba(125, 211, 252, 0.08)',
      default: 'rgba(14, 165, 233, 0.06)',
    },
  },
  shell: {
    display: 'grid',
    gap: '1.25rem',
    gridTemplateAreas: {
      '@container (min-width: 60rem)': '"left main right"',
      default: '"left" "main" "right"',
    },
    gridTemplateColumns: {
      '@container (min-width: 60rem)': 'minmax(12rem, 1fr) minmax(0, 2.6fr) minmax(12rem, 1fr)',
      default: '1fr',
    },
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '96rem',
    paddingBottom: '1.5rem',
    paddingLeft: '1.25rem',
    paddingRight: '1.25rem',
    paddingTop: '1.25rem',
    width: '100%',
  },
  shellLeft: {
    gridArea: 'left',
  },
  shellMain: {
    gridArea: 'main',
  },
  shellNote: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: colorTokens.slate600,
    },
    fontSize: '0.9rem',
    letterSpacing: '0.08em',
    margin: 0,
    textTransform: 'uppercase',
  },
  shellRight: {
    gridArea: 'right',
  },
  shellTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: {
      '@container (min-width: 48rem)': '1.45rem',
      default: '1.2rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.03em',
    lineHeight: '1.05',
    margin: 0,
  },
  shellTopline: {
    animationDelay: '120ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: fadeUp,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    display: 'grid',
    gap: '0.5rem',
  },
  topLine: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: colorTokens.slate600,
    },
    fontSize: '0.92rem',
    lineHeight: '1.6',
    margin: 0,
    maxWidth: '32ch',
  },
  topLineAccent: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    fontWeight: fontWeightTokens.fontWeightSemibold,
  },
});

export default function HolyGrailPage(): JSX.Element {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const useIsomorphicLayoutEffect =
    typeof globalThis.document === 'undefined' ? useEffect : useLayoutEffect;

  useIsomorphicLayoutEffect(() => {
    const shell = shellRef.current;
    const header = headerRef.current;

    if (shell === null || header === null) {
      return;
    }

    const updateHeaderHeight = (): void => {
      shell.style.setProperty(
        '--holy-grail-header-height',
        `${header.getBoundingClientRect().height}px`
      );
    };

    updateHeaderHeight();

    if (typeof ResizeObserver === 'undefined') {
      globalThis.addEventListener('resize', updateHeaderHeight);

      return () => {
        globalThis.removeEventListener('resize', updateHeaderHeight);
      };
    }

    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);
    globalThis.addEventListener('resize', updateHeaderHeight);

    return () => {
      observer.disconnect();
      globalThis.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  return (
    <div
      ref={shellRef}
      {...props(s.page, s.pageVars)}
    >
      <header
        ref={headerRef}
        {...props(s.header)}
      >
        <div {...props(s.headerInner)}>
          <div {...props(s.brand)}>
            <span {...props(s.brandMark)}>
              <IconGears {...props(iconStyles.base, s.brandIcon)} />
            </span>

            <div>
              <Text
                as="p"
                {...props(s.articleEyebrow)}
              >
                SSG grid demo
              </Text>
              <Text
                as="h1"
                {...props(s.layoutTitle)}
              >
                Holy grail layout
              </Text>
            </div>
          </div>

          <nav
            aria-label="Primary"
            {...props(s.nav)}
          >
            <Link
              to="/"
              {...props(s.navLink)}
            >
              Home
            </Link>
            <Link
              to="/about"
              {...props(s.navLink)}
            >
              About
            </Link>
            <Link
              to="/hono-rpc"
              {...props(s.navLink)}
            >
              RPC
            </Link>
          </nav>
        </div>
      </header>

      <main {...props(s.shell)}>
        <aside {...props(s.rail, s.shellLeft, s.railSection, s.railSectionAccent)}>
          <div {...props(s.shellTopline)}>
            <Text
              as="p"
              {...props(s.shellNote)}
            >
              Left rail
            </Text>
            <Text
              as="h2"
              {...props(s.shellTitle)}
            >
              Navigation and context.
            </Text>
          </div>

          <p {...props(s.railBody)}>
            This column keeps the supporting information close without asking the main content to
            carry everything.
          </p>

          <ul {...props(s.railList)}>
            {leftRailNotes.map(note => (
              <li
                key={note}
                {...props(s.railListItem)}
              >
                <span {...props(s.railIconWrap)}>
                  <IconShield {...props(iconStyles.base, s.railIcon)} />
                </span>
                <p {...props(s.railBody)}>{note}</p>
              </li>
            ))}
          </ul>
        </aside>

        <article {...props(s.article, s.shellMain)}>
          <div {...props(s.shellTopline)}>
            <Text
              as="p"
              {...props(s.articleEyebrow)}
            >
              Page-owned shell
            </Text>
            <Text
              as="h2"
              {...props(s.articleTitle)}
            >
              Header on top, main in the middle, footer at the bottom.
            </Text>
          </div>

          <p {...props(s.articleBody)}>
            The root keeps the document skeleton. This route owns the visible structure, so the holy
            grail pattern stays local to the page instead of leaking into the app shell.
          </p>

          <section {...props(s.layoutDiagram)}>
            <header {...props(s.layoutBlock, s.layoutDiagramHeader)}>
              <Text
                as="p"
                {...props(s.layoutLabel)}
              >
                Nested header
              </Text>
              <Text
                as="h3"
                {...props(s.shellTitle)}
              >
                Header, main, footer inside the article.
              </Text>
              <Text
                as="p"
                {...props(s.topLine)}
              >
                The nested shell lets the middle track adapt to the article width instead of the
                viewport.
              </Text>
            </header>

            <main
              aria-label="Nested main"
              {...props(s.layoutDiagramMain)}
            >
              <aside {...props(s.layoutBlock, s.layoutBlockLeft)}>
                <Text
                  as="p"
                  {...props(s.layoutLabel)}
                >
                  Left rail
                </Text>
                <Text
                  as="p"
                  {...props(s.topLine)}
                >
                  Secondary navigation and supporting context.
                </Text>
              </aside>

              <article {...props(s.layoutBlock, s.layoutBlockCenter)}>
                <Text
                  as="p"
                  {...props(s.layoutLabel)}
                >
                  Main
                </Text>
                <Text
                  as="p"
                  {...props(s.topLine)}
                >
                  The middle track expands and remains readable at every width.
                </Text>
              </article>

              <aside {...props(s.layoutBlock, s.layoutBlockRight)}>
                <Text
                  as="p"
                  {...props(s.layoutLabel)}
                >
                  Right rail
                </Text>
                <Text
                  as="p"
                  {...props(s.topLine)}
                >
                  Status, notes, and related links that should not dominate the flow.
                </Text>
              </aside>
            </main>

            <footer {...props(s.layoutBlock, s.layoutDiagramFooter)}>
              <Text
                as="h3"
                {...props(s.shellTitle)}
              >
                Why it stays flexible.
              </Text>

              <ul {...props(s.railList)}>
                {layoutNotes.map(note => (
                  <li
                    key={note}
                    {...props(s.railListItem)}
                  >
                    <span {...props(s.railIconWrap)}>
                      <IconCircleInfo {...props(iconStyles.base, s.railIcon)} />
                    </span>
                    <p {...props(s.railBody)}>{note}</p>
                  </li>
                ))}
              </ul>
            </footer>
          </section>
        </article>

        <aside {...props(s.rail, s.shellRight, s.railSection)}>
          <div {...props(s.shellTopline)}>
            <Text
              as="p"
              {...props(s.shellNote)}
            >
              Right rail
            </Text>
            <Text
              as="h2"
              {...props(s.shellTitle)}
            >
              Notes and status.
            </Text>
          </div>

          <p {...props(s.railBody)}>
            The side rail is where you place references, status, or helper content without forcing
            the central article to do double duty.
          </p>

          <ul {...props(s.railList)}>
            {rightRailNotes.map(note => (
              <li
                key={note}
                {...props(s.railListItem)}
              >
                <span {...props(s.railIconWrap)}>
                  <IconServer {...props(iconStyles.base, s.railIcon)} />
                </span>
                <p {...props(s.railBody)}>{note}</p>
              </li>
            ))}
          </ul>

          <Link
            to="/"
            {...props(s.footerLink)}
          >
            <IconHome {...props(iconStyles.base, s.railIcon)} />
            <span>Back home</span>
          </Link>
        </aside>
      </main>

      <footer {...props(s.footer)}>
        <div {...props(s.footerInner)}>
          <p {...props(s.footerNote)}>
            Static route • prerendered at build time • no loader required
          </p>

          <div {...props(s.nav)}>
            <Link
              to="/"
              {...props(s.footerLink)}
            >
              <IconArrowLeft {...props(iconStyles.base, s.railIcon)} />
              <span>Back home</span>
            </Link>

            <Link
              to="/errors"
              {...props(s.footerLink)}
            >
              <IconCircleInfo {...props(iconStyles.base, s.railIcon)} />
              <span>See another layout</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
