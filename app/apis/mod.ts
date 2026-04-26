import type { ApiAppType as BffApiAppType } from '../../packages/bff/src/api.ts';
import { apiApp as bffApiApp } from '../../packages/bff/src/api.ts';

export const apiApp = bffApiApp;
export type ApiAppType = BffApiAppType;
