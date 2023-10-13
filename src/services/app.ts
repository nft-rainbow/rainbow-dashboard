import { get, NFT, post, put } from '.';
import { ChainAccount } from '../models';
import { AppWeb3ServiceMeta } from '../models/App';

export interface File {
    file_name: string;
    file_size: number;
    file_url: string;
    file_type: string;
}


export interface MetadataInfo {
    name: string;
    description: string;
    image: string;
}

// SJR: modify this interface to match the response data
export interface Metadata {
  // metadata: MetadataInfo;
    name: string;
    description: string;
    image: string;
    uri: string;
}

export async function getApps(page?: number, limit?: number) {
    return await get('/dashboard/apps', { page, limit });
}

export async function getAllApps() {
    return await get('/dashboard/apps/all');
}

export async function createApp(metadata: any) {
    return await post('/dashboard/apps', metadata);
}

export async function getAppDetail(id: number | string) {
    return await get(`/dashboard/apps/${id}`);
}

// get web3 service key and urls
export async function getAppWeb3ServiceKey(id: number | string): Promise<AppWeb3ServiceMeta> {
    return await get(`/dashboard/apps/${id}/web3`);
}

export async function updateApp(id: number | string, metadata: any) {
    return await put(`/dashboard/apps/${id}`, metadata);
}

export async function getAppFiles(id: number | string, page?: number, limit?: number) {
    return await get(`/dashboard/apps/${id}/files`, { page, limit });
}

export async function getAppMetadatas(id: number | string, page?: number, limit?: number) {
    return await get(`/dashboard/apps/${id}/metadata`, { page, limit });
}

export async function getAppContracts(id: number | string, page?: number, limit?: number) {
    return await get(`/dashboard/apps/${id}/contracts`, { page, limit });
}

export async function getAppNfts(id: number | string, page?: number, limit?: number) {
    return await get(`/dashboard/apps/${id}/nft`, { page, limit });
}

export async function getAppNftsOfContract(id: number | string, address: string, page?: number, limit?: number) {
    return await get(`/dashboard/apps/${id}/contracts/${address}/nft`, { page, limit });
}

export function batchMint(id:string, arr:any[]) {
    return post(`/dashboard/apps/${id}/nft/batch/by-meta-parts`, arr);
}

/**
 {
    "chain": "",
    "contract_address": "",
    "mint_items": [{
        "amount": 0,
        "metadata_uri": "",
        "mint_to_address": "",
        "token_id": ""
    }]
 }
 */
export function batchMintByMetadataUri(id: string, meta: object) {
    return post(`/dashboard/apps/${id}/nft/batch/by-meta-uri`, meta);
}

export async function easyMintUrl(id: string, options: any) {
    return await post(`/dashboard/apps/${id}/nft`, options);
}

export async function getMintTask(id: string|number) : Promise<NFT> {
    return await get(`/dashboard/mints/${id}`);
}

export async function getAppAccounts(id: number | string): Promise<ChainAccount[]> {
    return await get(`/dashboard/apps/${id}/accounts`);
}

export async function getContractInfo(id: number | string): Promise<any> {
    return await get(`/dashboard/contracts?id=${id}`);
}

/**
    {
        "app_id": 0,
        "chain": "string",
        "contract_address": "string",
        "mint_items": [
            {
                "amount": 0,
                "metadata_uri": "string",
                "mint_to": "string",
                "token_id": "string"
            }
        ],
        "source_type": "string"
    }
 */
export async function batchMintByAddressOrPhone(data: any): Promise<any> {
    return post(`/apps/mints/batch/by-meta-uri`, data);
}