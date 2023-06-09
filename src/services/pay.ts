import { get, post, put } from '.';

export async function createWxPayOrder (metadata: any) {
    return await post('/dashboard/pay/wxOrder', metadata);
}

export async function getWxPayOrderDetail(id: number) {
    return await get(`/dashboard/pay/wxOrder/${id}`);
}

export async function getCmbCardNo() {
    return await get('/dashboard/users/cmbDepositNo');
}

export async function createCmbCardNo(name: string, card_no: string, bank: string) {
    return await post('/dashboard/users/cmbDepositNo', {name, card_no, bank});
}

export async function updateCmbCardRelation(name: string, card_no: string, bank: string) {
    return await put('/dashboard/users/cmbDepositNo', {name, card_no, bank});
}

export async function getCmbDeposits() {
    return await get('/dashboard/users/cmbRecentDeposits');
}