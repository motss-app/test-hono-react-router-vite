import { Select } from '@base-ui/react/select';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as m from '../paraglide/messages.js';
import { IconCheck, IconDesktop, IconMoon, IconSun } from './expressive.icons.ts';
import * as shell from './expressive-page-shell.css.ts';
import * as s from './theme-selector.css.ts';

type ThemePreference = 'light' | 'dark' | 'system';

function readPreference(): ThemePreference {
  const match = document.cookie.match(/(?:^|;\s*)theme=(light|dark|system)(?:;|$)/);
  return match ? (match[1] as ThemePreference) : 'system';
}

export function ThemeSelector() {
  const popupContainer = useRef<HTMLElement | null>(null);
  const setTriggerRef = useCallback((element: HTMLButtonElement | null) => {
    popupContainer.current = element?.closest<HTMLElement>('header, footer, main, aside') ?? null;
  }, []);
  const [preference, setPreference] = useState<ThemePreference | null>(null);
  const options = [
    {
      Icon: IconSun,
      label: m.home_theme_light(),
      value: 'light',
    },
    {
      Icon: IconMoon,
      label: m.home_theme_dark(),
      value: 'dark',
    },
    {
      Icon: IconDesktop,
      label: m.home_theme_system(),
      value: 'system',
    },
  ] as const;
  const selected = options.find(option => option.value === preference) ?? options[2];

  useEffect(() => {
    setPreference(readPreference());
  }, []);

  const changePreference = useCallback((value: ThemePreference | null) => {
    if (value === null) return;
    const theme =
      value === 'system'
        ? globalThis.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : value;
    document.documentElement.dataset.theme = theme;
    /*
     * biome-ignore lint/suspicious/noDocumentCookie: SSR cookie.
     * Store the preference so system mode survives changes and reloads.
     */
    document.cookie = `theme=${value}; Path=/; Max-Age=31536000; SameSite=Lax${globalThis.location.protocol === 'https:' ? '; Secure' : ''}`;
    setPreference(value);
  }, []);

  return (
    <Select.Root
      items={options}
      onValueChange={changePreference}
      value={preference}
    >
      <Select.Trigger
        aria-label={m.home_color_scheme()}
        className={shell.iconButton}
        disabled={preference === null}
        ref={setTriggerRef}
        title={`${m.home_color_scheme()}: ${selected.label}`}
      >
        <Select.Value className={s.visuallyHidden} />
        <selected.Icon aria-hidden="true" />
      </Select.Trigger>
      <Select.Portal
        className={s.portal}
        container={popupContainer}
      >
        <Select.Positioner
          align="end"
          alignItemWithTrigger={false}
          className={s.positioner}
          sideOffset={8}
        >
          <Select.Popup
            aria-label={m.home_color_scheme()}
            className={s.popup}
          >
            <Select.List className={s.list}>
              {options.map(({ value, label, Icon }) => (
                <Select.Item
                  className={s.item}
                  key={value}
                  value={value}
                >
                  <Icon
                    aria-hidden="true"
                    className={s.optionIcon}
                  />
                  <Select.ItemText>{label}</Select.ItemText>
                  <Select.ItemIndicator className={s.indicator}>
                    <IconCheck
                      aria-hidden="true"
                      className={s.optionIcon}
                    />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
