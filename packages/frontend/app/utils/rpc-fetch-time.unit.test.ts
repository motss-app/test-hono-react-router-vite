import { describe, expect, it } from 'vite-plus/test';

import { getRpcFetchTime } from './rpc-fetch-time.ts';

describe('RPC fetch time', () => {
  it('uses the BFF service duration rather than the gateway total', () => {
    const headers = new Headers({
      'server-timing': 'total;dur=90,bff;dur=12.123456;desc="BFF service binding"',
    });
    expect(getRpcFetchTime(headers, 100)).toBe(12.12346);
  });

  it('keeps a measured zero duration', () => {
    expect(
      getRpcFetchTime(
        new Headers({
          'server-timing': 'bff;dur=0',
        }),
        20
      )
    ).toBe(0);
  });

  it.each([
    null,
    'total;dur=10',
    'bff;dur=NaN',
    'bff;dur=Infinity',
    'bff;dur=-1',
  ])('falls back to browser time for missing or invalid BFF timing: %s', value => {
    const headers = new Headers();
    if (value !== null) headers.set('server-timing', value);
    expect(getRpcFetchTime(headers, 20.123456)).toBe(20.12346);
  });
});
