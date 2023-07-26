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
  certificate_strategy_id?: number;
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
  certificate_strategy_id?: number;
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

export const dateTranslate = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};

export const timestampToDate = (timestamp: number) => {
  if (!timestamp || timestamp < 0) return null;
  const millionTimestamp = timestamp * 1000;
  const timeDate = dayjs(new Date(millionTimestamp));
  return timeDate;
};

export const formDataTranslate = (data: FormData, apps: App[], activityType: number) => {
    let start_time = null;
    let end_time = null;
    start_time = dateTranslate(new Date(data.activityDate[0]));
    if (data.activityDate[1]) end_time = dateTranslate(new Date(data.activityDate[1]));
    const appIndex = apps.findIndex((app) => app.id === data.app_id);
    return {
        // @ts-ignore
        activity_picture_url: data?.file?.[0]?.response?.url ?? data?.file?.[0]?.url ?? '',
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
        activity_type: activityTypeIdToName(activityType),
        app_name: apps[appIndex].name,
        certificate_strategy_id: data.certificate_strategy_id,
    };
};

export const updateFormDataTranslate = (activity: ActivityItem, data: FormData) => {
    let start_time = null;
    let end_time = null;
    start_time = dateTranslate(new Date(data.activityDate[0]));
    if (data.activityDate[1]) end_time = dateTranslate(new Date(data.activityDate[1]));
    return {
        ...activity,
        activity_type: activity.activity_type ?? 1,
        activity_picture_url: data?.file?.[0]?.response?.url ?? data?.file?.[0]?.url ?? '',
        amount: parseInt(data.amount ?? '-1'),
        app_id: data.app_id,
        description: data.description,
        start_time: start_time,
        end_time: end_time ?? -1,
        max_mint_count: data.max_mint_count ?? -1,
        white_list_infos: data.white_list_infos,
        command: data.command ?? '',
        name: data.name,
        certificate_strategy_id: data.certificate_strategy_id || activity.certificate_strategy_id,
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

export const activityTypeDic = {
    'single': "单NFT活动",
    'blind_box': "盲盒活动",
    'gasless': "POAP活动",
}

// ['盲盒活动', '单个活动', 'POAP活动'];
export const activityTypeDicEn = {
    'single': 'single',
    'blind_box': 'blind',
    'poap': 'POAP',
    'gasless': 'POAP',
}

// ['blind', 'single', 'poap'];

export const activityTypeTransform = (type: string) => {
    // @ts-ignore
    return activityTypeDic[type];
};

export const activityTypeIdToName = (type: number) => {
    // @ts-ignore
    return ['blind_box', 'single', 'gasless', 'poap'][type - 1];
};

export const activityTypeTransformEn = (type: string) => {
    // @ts-ignore
    return activityTypeDicEn[type];
};

export const getActivityUrl = () => {
    // @ts-ignore
    const url = new URL((window.location as any).href);
    const searchParams = new URLSearchParams(url.search);
    const activity_id = searchParams.get('activity_id');
    return activity_id;
};
