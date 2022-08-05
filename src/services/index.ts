import axios from 'axios';
import { SERVICE_HOST } from "../config";
import { userRefreshToken } from "./user";
export type { NFT } from './NFT';
export type { Contract } from './contract';

export const USER_LOCALSTORAGE_KEY = "NFT_RAINBOW_SESSION_USER";

export interface ErrorResponse {
  code: number;
  message?: string;
}

export interface UserInfo {
  id?: number;
  email: string;
  jwtToken: string;
  tokenExpire: Date;
}

export interface ErrorCallback {
  (error: Error | null): void;
}

export function methodUrl(method: string) {
  return `${SERVICE_HOST}${method}`;
}

export async function authHeader() {
  try {
    let userMeta = localStorageUser();
    
    // refresh jwt token
    if (userMeta.tokenExpire.getTime() < new Date().getTime()) {
      const res = await userRefreshToken();
      if (res.code) {
        localStorage.removeItem(USER_LOCALSTORAGE_KEY);
        throw new Error('refresh token failed');
      }
      userMeta.jwtToken = res.token;
      userMeta.tokenExpire = new Date(res.expire);
      localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(userMeta));
    }

    return {
      Authorization: `Bearer ${userMeta.jwtToken}`
    }
  } catch (error) {
    console.log('AuthHeader error: ', error);
    localStorage.removeItem(USER_LOCALSTORAGE_KEY);
    // @ts-ignore
    window.location.reload();
    throw error;
  }
}

export function localStorageUser(): UserInfo {
  let user = tryToGetLocalStorageUser();
  if (!user) {
    throw new Error('User not logined');
  }
  return user;
}

export function tryToGetLocalStorageUser(): UserInfo | null {
  let user = localStorage.getItem(USER_LOCALSTORAGE_KEY);
  if (!user) {
    return null;
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
  if (data.code) {
    throw new Error(data.message);
  }
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