import { get, post, put } from '.';
import { type CreateActivityData } from '@utils/activityHelper';

export interface ActivityQuerier {
  activity_id?: string;
  contract_address?: string;
  name?: string;
  page?: number;
  limit?: number;
}
export const createActivity = async (meta: CreateActivityData) => {
  return await post(`/apps/poap/activity`, meta);
};

export const getActivities = async (query: ActivityQuerier) => {
  return await get(`/apps/poap/activity`, Object.assign({}, query));
};

export const updatePoap = async (acitvity_id: string, meta: object) => {
  return await put(`/apps/poap/activity/${acitvity_id}`, meta);
};
export const getActivityById = async (activity_id?: string) => (activity_id ? await get(`/apps/poap/activity/${activity_id}`) : false);
