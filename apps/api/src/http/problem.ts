import type { Response } from 'express';

/** Error body in the RFC 9457 "problem details" format. */
export interface Problem {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  [extension: string]: unknown;
}

export function sendProblem(res: Response, problem: Problem): void {
  res
    .status(problem.status)
    .type('application/problem+json')
    .json({ type: 'about:blank', ...problem });
}
