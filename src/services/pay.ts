import { get, post } from '.';

export async function createWxPayOrder (metadata: any) {
    return await post('/dashboard/pay/wxOrder', metadata);
}

export async function getWxPayOrderDetail(id: number) {
    return await get(`/dashboard/pay/wxOrder/${id}`);
}