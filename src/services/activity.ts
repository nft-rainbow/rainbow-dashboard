import { post } from '.';
import { type CreateActivityData } from '@utils/createActivityHelper';

export const createActivity = async (meta: CreateActivityData) => {
  return await post(`/apps/poap/activity`, meta);
};
