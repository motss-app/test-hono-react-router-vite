import type { JSX } from 'react';

// Bundle-size baseline update trigger — runtime reference so bundler keeps it.
const BUNDLE_TRIGGER = `route-bundle-size-baseline-test-${Date.now()}`;
void BUNDLE_TRIGGER;

import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import { Text } from '../components/text.tsx';
import {
  IconArrowLeft,
  IconBolt,
  IconGears,
  IconMobile,
  IconServer,
  IconShield,
} from '../icons.ts';
import * as m from '../paraglide/messages.js';
import { iconStyles } from '../styles/icon.css.ts';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import type { Route } from './+types/about.ts';
import { s } from './about.css.ts';

// Must be functions — m.*() calls resolve locale at call time, so they
// cannot live at module scope where Paraglide's locale isn't set yet.
function getStackSections() {
  return [
    {
      description: m.about_stack_frontend_desc(),
      icon: IconGears,
      iconStyle: s.rowIconBlue,
      items: [
        m.about_stack_frontend_item_1(),
        m.about_stack_frontend_item_2(),
        m.about_stack_frontend_item_3(),
        m.about_stack_frontend_item_4(),
      ],
      number: '01',
      title: m.about_stack_frontend_title(),
    },
    {
      description: m.about_stack_runtime_desc(),
      icon: IconServer,
      iconStyle: s.rowIconGreen,
      items: [
        m.about_stack_runtime_item_1(),
        m.about_stack_runtime_item_2(),
        m.about_stack_runtime_item_3(),
        m.about_stack_runtime_item_4(),
      ],
      number: '02',
      title: m.about_stack_runtime_title(),
    },
  ];
}

function getFeatures() {
  return [
    {
      description: m.about_feature_fast_dev_desc(),
      icon: IconBolt,
      iconStyle: s.featureIconAmber,
      number: '03',
      title: m.about_feature_fast_dev_title(),
    },
    {
      description: m.about_feature_type_safety_desc(),
      icon: IconShield,
      iconStyle: s.featureIconBlue,
      number: '04',
      title: m.about_feature_type_safety_title(),
    },
    {
      description: m.about_feature_responsive_desc(),
      icon: IconMobile,
      iconStyle: s.featureIconGreen,
      number: '05',
      title: m.about_feature_responsive_title(),
    },
  ];
}

function getNextRoutes() {
  return [
    {
      description: m.about_next_ssr_desc(),
      number: '06',
      path: '/ssr',
      title: m.about_next_ssr_title(),
      to: '/ssr',
    },
    {
      description: m.about_next_hono_rpc_desc(),
      number: '07',
      path: '/hono-rpc',
      title: m.about_next_hono_rpc_title(),
      to: '/hono-rpc',
    },
    {
      description: m.about_next_errors_desc(),
      number: '08',
      path: '/errors',
      title: m.about_next_errors_title(),
      to: '/errors',
    },
  ];
}

export const links: Route.LinksFunction = () =>
  createBackgroundSvgPreloadLinks([
    '/assets/about-hero-dark.svg',
    '/assets/about-hero-light.svg',
  ]);

export function meta(_args: Route.MetaArgs): Route.MetaDescriptors {
  return [
    {
      title: m.meta_about_title(),
    },
    {
      content: m.meta_about_desc(),
      name: 'description',
    },
  ];
}

export default function About(): JSX.Element {
  return (
    <main className={s.page}>
      <section className={s.hero}>
        <div
          aria-hidden="true"
          className={s.heroMedia}
        />
        <div
          aria-hidden="true"
          className={s.heroOverlay}
        />

        <div className={s.heroInner}>
          <div className={s.heroCopy}>
            <Text
              as="h1"
              className={s.title}
            >
              {m.about_title()}
              <span className={s.titleAccent}>{m.about_title_accent()}</span>
            </Text>

            <Text
              as="p"
              className={s.heroLead}
            >
              {m.about_hero_lead()}
            </Text>

            <p className={s.heroBody}>{m.about_hero_body()}</p>

            <div className={s.heroActions}>
              <Link
                className={s.ctaSecondary}
                to="/"
              >
                <IconArrowLeft className={iconStyles.base} />
                <span>{m.about_cta_back_home()}</span>
              </Link>
              <Link
                className={s.ctaPrimary}
                to="/hono-rpc"
              >
                {m.about_cta_rpc()}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={s.routesInner}>
          <Text
            as="h2"
            className={s.routesTitle}
          >
            {m.about_stack_title()}
          </Text>

          <p className={s.routesIntro}>{m.about_stack_intro()}</p>

          <div className={s.stackList}>
            {getStackSections().map(section => {
              const Icon = section.icon;

              return (
                <div
                  className={s.rowRow}
                  key={section.title}
                >
                  <div className={s.nextLink}>
                    <span className={s.rowNumber}>{section.number}</span>

                    <div className={s.rowTitleBlock}>
                      <span
                        className={[
                          s.rowIcon,
                          section.iconStyle,
                        ].join(' ')}
                      >
                        <Icon className={`${iconStyles.base} ${s.rowIconSvg}`} />
                      </span>
                      <Text
                        as="h3"
                        className={s.rowTitle}
                      >
                        {section.title}
                      </Text>
                    </div>

                    <p className={s.rowBody}>{section.description}</p>

                    <ul className={s.stackItems}>
                      {section.items.map(item => (
                        <li
                          className={s.stackListItem}
                          key={item}
                        >
                          <span className={s.itemBullet} />
                          <span className={s.itemText}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className={s.routesInner}>
          <Text
            as="h2"
            className={s.routesTitle}
          >
            {m.about_features_title()}
          </Text>

          <p className={s.routesIntro}>{m.about_features_intro()}</p>

          <div className={s.nextList}>
            {getFeatures().map(feature => {
              const Icon = feature.icon;

              return (
                <div
                  className={s.featureRow}
                  key={feature.title}
                >
                  <div className={s.nextLink}>
                    <span className={s.featureNumber}>{feature.number}</span>

                    <div className={s.rowTitleBlock}>
                      <span
                        className={[
                          s.featureIcon,
                          feature.iconStyle,
                        ].join(' ')}
                      >
                        <Icon className={`${iconStyles.base} ${s.featureIconSvg}`} />
                      </span>
                      <Text
                        as="h3"
                        className={s.featureTitle}
                      >
                        {feature.title}
                      </Text>
                    </div>

                    <p className={s.featureBody}>{feature.description}</p>

                    <span className={s.nextAction}>{m.about_built_in()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className={s.routesInner}>
          <Text
            as="h2"
            className={s.routesTitle}
          >
            {m.about_next_title()}
          </Text>

          <p className={s.routesIntro}>{m.about_next_intro()}</p>

          <div className={s.nextList}>
            {getNextRoutes().map(route => (
              <div
                className={s.nextRow}
                key={route.to}
              >
                <Link
                  className={s.nextLink}
                  to={route.to}
                >
                  <span className={s.rowNumber}>{route.number}</span>

                  <div className={s.nextTitleBlock}>
                    <Text
                      as="h3"
                      className={s.nextTitle}
                    >
                      {route.title}
                    </Text>
                    <span className={s.nextPath}>{route.path}</span>
                  </div>

                  <p className={s.rowBody}>{route.description}</p>

                  <span className={s.nextAction}>{m.about_open()}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
