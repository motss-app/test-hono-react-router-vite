export interface ErrorScenario {
  code: '401' | '403' | '404' | '500' | '502' | '503' | 'runtime';
  detail: string;
  kind: 'response' | 'runtime';
  label: string;
  status?: 401 | 403 | 404 | 500 | 502 | 503;
  statusText?: string;
  summary: string;
  tone: 'critical' | 'runtime' | 'warning';
}

export const errorScenarios = [
  {
    code: '404',
    detail: 'Throws a 404 `Response` so the route boundary can render a missing-resource state.',
    kind: 'response',
    label: 'Not Found',
    status: 404,
    statusText: 'Not Found',
    summary: 'Use this when a path or resource should report that it does not exist.',
    tone: 'warning',
  },
  {
    code: '401',
    detail:
      'Simulates a protected route where credentials are required before the request can continue.',
    kind: 'response',
    label: 'Unauthorized',
    status: 401,
    statusText: 'Unauthorized',
    summary: 'A request was understood, but the user is not authenticated.',
    tone: 'warning',
  },
  {
    code: '403',
    detail:
      'Shows the difference between being unauthenticated and being blocked after authentication.',
    kind: 'response',
    label: 'Forbidden',
    status: 403,
    statusText: 'Forbidden',
    summary: 'The request is known, but the current actor is not allowed to proceed.',
    tone: 'warning',
  },
  {
    code: '500',
    detail: 'Models an internal server failure where the route cannot produce a normal response.',
    kind: 'response',
    label: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
    summary: 'A generic server-side failure became an HTTP error response.',
    tone: 'critical',
  },
  {
    code: '502',
    detail: 'Represents an upstream dependency that answered incorrectly or with unusable data.',
    kind: 'response',
    label: 'Bad Gateway',
    status: 502,
    statusText: 'Bad Gateway',
    summary: 'The app responded, but one dependency upstream failed first.',
    tone: 'critical',
  },
  {
    code: '503',
    detail:
      'Useful for downtime and maintenance states where the route should advertise temporary unavailability.',
    kind: 'response',
    label: 'Service Unavailable',
    status: 503,
    statusText: 'Service Unavailable',
    summary: 'The service is alive enough to answer, but not ready to fulfill the request.',
    tone: 'critical',
  },
  {
    code: 'runtime',
    detail:
      'Throws a normal JavaScript error instead of a `Response`, which lets you compare the two failure shapes. The server-side log keeps the current `app.session_id` so you can match it to the browser issue.',
    kind: 'runtime',
    label: 'Runtime Error',
    summary: 'A runtime exception escaped the route logic and was caught by the route boundary.',
    tone: 'runtime',
  },
] as const satisfies readonly ErrorScenario[];

const errorScenarioMap = new Map(
  errorScenarios.map(scenario => [
    scenario.code,
    scenario,
  ])
);

export function getErrorScenario(code: string | undefined): ErrorScenario | undefined {
  if (!code) {
    return;
  }

  return errorScenarioMap.get(code as ErrorScenario['code']);
}

export function getErrorScenarioByStatus(status: number | undefined): ErrorScenario | undefined {
  if (status === undefined) {
    return;
  }

  return errorScenarios.find(
    scenario => scenario.kind === 'response' && scenario.status === status
  );
}
