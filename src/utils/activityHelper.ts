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
  app_id: string;
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
  app_id: string;
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

export const formDataTranslate = (data: FormData) => {
  let start_time = null;
  let end_time = null;
  start_time = dateTraslate(new Date(data.activityDate[0]));
  if (data.activityDate[1]) end_time = dateTraslate(new Date(data.activityDate[1]));
  //TODO: activiti_type is hardcoded
  return {
    activity_picture_url: data.activity_picture_url,
    amount: parseInt(data.amount ?? '-1'),
    app_id: data.app_id,
    description: data.description,
    start_time: start_time,
    end_time: end_time ?? -1,
    max_mint_count: data.max_mint_count ?? -1,
    white_list_infos: data.white_list_infos,
    command: data.command ?? '',
    name: data.name,
    activity_type: 'single',
  };
};

export const defaultSwitchers = {
  dateDisabled: false,
  numberDisabled: false,
  publicLimitDisabled: false,
  privateLimitDisabled: false,
  passwordDisabled: true,
  whitelistDisabled: true,
  existRelationForbidden: false,
};

type Switcher = keyof typeof defaultSwitchers;
type Switchers = typeof defaultSwitchers;

export const activityTypeDic = {
  single: '单个活动',
  bind: '盲盒活动',
  poap: 'POAP活动',
};

export const activityTypeTransform = (type: 'single' | 'bind' | 'poap') => {
  return activityTypeDic[type];
};
