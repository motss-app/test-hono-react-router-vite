import { Select } from '@base-ui/react/select';
import { useCallback } from 'react';

import { labels, locales } from '../../locales.ts';
import type { Locale } from '../paraglide/runtime.js';
import { deLocalizeHref, getLocale, localizeHref } from '../paraglide/runtime.js';

const LOCALES = locales.map(value => ({
  label: labels[value] ?? value,
  value,
}));

function CaretUpDownIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      className="locale-switcher-icon"
      fill="currentColor"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      {...props}
    >
      <path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
    </svg>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      className="locale-switcher-icon"
      fill="none"
      height="14"
      stroke="currentColor"
      viewBox="0 0 14 14"
      width="14"
      {...props}
    >
      <path d="m2.5 7.5 3 3 6-7" />
    </svg>
  );
}

export function LocaleSwitcherInner() {
  const currentLocale = getLocale();
  const handleLocaleChange = useCallback((value: string | null) => {
    if (value) {
      // De-localize current path, then localize for the new locale
      const path = deLocalizeHref(globalThis.location.pathname);
      const localized = localizeHref(path, {
        locale: value as Locale,
      });
      // Strip trailing slash — localizeUrlDefaultPattern produces /ja-JP/
      // on root paths; strip the trailing slash
      globalThis.location.assign(localized.replace(/\/+$/, '') || '/');
    }
  }, []);

  return (
    <Select.Root
      defaultValue={currentLocale}
      items={LOCALES}
      onValueChange={handleLocaleChange}
    >
      <Select.Trigger
        aria-label="Select locale"
        className="locale-switcher-trigger"
      >
        <Select.Value />
        <Select.Icon>
          <CaretUpDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4}>
          <Select.Popup className="locale-switcher-popup">
            <Select.List>
              {LOCALES.map(locale => (
                <Select.Item
                  className="locale-switcher-item"
                  key={locale.value}
                  value={locale.value}
                >
                  <Select.ItemText>{locale.label}</Select.ItemText>
                  <Select.ItemIndicator className="locale-switcher-check">
                    <CheckIcon />
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
