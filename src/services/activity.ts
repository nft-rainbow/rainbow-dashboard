import { get, post } from '.';
import { type CreateActivityData } from '@utils/createActivityHelper';

export interface ActivityFilter {
  activity_id?: number;
  contract_address?: string;
  activity_name?: string;
}
export const createActivity = async (meta: CreateActivityData) => {
  return await post(`/apps/poap/activity`, meta);
};

export const getActivities = async (page = 1, limit = 10, filter: ActivityFilter = {}) => {
  return await get(`/apps/poap/activity`, Object.assign({}, { page, limit }, filter));
};
