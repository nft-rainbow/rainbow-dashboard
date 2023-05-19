import { get, post, put } from '.';
import { type CreateActivityData } from '@utils/activityHelper';
import { type MetadataAttribute } from '@utils/assetsFormHelper';

export interface ActivityQuerier {
    activity_id?: string;
    contract_address?: string;
    name?: string;
    page?: number;
    limit?: number;
    exclude_no_contract?: boolean;
    activity_status?: number[];  // 1 - not start 2 - in progress 3 - ended
}

export interface NftConfig {
    name: string;
    image_url: string;
    metadata_attributes: MetadataAttribute[] | [];
}

export interface PoapActivityConfig extends CreateActivityData {
    activity_id: string;
    contract_id?: number;
    nft_configs?: NftConfig[];
}

export const createActivity = async (meta: CreateActivityData) => {
    return await post(`/apps/poap/activity`, meta);
};

export const getActivities = async (query: ActivityQuerier) => {
    let url = `/apps/poap/activity?page=${query.page || 1}&limit=${query.limit || 10}`;
    if (query.exclude_no_contract) url += '&exclude_no_contract=true';
    if (query.activity_id) url += `&activity_id=${query.activity_id}`;
    if (query.contract_address) url += `&contract_address=${query.contract_address}`;
    if (query.activity_status && query.activity_status.length > 0) {
        url += `&${query.activity_status.map(status => `activity_status=${status}`).join('&')}`;
    }
    return await get(url);
};

export const updatePoap = async (meta: PoapActivityConfig) => {
    const { activity_id, ...rest } = meta;
    return await put(`/apps/poap/activity/${activity_id}`, { ...rest, activity_id });
};

export const getActivityById = async (activity_id?: string) => (activity_id ? get(`/apps/poap/activity/${activity_id}`) : false);
