import axios from 'axios';
import { methodUrl, get, post } from '.';

export interface LoginMeta {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  id_name: string;
  id_no: string;
  id_image: string;
}

export async function userRegister (metadata: LoginMeta) {
  const { data } = await axios.post(methodUrl('/dashboard/register'), metadata);
  return data;
}

export async function userLogin (metadata: LoginMeta) {
  const { data } = await axios.post(methodUrl('/dashboard/login'), metadata);
  return data;
}

export async function userProfile() {
  return await get('/dashboard/users/profile');
}

export async function updateUserProfile(metadata: any) {
  return await post('/dashboard/users/profile', metadata);
}

export async function updateUserKyc(metadata: any) {
  return await post('/dashboard/users/kyc', metadata);
}

export async function userLogout () {
  return await post('/dashboard/logout');
}

export async function userRefreshToken () {
  return await get('/dashboard/refresh_token');
}