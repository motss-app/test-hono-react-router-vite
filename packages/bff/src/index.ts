import type { ApiAppType as BffApiAppType } from './api.ts';
import { apiApp as bffApiApp } from './api.ts';

export const apiApp = bffApiApp;
export type ApiAppType = BffApiAppType;
