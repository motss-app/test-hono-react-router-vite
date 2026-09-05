import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft } from '../icons.ts';
import * as m from '../paraglide/messages.js';
import { iconStyles } from '../styles/icon.css.ts';
import type { Route } from './+types/labs.ts';
import * as c from './labs.css.ts';

interface LabTool {
  description: string;
  number: string;
  title: string;
  to: string;
}

// Must be a function because m.*() calls resolve locale at call time, so they
// cannot live at module scope where Paraglide locale isn't set yet.
function getTools(): LabTool[] {
  return [
    {
      description: m.labs_tool_mandelbrot_desc(),
      number: '01',
      title: m.labs_tool_mandelbrot_title(),
      to: '/labs/mandelbrot',
    },
    {
      description:
        'Upload an image and let Rust at the edge find its dominant color in modern color spaces.',
      number: '02',
      title: 'Dominant Color',
      to: '/labs/dominant-color',
    },
  ];
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

export default function Labs(): JSX.Element {
  const tools = getTools();

  return (
    <main className={c.page}>
      <section className={c.hero}>
        <div className={c.heroInner}>
          <div className={c.heroCopy}>
            <Text
              as="h1"
              className={c.title}
            >
              {m.labs_title()}
              <span className={c.titleAccent}>{m.labs_title_accent()}</span>
            </Text>

            <Text
              as="p"
              className={c.heroLead}
            >
              {m.labs_hero_lead()}
            </Text>

            <p className={c.heroBody}>{m.labs_hero_body()}</p>

            <div className={c.heroActions}>
              <Link
                className={c.ctaSecondary}
                to="/"
              >
                <IconArrowLeft className={iconStyles.base} />
                <span>{m.labs_cta_back_home()}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={c.labInner}>
          <Text
            as="h2"
            className={c.sectionTitle}
          >
            {m.labs_section_title()}
          </Text>
          <p className={c.sectionIntro}>{m.labs_section_intro()}</p>

          <div className={c.toolList}>
            {tools.map(tool => (
              <div
                className={c.toolRow}
                key={tool.to}
              >
                <div className={c.toolPanel}>
                  <span className={c.toolNumber}>{tool.number}</span>

                  <div className={c.toolContent}>
                    <Text
                      as="h3"
                      className={c.toolTitle}
                    >
                      {tool.title}
                    </Text>
                    <p className={c.toolBody}>{tool.description}</p>
                  </div>

                  <Link
                    className={c.toolLink}
                    to={tool.to}
                  >
                    <span>{m.route_open_action()}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className={c.footerNote}>{m.labs_more_note()}</p>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
