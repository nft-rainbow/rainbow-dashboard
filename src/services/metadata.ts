import { get, post } from '.';
import { Metadata } from '../models';

interface MetadataListWithCount {
    count: number;
    items: Metadata[];
}

export async function getMedtadataList(page = 1, limit = 10, filter: {app_id?: number, search?: string}): Promise<MetadataListWithCount> {
    return await get(`/dashboard/metadata`, Object.assign({page, limit}, filter));
}

export async function createMetadata(id: number | string, meta: object) {
    return await post(`/dashboard/apps/${id}/metadata`, meta);   
}
