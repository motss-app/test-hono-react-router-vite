import { type JSX, useEffect, useLayoutEffect, useRef } from 'react';

import { Link } from '../components/Link.tsx';
import { LocaleSwitcher } from '../components/locale-switcher.tsx';
import { Text } from '../components/text.tsx';
import {
  IconArrowLeft,
  IconCircleInfo,
  IconGears,
  IconHome,
  IconServer,
  IconShield,
} from '../icons.ts';
import * as m from '../paraglide/messages.js';
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

// Must be functions — m.*() calls resolve locale at call time, so they
// cannot live at module scope where Paraglide locale isn't set yet.
function getLayoutNotes() {
  return [
    m.holy_grail_layout_note_1(),
    m.holy_grail_layout_note_2(),
    m.holy_grail_layout_note_3(),
  ] as const;
}

function getLeftRailNotes() {
  return [
    m.holy_grail_left_note_1(),
    m.holy_grail_left_note_2(),
    m.holy_grail_left_note_3(),
  ] as const;
}

function getRightRailNotes() {
  return [
    m.holy_grail_right_note_1(),
    m.holy_grail_right_note_2(),
    m.holy_grail_right_note_3(),
  ] as const;
}

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: m.meta_holy_grail_title(),
    },
    {
      content: m.meta_holy_grail_desc(),
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
    const shellEl = shellRef.current;
    const headerEl = headerRef.current;

    if (shellEl === null || headerEl === null) {
      return;
    }

    const updateHeaderHeight = (): void => {
      shellEl.style.setProperty(
        '--holy-grail-header-height',
        `${headerEl.getBoundingClientRect().height}px`
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
    observer.observe(headerEl);
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
                {m.holy_grail_eyebrow()}
              </Text>
              <Text
                as="h1"
                className={layoutTitle}
              >
                {m.holy_grail_title()}
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
              {m.holy_grail_nav_home()}
            </Link>
            <Link
              className={navLink}
              to="/about"
            >
              {m.holy_grail_nav_about()}
            </Link>
            <Link
              className={navLink}
              to="/hono-rpc"
            >
              {m.holy_grail_nav_rpc()}
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
              {m.holy_grail_label_left_rail()}
            </Text>
            <Text
              as="h2"
              className={shellTitle}
            >
              {m.holy_grail_left_title()}
            </Text>
          </div>

          <p className={railBody}>{m.holy_grail_left_desc()}</p>

          <ul className={railList}>
            {getLeftRailNotes().map(note => (
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
              {m.holy_grail_article_eyebrow()}
            </Text>
            <Text
              as="h2"
              className={articleTitle}
            >
              {m.holy_grail_article_title()}
            </Text>
          </div>

          <p className={articleBody}>{m.holy_grail_article_desc()}</p>

          <section className={layoutDiagram}>
            <header className={layoutHeader}>
              <Text
                as="p"
                className={layoutLabel}
              >
                {m.holy_grail_nested_label()}
              </Text>
              <Text
                as="h3"
                className={shellTitle}
              >
                {m.holy_grail_nested_title()}
              </Text>
              <Text
                as="p"
                className={topLine}
              >
                {m.holy_grail_nested_desc()}
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
                  {m.holy_grail_label_left_rail()}
                </Text>
                <Text
                  as="p"
                  className={topLine}
                >
                  {m.holy_grail_layout_left_desc()}
                </Text>
              </aside>

              <article className={layoutCenter}>
                <Text
                  as="p"
                  className={layoutLabel}
                >
                  {m.holy_grail_label_main()}
                </Text>
                <Text
                  as="p"
                  className={topLine}
                >
                  {m.holy_grail_layout_main_desc()}
                </Text>
              </article>

              <aside className={layoutRight}>
                <Text
                  as="p"
                  className={layoutLabel}
                >
                  {m.holy_grail_label_right_rail()}
                </Text>
                <Text
                  as="p"
                  className={topLine}
                >
                  {m.holy_grail_layout_right_desc()}
                </Text>
              </aside>
            </main>

            <footer className={layoutFooter}>
              <Text
                as="h3"
                className={shellTitle}
              >
                {m.holy_grail_flexible_title()}
              </Text>

              <ul className={railList}>
                {getLayoutNotes().map(note => (
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
              {m.holy_grail_label_right_rail()}
            </Text>
            <Text
              as="h2"
              className={shellTitle}
            >
              {m.holy_grail_right_title()}
            </Text>
          </div>

          <p className={railBody}>{m.holy_grail_right_desc()}</p>

          <ul className={railList}>
            {getRightRailNotes().map(note => (
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
            <span>{m.holy_grail_back_home()}</span>
          </Link>
        </aside>
      </main>

      <footer className={footer}>
        <div className={footerInner}>
          <LocaleSwitcher />
          <p className={footerNote}>{m.holy_grail_footer_note()}</p>

          <div className={nav}>
            <Link
              className={footerLink}
              to="/"
            >
              <IconArrowLeft className={railIcon} />
              <span>{m.holy_grail_back_home()}</span>
            </Link>

            <Link
              className={footerLink}
              to="/errors"
            >
              <IconCircleInfo className={railIcon} />
              <span>{m.holy_grail_see_another()}</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
