import { post, get } from '.';

export interface ContractFilter {
    app_id?: number;
}

export async function deployContract(id: number | string, meta: object) {
    return await post(`/dashboard/apps/${id}/contracts`, meta);   
}

export async function listContracts(page = 1, limit = 10, filter: ContractFilter = {}) {
    return await get(`/dashboard//contracts`, Object.assign({}, {page, limit}, filter));
}