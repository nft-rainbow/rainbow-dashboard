import axios from 'axios';
import { methodUrl, get, post, authHeaderSync } from '.';
import { User, UserBalance } from '../models';

export interface LoginMeta {
    email: string;
    password: string;
}

export interface UserStatistics {
    nft_count: number;
    contract_count: number;
    app_count: number;
    request_count: number;
}

export async function userRegister (metadata: LoginMeta) {
    const { data } = await axios.post(methodUrl('/dashboard/register'), metadata);
    return data;
}

export async function userLogin (metadata: LoginMeta) {
    const { data } = await axios.post(methodUrl('/dashboard/login'), metadata);
    return data;
}

export async function userForgotPassword (metadata: object) {
    const { data } = await axios.post(methodUrl('/dashboard/password/session'), metadata);
    return data;
}

// new_password
export async function userResetPassword (code: string, metadata: object) {
    const { data } = await axios.post(methodUrl(`/dashboard/password/session/${code}`), metadata);
    return data;
}

export async function userProfile(): Promise<User> {
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

export async function userStatistics() {
    return await get('/dashboard/users/statistics');
}

export async function userBalance(): Promise<UserBalance> {
    return await get('/dashboard/users/balance');
}

export async function userFiatLogs(page = 1, limit = 10, filter = {}) {
    return await get('/dashboard/users/fiatLogs', Object.assign({page, limit}, filter));
}

export async function userBalanceRuntime(): Promise<UserBalance> {
    return await get('/dashboard/users/balance/runtime');
}

export async function userMintCountByMonth(): Promise<any> {
    return await get('/dashboard/users/mintCountByMonth')
}