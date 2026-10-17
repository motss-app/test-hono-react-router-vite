import { type JSX, useId } from 'react';

import { Breadcrumbs } from '../components/breadcrumbs.tsx';
import { IconArrowRight } from '../components/expressive.icons.ts';
import { Link } from '../components/Link.tsx';
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
import type { Route } from './+types/labs.ts';
import * as c from './labs.css.ts';

type ToolId = 'mandelbrot' | 'dominant-color' | 'image-optimize';

/** Resolve translated catalog content after the route locale is set. */
function getTools() {
  return [
    {
      description: m.labs_tool_mandelbrot_desc(),
      id: 'mandelbrot',
      runtime: m.labs_runtime_browser_edge(),
      title: m.labs_tool_mandelbrot_title(),
      to: '/labs/mandelbrot',
      tone: c.mandelbrot,
    },
    {
      description: m.labs_tool_dominant_color_desc(),
      id: 'dominant-color',
      runtime: m.labs_runtime_edge(),
      title: m.labs_tool_dominant_color_title(),
      to: '/labs/dominant-color',
      tone: c.dominantColor,
    },
    {
      description: m.labs_tool_image_optimize_desc(),
      id: 'image-optimize',
      runtime: m.labs_runtime_edge(),
      title: m.labs_tool_image_optimize_title(),
      to: '/labs/image-optimize',
      tone: c.imageOptimize,
    },
  ] satisfies {
    description: string;
    id: ToolId;
    runtime: string;
    title: string;
    to: string;
    tone: string;
  }[];
}

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: m.meta_labs_title(),
    },
    {
      content: m.meta_labs_desc(),
      name: 'description',
    },
  ];
}

export const links: Route.LinksFunction = () => [
  {
    as: 'image',
    href: '/assets/labs-expressive.svg',
    rel: 'preload',
    type: 'image/svg+xml',
  },
];

export default function Labs(): JSX.Element {
  const mainId = useId();
  const toolId = useId();

  return (
    <div className={`${c.layout} ${chrome.interactiveScope}`}>
      <SkipToContent mainId={mainId} />
      <aside className={chrome.sidebar}>
        <SiteBrand />
        <SiteNavigation activePath="/labs" />
      </aside>
      <div className={c.workspace}>
        <LabsHeader />
        <main
          className={c.page}
          id={mainId}
          tabIndex={-1}
        >
          <div
            aria-hidden="true"
            className={c.artwork}
          />
          <div className={c.content}>
            <header className={c.intro}>
              <h1 className={c.title}>{m.labs_title_accent()}</h1>
              <p className={c.lead}>{m.labs_hero_lead()}</p>
              <p className={c.body}>{m.labs_hero_body()}</p>
            </header>
            <div className={c.tools}>
              {getTools().map(tool => {
                const titleId = `${toolId}-${tool.id}-title`;
                const descriptionId = `${toolId}-${tool.id}-description`;
                const runtimeId = `${toolId}-${tool.id}-runtime`;
                return (
                  <article
                    className={c.tool}
                    key={tool.id}
                  >
                    <Link
                      className={`${c.toolLink} ${tool.tone}`}
                      to={tool.to}
                    >
                      <div className={c.toolCopy}>
                        <h2
                          className={c.toolTitle}
                          id={titleId}
                        >
                          {tool.title}
                        </h2>
                        <p
                          className={c.toolDescription}
                          id={descriptionId}
                        >
                          {tool.description}
                        </p>
                      </div>
                      <ToolPreview id={tool.id} />
                      <div className={c.toolFooter}>
                        <span
                          className={c.runtime}
                          id={runtimeId}
                        >
                          {tool.runtime}
                        </span>
                        <span className={c.action}>
                          {m.labs_open_tool()}
                          <span
                            aria-hidden="true"
                            className={c.actionIcon}
                          >
                            <IconArrowRight />
                          </span>
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </main>
        <LabsFooter />
      </div>
    </div>
  );
}

function ToolPreview({ id }: { id: ToolId }): JSX.Element {
  if (id === 'dominant-color') {
    return (
      <div className={`${c.media} ${c.palettePreview}`}>
        <img
          alt=""
          className={c.previewImage}
          height={256}
          src="/assets/labs-landscape.jpg"
          width={256}
        />
        <div className={c.paletteResult}>
          <span className={c.colorSwatch} />
          <span>#38596F</span>
        </div>
      </div>
    );
  }
  return (
    <div className={c.media}>
      <img
        alt=""
        className={c.previewImage}
        height={id === 'mandelbrot' ? 400 : 256}
        src={
          id === 'mandelbrot' ? '/assets/labs-mandelbrot-preview.png' : '/assets/labs-landscape.jpg'
        }
        width={id === 'mandelbrot' ? 640 : 256}
      />
    </div>
  );
}

function LabsFooter() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerInner}>
        <PoweredByTools />
      </div>
    </footer>
  );
}

function LabsHeader() {
  return (
    <header className={chrome.header}>
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
              label: m.route_labs_title(),
            },
          ]}
        />
      </div>
      <PagePreferences activePath="/labs" />
    </header>
  );
}
