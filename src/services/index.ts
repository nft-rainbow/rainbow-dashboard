import { SERVICE_HOST } from "../config";
import axios from 'axios';

export interface APIResponse {
  code: number;
  message?: string;
  data?: any;
}

export interface UserInfo {
  id?: number;
  email: string;
  jwtToken: string;
  tokenExpire: Date;
}

export function methodUrl(method: string) {
  return `${SERVICE_HOST}${method}`;
}

export function authHeader() {
  let user = localStorage.getItem("session_user");
  if (!user) {
    throw new Error('User not logined');
  }
  let userMeta = JSON.parse(user) as UserInfo;
  return {
    Authorization: `Bearer ${userMeta.jwtToken}`
  }
}

export async function get(url: string, query = {}) {
  const { data } = await axios.get(methodUrl(url), {
    headers: authHeader(),
    params: query
  });
  return data;
}

export async function post(url: string, body = {}) {
  const { data } = await axios.post(methodUrl(url), body, {
    headers: authHeader()
  });
  return data;
}