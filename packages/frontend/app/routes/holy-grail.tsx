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
import type { Route } from './+types/holy-grail.ts';
import {
  articleBody,
  articleEyebrow,
  articleShell,
  articleTitle,
  brand,
  brandIcon,
  brandMark,
  footer,
  footerInner,
  footerLink,
  footerNote,
  header,
  headerInner,
  layoutCenter,
  layoutDiagram,
  layoutDiagramMain,
  layoutFooter,
  layoutHeader,
  layoutLabel,
  layoutLeft,
  layoutRight,
  layoutTitle,
  nav,
  navLink,
  pageShell,
  railBody,
  railIcon,
  railIconWrap,
  railList,
  railListItem,
  shell,
  shellLeft,
  shellNote,
  shellRight,
  shellTitle,
  shellTopline,
  topLine,
} from './holy-grail.css.ts';

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
      className={pageShell}
      ref={shellRef}
    >
      <header
        className={header}
        ref={headerRef}
      >
        <div className={headerInner}>
          <div className={brand}>
            <span className={brandMark}>
              <IconGears className={brandIcon} />
            </span>

            <div>
              <Text
                as="p"
                className={articleEyebrow}
              >
                SSG grid demo
              </Text>
              <Text
                as="h1"
                className={layoutTitle}
              >
                Holy grail layout
              </Text>
            </div>
          </div>

          <nav
            aria-label="Primary"
            className={nav}
          >
            <Link
              className={navLink}
              to="/"
            >
              Home
            </Link>
            <Link
              className={navLink}
              to="/about"
            >
              About
            </Link>
            <Link
              className={navLink}
              to="/hono-rpc"
            >
              RPC
            </Link>
          </nav>
        </div>
      </header>

      <main className={shell}>
        <aside className={shellLeft}>
          <div className={shellTopline}>
            <Text
              as="p"
              className={shellNote}
            >
              Left rail
            </Text>
            <Text
              as="h2"
              className={shellTitle}
            >
              Navigation and context.
            </Text>
          </div>

          <p className={railBody}>
            This column keeps the supporting information close without asking the main content to
            carry everything.
          </p>

          <ul className={railList}>
            {leftRailNotes.map(note => (
              <li
                className={railListItem}
                key={note}
              >
                <span className={railIconWrap}>
                  <IconShield className={railIcon} />
                </span>
                <p className={railBody}>{note}</p>
              </li>
            ))}
          </ul>
        </aside>

        <article className={articleShell}>
          <div className={shellTopline}>
            <Text
              as="p"
              className={articleEyebrow}
            >
              Page-owned shell
            </Text>
            <Text
              as="h2"
              className={articleTitle}
            >
              Header on top, main in the middle, footer at the bottom.
            </Text>
          </div>

          <p className={articleBody}>
            The root keeps the document skeleton. This route owns the visible structure, so the holy
            grail pattern stays local to the page instead of leaking into the app shell.
          </p>

          <section className={layoutDiagram}>
            <header className={layoutHeader}>
              <Text
                as="p"
                className={layoutLabel}
              >
                Nested header
              </Text>
              <Text
                as="h3"
                className={shellTitle}
              >
                Header, main, footer inside the article.
              </Text>
              <Text
                as="p"
                className={topLine}
              >
                The nested shell lets the middle track adapt to the article width instead of the
                viewport.
              </Text>
            </header>

            <main
              aria-label="Nested main"
              className={layoutDiagramMain}
            >
              <aside className={layoutLeft}>
                <Text
                  as="p"
                  className={layoutLabel}
                >
                  Left rail
                </Text>
                <Text
                  as="p"
                  className={topLine}
                >
                  Secondary navigation and supporting context.
                </Text>
              </aside>

              <article className={layoutCenter}>
                <Text
                  as="p"
                  className={layoutLabel}
                >
                  Main
                </Text>
                <Text
                  as="p"
                  className={topLine}
                >
                  The middle track expands and remains readable at every width.
                </Text>
              </article>

              <aside className={layoutRight}>
                <Text
                  as="p"
                  className={layoutLabel}
                >
                  Right rail
                </Text>
                <Text
                  as="p"
                  className={topLine}
                >
                  Status, notes, and related links that should not dominate the flow.
                </Text>
              </aside>
            </main>

            <footer className={layoutFooter}>
              <Text
                as="h3"
                className={shellTitle}
              >
                Why it stays flexible.
              </Text>

              <ul className={railList}>
                {layoutNotes.map(note => (
                  <li
                    className={railListItem}
                    key={note}
                  >
                    <span className={railIconWrap}>
                      <IconCircleInfo className={railIcon} />
                    </span>
                    <p className={railBody}>{note}</p>
                  </li>
                ))}
              </ul>
            </footer>
          </section>
        </article>

        <aside className={shellRight}>
          <div className={shellTopline}>
            <Text
              as="p"
              className={shellNote}
            >
              Right rail
            </Text>
            <Text
              as="h2"
              className={shellTitle}
            >
              Notes and status.
            </Text>
          </div>

          <p className={railBody}>
            The side rail is where you place references, status, or helper content without forcing
            the central article to do double duty.
          </p>

          <ul className={railList}>
            {rightRailNotes.map(note => (
              <li
                className={railListItem}
                key={note}
              >
                <span className={railIconWrap}>
                  <IconServer className={railIcon} />
                </span>
                <p className={railBody}>{note}</p>
              </li>
            ))}
          </ul>

          <Link
            className={footerLink}
            to="/"
          >
            <IconHome className={railIcon} />
            <span>Back home</span>
          </Link>
        </aside>
      </main>

      <footer className={footer}>
        <div className={footerInner}>
          <p className={footerNote}>
            Static route • prerendered at build time • no loader required
          </p>

          <div className={nav}>
            <Link
              className={footerLink}
              to="/"
            >
              <IconArrowLeft className={railIcon} />
              <span>Back home</span>
            </Link>

            <Link
              className={footerLink}
              to="/errors"
            >
              <IconCircleInfo className={railIcon} />
              <span>See another layout</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
