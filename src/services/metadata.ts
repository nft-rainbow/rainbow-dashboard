import { get, post } from '.';
import { Metadata } from '../models';

interface MetadataListWithCount {
    count: number;
    items: Metadata[];
}

export async function getMedtadataList(page = 1, limit = 10): Promise<MetadataListWithCount> {
    return await get(`/dashboard/metadata`, {page, limit});
}

export async function createMetadata(id: number | string, meta: object) {
    return await post(`/dashboard/apps/${id}/metadata`, meta);   
}
