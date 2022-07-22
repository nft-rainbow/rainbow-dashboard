import { SERVICE_HOST } from "../config";
import axios from 'axios';
import { userRefreshToken } from "./user";

export const USER_LOCALSTORAGE_KEY = "session_user";

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

export async function authHeader() {
  let userMeta = localStorageUser();
  
  // refresh jwt token
  if (userMeta.tokenExpire.getTime() < new Date().getTime()) {
    const { code, data } = await userRefreshToken();
    if (code !== 0) {
      localStorage.removeItem(USER_LOCALSTORAGE_KEY);
      throw new Error('refresh token failed'); // TODO: when refresh token failed, should logout user
    }
    userMeta.jwtToken = data.token;
    userMeta.tokenExpire = new Date(data.expire);
    localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(userMeta));
  }

  return {
    Authorization: `Bearer ${userMeta.jwtToken}`
  }
}

export function localStorageUser(): UserInfo {
  let user = localStorage.getItem("session_user");
  if (!user) {
    throw new Error('User not logined');
  }
  let userMeta = JSON.parse(user) as UserInfo;
  userMeta.tokenExpire = new Date(userMeta.tokenExpire);
  return userMeta;
}

export function authHeaderSync() {
  let userMeta = localStorageUser();
  return {
    Authorization: `Bearer ${userMeta.jwtToken}`
  }
}

export async function get(url: string, query = {}) {
  const headers = await authHeader();
  const { data } = await axios.get(methodUrl(url), {
    headers,
    params: query
  });
  return data;
}

export async function post(url: string, body = {}) {
  const headers = await authHeader();
  const { data } = await axios.post(methodUrl(url), body, {
    headers
  });
  return data;
}

export async function put(url: string, body = {}) {
  const headers = await authHeader();
  const { data } = await axios.put(methodUrl(url), body, {
    headers
  });
  return data;
}