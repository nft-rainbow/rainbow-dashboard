import { get, post, put } from '.';
import { type CreateActivityData } from '@utils/activityHelper';
import { type MetadataAttribute } from '@utils/assetsFormHelper';

export interface ActivityQuerier {
  activity_id?: string;
  contract_address?: string;
  name?: string;
  page?: number;
  limit?: number;
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
  return await get(`/apps/poap/activity`, Object.assign({}, query));
};

export const updatePoap = async (meta: PoapActivityConfig) => {
  const { activity_id, ...rest } = meta;
  return await put(`/apps/poap/activity/${activity_id}`, { ...rest, activity_id });
};
export const getActivityById = async (activity_id?: string) => (activity_id ? get(`/apps/poap/activity/${activity_id}`) : false);