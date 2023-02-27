import { post, get } from '.';
import { BaseModel } from '../models/';

export interface Poap extends BaseModel {
    user_id: number;
    app_id: number;
    contract_id: number;
    contract: string;
    title: string;
    intro: string;
    image_uri: string;
    meta_uri: string;
    next_id: number;
  }

export async function createPoap(id: number | string, meta: object) {
    return await post(`/dashboard/apps/${id}/poaps`, meta);
}

export async function listPoaps(id: number | string, page?: number, limit?: number) {
    return await get(`/dashboard/apps/${id}/poaps`, {page, limit});
}