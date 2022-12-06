import { post, get } from '.';
import { SponsorInfo } from '../models';

export interface ContractFilter {
    app_id?: number;
}

export async function deployContract(id: number | string, meta: object) {
    return await post(`/dashboard/apps/${id}/contracts`, meta);   
}

export async function listContracts(page = 1, limit = 10, filter: ContractFilter = {}) {
    return await get(`/dashboard/contracts`, Object.assign({}, {page, limit}, filter));
}

export async function getContractSponsor(addr: string, chain: string): Promise<SponsorInfo> {
    return await get(`/dashboard/contracts/${addr}/sponsor`, {chain});
}

export async function setContractSponsor(addr: string, options: object) {
    return await post(`/dashboard/contracts/${addr}/sponsor`, options);
}