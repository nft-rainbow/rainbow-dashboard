import { ActivityItem, App } from '@models/index';
import dayjs, { Dayjs } from 'dayjs';
interface ResetSwitcherAction {
  type: 'reset';
}

interface SetSwitcherAction {
  type: 'set';
  name: Switcher;
  value: boolean;
}

export interface FormData {
  name: string;
  app_id: number;
  description: string;
  activityDate: Date[];
  activity_picture_url: string;
  amount: string;
  max_mint_count?: number;
  command?: string;
  white_list_infos?: [
    {
      count: number;
      user: string;
    }
  ];
}

export interface CreateActivityData {
  activity_picture_url: string;
  amount: number;
  app_id: number;
  command?: string;
  description: string;
  end_time?: number | null;
  start_time: number;
  max_mint_count: number;
  name: string;
  rainbow_user_id?: number;
  white_list_infos?: [
    {
      count: number;
      user: string;
    }
  ];
}

export const handleFormSwitch = (switchers: Switchers, action: ResetSwitcherAction | SetSwitcherAction) => {
  switch (action.type) {
    case 'set': {
      switchers[action.name!] = action.value!;
      return { ...switchers };
    }
    case 'reset': {
      switchers = defaultSwitchers;
      return { ...switchers };
    }
    default: {
      throw Error('Unknown action: ' + action);
    }
  }
};

export const dateTraslate = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};

export const timestampToDate = (timestamp: number) => {
  if (!timestamp || timestamp < 0) return null;
  const millionTimestamp = timestamp * 1000;
  const timeDate = dayjs(new Date(millionTimestamp));
  return timeDate;
};

export const formDataTranslate = (data: FormData, apps: App[]) => {
  let start_time = null;
  let end_time = null;
  start_time = dateTraslate(new Date(data.activityDate[0]));
  if (data.activityDate[1]) end_time = dateTraslate(new Date(data.activityDate[1]));
  const appIndex = apps.findIndex((app) => app.id === data.app_id);
  return {
    activity_picture_url: data.activity_picture_url,
    amount: parseInt(data.amount ?? '-1'),
    app_id: data.app_id,
    chain_type: apps[appIndex].chain_type,
    description: data.description,
    start_time: start_time,
    end_time: end_time ?? -1,
    max_mint_count: data.max_mint_count ?? -1,
    white_list_infos: data.white_list_infos,
    command: data.command ?? '',
    name: data.name,
    activity_type: 1,
    app_name: apps[appIndex].name,
  };
};

export const updateformDataTranslate = (activity: ActivityItem, data: FormData) => {
  let start_time = null;
  let end_time = null;
  start_time = dateTraslate(new Date(data.activityDate[0]));
  if (data.activityDate[1]) end_time = dateTraslate(new Date(data.activityDate[1]));
  return {
    activity_picture_url: data.activity_picture_url ?? '',
    amount: parseInt(data.amount ?? '-1'),
    app_id: data.app_id,
    activity_id: activity.activity_id ?? '',
    contract_id: activity.contract_id ?? 0,
    chain_type: activity.chain_type,
    description: data.description,
    start_time: start_time,
    end_time: end_time ?? -1,
    max_mint_count: data.max_mint_count ?? -1,
    white_list_infos: data.white_list_infos,
    command: data.command ?? '',
    name: data.name,
    activity_type: 1,
    app_name: activity.app_name,
  };
};

export const defaultSwitchers = {
  dateDisabled: false,
  numberDisabled: false,
  publicLimitDisabled: false,
  passwordDisabled: true,
  whitelistDisabled: true,
  existRelationForbidden: false,
};

type Switcher = keyof typeof defaultSwitchers;
export type Switchers = typeof defaultSwitchers;

export const activityTypeDic = ['单个活动', '盲盒活动', 'POAP活动'];

export const activityTypeTransform = (type: number) => {
  return activityTypeDic[type - 1];
};

export const getActivityUrl = () => {
  const url = new URL(location.href);
  const searchParams = new URLSearchParams(url.search);
  const activity_id = searchParams.get('activity_id');
  return activity_id;
};