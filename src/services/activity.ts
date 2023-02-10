import { post } from '.';
import { type CreateActivityData } from '@utils/createActivityHelper';

export const createActivity = async (meta: CreateActivityData) => {
  // throw new Error('Not implemented');
  // let promise = new Promise((resolve, reject) => {
  //   setTimeout(() => resolve('done!'), 10000);
  // });
  // debugger;
  // await promise;
  // debugger;
  // return;
  return await post(`/apps/poap/activity`, meta);
};
