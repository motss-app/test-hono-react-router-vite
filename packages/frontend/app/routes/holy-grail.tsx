import { assignInlineVars, setElementVars } from '@vanilla-extract/dynamic';
import {
  type ChangeEvent,
  type JSX,
  type MouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { Breadcrumbs } from '../components/breadcrumbs.tsx';
import {
  IconBars,
  IconCircleInfo,
  IconCode,
  IconLayerGroup,
} from '../components/expressive.icons.ts';
import * as chrome from '../components/page-chrome.css.ts';
import * as footerStyles from '../components/page-footer.css.ts';
import {
  PagePreferences,
  SiteBrand,
  SiteNavigation,
  SkipToContent,
} from '../components/page-navigation.tsx';
import { PoweredByTools } from '../components/powered-by-tools.tsx';
import * as m from '../paraglide/messages.js';
import type { Route } from './+types/holy-grail.ts';
import * as s from './holy-grail.css.ts';

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

function HolyGrailHeader({ headerRef }: { headerRef: RefObject<HTMLElement | null> }) {
  return (
    <header
      className={`${chrome.header} ${s.header}`}
      ref={headerRef}
    >
      <div className={chrome.mobileBrand}>
        <SiteBrand />
      </div>
      <div className={chrome.breadcrumbSlot}>
        <Breadcrumbs
          items={[
            {
              label: m.holy_grail_nav_home(),
              to: '/',
            },
            {
              label: m.route_holy_grail_title(),
            },
          ]}
        />
      </div>
      <PagePreferences activePath="/holy-grail" />
    </header>
  );
}

function HolyGrailFooter() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerInner}>
        <PoweredByTools />
      </div>
    </footer>
  );
}

function getDemoSections() {
  return [
    {
      paragraphs: [
        m.holy_grail_article_desc(),
      ],
      title: m.holy_grail_principle_ownership(),
    },
    {
      paragraphs: [
        m.holy_grail_layout_note_2(),
        m.holy_grail_layout_note_3(),
      ],
      title: m.holy_grail_principle_grid(),
    },
    {
      paragraphs: [
        m.holy_grail_left_note_3(),
        m.holy_grail_nested_desc(),
      ],
      title: m.holy_grail_principle_resize(),
    },
  ];
}

