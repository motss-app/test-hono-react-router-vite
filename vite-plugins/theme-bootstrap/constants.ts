import path from 'node:path';

export const DEV_THEME_BOOTSTRAP_REQUEST_PATH = '/~virtual:theme-bootstrap.js';
export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_SERVICE_UNAVAILABLE = 503;
export const RESOLVED_VIRTUAL_THEME_BOOTSTRAP_ID = '\0virtual:theme-bootstrap';
export const THEME_BOOTSTRAP_DEBOUNCE_MS = 100;
export const THEME_BOOTSTRAP_ENTRY_POINT: string = path.resolve(
  'app/critical/theme-bootstrap/bootstrap.ts'
);
export const THEME_BOOTSTRAP_OUT_FILE = 'theme-bootstrap.js';
export const VIRTUAL_THEME_BOOTSTRAP_ID = 'virtual:theme-bootstrap';
