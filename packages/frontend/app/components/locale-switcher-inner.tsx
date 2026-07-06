import { Select } from '@base-ui/react/select';
import { useCallback } from 'react';

import { getLocale, type Locale, setLocale } from '../paraglide/runtime.js';

const LOCALES: {
  value: Locale;
  label: string;
}[] = [
  {
    label: 'English (US)',
    value: 'en-US',
  },
  {
    label: '日本語',
    value: 'ja-JP',
  },
];

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
    if (value) setLocale(value as Locale);
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
