import { get, post, put, del } from '.';
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
    id?: number;
    name: string;
    image_url: string;
    metadata_attributes: MetadataAttribute[] | [];
    probability?: number;
    deleted?: boolean;
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

export const updateActivity = async (meta: PoapActivityConfig) => {
    const { activity_id, ...rest } = meta;
    return await put(`/apps/poap/activity/${activity_id}/base`, { ...rest, activity_id });
};

export const getActivityById = async (activity_id?: string) => (activity_id ? get(`/apps/poap/activity/${activity_id}`) : false);

export const setActivityNftConfigs = async (activity_code: string, nft_configs: NftConfig[]) => {
    dealNftMetaAttribute(nft_configs);
    // delete removed nft_configs
    const toDelete = nft_configs.filter((nft_config) => nft_config.deleted && nft_config.id);
    for (const item of toDelete) {
        await deleteNftConfigs(item.id as number);
    }

    // create new
    const toCreate = nft_configs.filter((nft_config) => !nft_config.id);
    if (toCreate.length > 0) {
        await createNftConfigs(activity_code, toCreate);
    }

    // update
    const toUpdate = nft_configs.filter((nft_config) => !nft_config.deleted && nft_config.id);
    for (const item of toUpdate) {
        await updateNftConfig(item.id as number, item);
    }
}

export const createNftConfigs = async (activity_code: string, nft_configs: NftConfig[]) => {
    return await post(`/apps/poap/activity/${activity_code}/nftconfigs`, nft_configs);
}

export const deleteNftConfigs = async (nft_config_id: number) => {
    return del(`/apps/poap/activity/nftconfig/${nft_config_id}`);
}

export const updateNftConfig = async (nft_config_id: number, nft_config: NftConfig) => {
    return put(`/apps/poap/activity/nftconfig/${nft_config_id}`, nft_config);
}

function dealNftMetaAttribute(nft_configs: NftConfig[]) {
    for(let i in nft_configs) {
        let item = nft_configs[i];
        for(let j in item.metadata_attributes) {
            let meta = item.metadata_attributes[j];
            if (meta.display_type === 'text') {
                delete nft_configs[i].metadata_attributes[j].display_type;
            }
            // if (meta.display_type === 'date') {
            //     let value = nft_configs[i].metadata_attributes[j].value;
            //     // convert value to timestamp
            // }
        }
    }    
}