import axios from 'axios';
import { methodUrl } from '.';

export interface UserInfo {
  id?: number;
  email: string;
  jwtToken: string;
  tokenExpire: Date;
}

export interface LoginMeta {
  email: string;
  password: string;
}

export async function userRegister (metadata: LoginMeta) {
  const { data } = await axios.post(methodUrl('/dashboard/register'), metadata);
  return data;
}

export async function userLogin (metadata: LoginMeta) {
  const { data } = await axios.post(methodUrl('/dashboard/login'), metadata);
  return data;
}

export async function userLogout () {
  const jwtToken = ''; // TODO
  const { data } = await axios({
    url: methodUrl('/dashboard/logout'),
    method: 'post',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    }
  });
  return data;
}

export async function userRefreshToken () {
  const jwtToken = '';  // TODO
  const { data } = await axios({
    method: 'get',
    url: methodUrl('/dashboard/refresh_token'),
    headers: {
      Authorization: `Bearer ${jwtToken}`
    }
  });
  return data;
}