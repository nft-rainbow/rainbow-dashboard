import { SERVICE_HOST } from "../config";

export interface APIResponse {
  code: number;
  message?: string;
  data?: any;
}

export function methodUrl(method: string) {
  return `${SERVICE_HOST}${method}`;
}