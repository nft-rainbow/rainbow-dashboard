import axios from 'axios';
import { methodUrl, get, post, authHeaderSync } from '.';

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
  status: number;
}

export interface Company {
  id: number;
  name: string;
  company_no: string;
  company_id_img: string;
  phone: string;
  legal_person_name: string;
  legal_person_id_no: string;
  company_range: string;
  user_id: number;
  status: number;
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
  const { data } = await axios({
    url: methodUrl('/dashboard/refresh_token'),
    method: 'get',
    headers: authHeaderSync()
  });
  return data;
}

export async function userCompany() {
  return await get('/dashboard/users/company');
}

export async function updateUserCompany(metadata: any) {
  return await post('/dashboard/users/company', metadata);
}