function NestedLayoutDemo({ headerRef }: { headerRef: RefObject<HTMLElement | null> }) {
  const [width, setWidth] = useState(100);
  const [previewWidth, setPreviewWidth] = useState(100);
  const resizeTimer = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const viewportRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const hintId = useId();
  const widthId = useId();
  const previewTitleId = useId();
  const navigationId = useId();
  const contentId = useId();
  const asideId = useId();
  const sections = getDemoSections();
  const navigatePreview = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const viewport = viewportRef.current;
      const href = event.currentTarget.getAttribute('href');
      const target = href?.startsWith('#') ? document.getElementById(href.slice(1)) : null;
      if (viewport === null || target === null || !viewport.contains(target)) return;

      event.preventDefault();
      const gap = Number.parseFloat(getComputedStyle(viewport).fontSize);
      const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      const viewportTop = viewport.getBoundingClientRect().top;
      if (viewportTop < headerBottom) {
        globalThis.scrollBy({
          behavior: 'auto',
          top: viewportTop - headerBottom - gap,
        });
      }
      const top =
        target.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top +
        viewport.scrollTop -
        gap;
      viewport.scrollTo({
        behavior: 'auto',
        top,
      });
      target.focus({
        preventScroll: true,
      });
    },
    [
      headerRef,
    ]
  );
  const cancelResize = useCallback(() => {
    if (resizeTimer.current !== null) {
      globalThis.clearTimeout(resizeTimer.current);
      resizeTimer.current = null;
    }
  }, []);
  useEffect(
    () => cancelResize,
    [
      cancelResize,
    ]
  );
  const resizePreview = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextWidth = event.currentTarget.valueAsNumber;
      setWidth(nextWidth);
      cancelResize();
      resizeTimer.current = globalThis.setTimeout(() => {
        setPreviewWidth(nextWidth);
        resizeTimer.current = null;
      }, 150);
    },
    [
      cancelResize,
    ]
  );
  const resetPreview = useCallback(() => {
    cancelResize();
    setWidth(100);
    setPreviewWidth(100);
  }, [
    cancelResize,
  ]);

  return (
    <section
      aria-labelledby={titleId}
      className={s.explorer}
    >
      <h2
        className={s.sectionTitle}
        id={titleId}
      >
        {m.holy_grail_explorer_title()}
      </h2>
      <p
        className={s.body}
        id={hintId}
      >
        {m.holy_grail_explorer_hint()}
      </p>
      <div className={s.previewControls}>
        <label
          className={s.previewWidthLabel}
          htmlFor={widthId}
        >
          {m.holy_grail_preview_width()} <span aria-hidden="true">{width}%</span>
        </label>
        <input
          aria-valuetext={`${width}%`}
          className={s.widthSlider}
          id={widthId}
          max={100}
          min={50}
          onChange={resizePreview}
          step={5}
          type="range"
          value={width}
        />
        <button
          className={s.resetButton}
          onClick={resetPreview}
          type="button"
        >
          {m.holy_grail_reset_width()}
        </button>
      </div>
      <section
        aria-labelledby={previewTitleId}
        className={s.previewFrame}
        style={assignInlineVars({
          [s.previewWidth]: `${previewWidth}%`,
        })}
      >
        <header className={s.previewHeader}>
          <p className={s.previewPartLabel}>
            <IconLayerGroup aria-hidden="true" />
            {m.holy_grail_nested_label()} <code>&lt;header&gt;</code>
          </p>
          <h3
            className={s.previewTitle}
            id={previewTitleId}
          >
            {m.holy_grail_nested_title()}
          </h3>
        </header>
        <section
          aria-describedby={hintId}
          aria-label={m.holy_grail_preview_content()}
          className={s.previewBody}
          ref={viewportRef}
          /* biome-ignore lint/a11y/noNoninteractiveTabindex: Scroll region. */
          tabIndex={0}
        >
          <section
            aria-labelledby={contentId}
            className={s.previewArticle}
          >
            <h4
              className={s.previewHeading}
              id={contentId}
            >
              <IconCode aria-hidden="true" />
              {m.holy_grail_region_content()}
            </h4>
            <p className={s.body}>{m.holy_grail_layout_main_desc()}</p>
            {sections.map(({ title, paragraphs }, index) => (
              <section
                aria-labelledby={`${contentId}-${index}-title`}
                className={s.previewSection}
                id={`${contentId}-${index}`}
                key={title}
                tabIndex={-1}
              >
                <h5
                  className={s.previewSectionTitle}
                  id={`${contentId}-${index}-title`}
                >
                  {title}
                </h5>
                {paragraphs.map(text => (
                  <p
                    className={s.body}
                    key={text}
                  >
                    {text}
                  </p>
                ))}
              </section>
            ))}
          </section>
          <nav
            aria-labelledby={navigationId}
            className={s.previewNavigation}
          >
            <h4
              className={s.previewHeading}
              id={navigationId}
            >
              <IconBars aria-hidden="true" />
              {m.holy_grail_nested_navigation()}
            </h4>
            <p className={s.body}>{m.holy_grail_layout_left_desc()}</p>
            <ul className={s.previewLinks}>
              {sections.map(({ title }, index) => (
                <li key={title}>
                  <a
                    className={s.previewLink}
                    href={`#${contentId}-${index}`}
                    onClick={navigatePreview}
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
            <p className={s.body}>{m.holy_grail_left_note_1()}</p>
          </nav>
          <aside
            aria-labelledby={asideId}
            className={s.previewAside}
          >
            <h4
              className={s.previewHeading}
              id={asideId}
            >
              <IconCircleInfo aria-hidden="true" />
              {m.holy_grail_nested_aside()}
            </h4>
            <p className={s.body}>{m.holy_grail_layout_right_desc()}</p>
            <div className={s.previewMetadata}>
              <p className={s.noteLabel}>{m.holy_grail_rendering_title()}</p>
              <p className={s.body}>{m.holy_grail_footer_note()}</p>
            </div>
            <p className={s.body}>{m.holy_grail_left_note_2()}</p>
          </aside>
        </section>
        <footer className={s.previewFooter}>
          <p className={s.previewPartLabel}>
            <IconLayerGroup aria-hidden="true" />
            {m.holy_grail_region_footer()} <code>&lt;footer&gt;</code>
          </p>
          <p className={s.body}>{m.holy_grail_nested_footer_desc()}</p>
        </footer>
      </section>
    </section>
  );
}

function LayoutNotes() {
  const titleId = useId();
  return (
    <aside
      aria-labelledby={titleId}
      className={s.notes}
    >
      <h2
        className={s.notesTitle}
        id={titleId}
      >
        <IconCircleInfo
          aria-hidden="true"
          className={s.notesIcon}
        />
        {m.holy_grail_right_title()}
      </h2>
      <p className={s.body}>{m.holy_grail_right_desc()}</p>
      <ul className={s.notesList}>
        {[
          m.holy_grail_right_note_1(),
          m.holy_grail_right_note_2(),
          m.holy_grail_right_note_3(),
        ].map(note => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </aside>
  );
}

export default function HolyGrailPage(): JSX.Element {
  const mainId = useId();
  const titleId = useId();
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const layoutElement = layoutRef.current;
    const headerElement = headerRef.current;
    if (layoutElement === null || headerElement === null) return;
    const updateHeaderHeight = () => {
      setElementVars(layoutElement, {
        [s.headerHeight]: `${headerElement.getBoundingClientRect().height}px`,
      });
    };
    updateHeaderHeight();
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateHeaderHeight);
    observer?.observe(headerElement);
    globalThis.addEventListener('resize', updateHeaderHeight);
    return () => {
      observer?.disconnect();
      globalThis.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);
  return (
    <div
      className={`${s.layout} ${chrome.interactiveScope}`}
      ref={layoutRef}
    >
      <SkipToContent mainId={mainId} />
      <aside className={chrome.sidebar}>
        <SiteBrand />
        <SiteNavigation activePath="/holy-grail" />
      </aside>
      <div className={s.workspace}>
        <HolyGrailHeader headerRef={headerRef} />
        <main
          className={s.main}
          id={mainId}
          tabIndex={-1}
        >
          <article
            aria-labelledby={titleId}
            className={s.article}
          >
            <div className={s.intro}>
              <div
                aria-hidden="true"
                className={s.artwork}
              />
              <h1
                className={s.title}
                id={titleId}
              >
                {m.holy_grail_intro_title()}{' '}
                <span className={s.titleAccent}>{m.holy_grail_intro_accent()}</span>
              </h1>
              <p className={s.lead}>{m.holy_grail_intro_desc()}</p>
            </div>
            <NestedLayoutDemo headerRef={headerRef} />
          </article>
          <LayoutNotes />
        </main>
        <HolyGrailFooter />
      </div>
    </div>
  );
}
