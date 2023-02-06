import { post } from '.';
import { type CreateActivityData } from '@utils/createActivityHelper';
interface CreateActivityMeta extends CreateActivityData {
  app_id: number;
  id: number;
}
export const createActivity = async (meta: CreateActivityMeta) => {
  return await post(`/apps/poap/activity`, meta);
};
