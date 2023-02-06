interface ResetSwitcherAction {
  type: 'reset';
}

interface SetSwitcherAction {
  type: 'set';
  name: Switcher;
  value: boolean;
}

export interface FormData {
  chain_id: number;
  name: string;
  description: string;
  activityDate: Date[];
  activity_picture_url: string;
  account: number;
  max_mint_count?: number;
  command?: string;
  white_list_infos?: [
    {
      count: number;
      user: string;
    }
  ];
}

//TODO: to be edited after backend API is updated
export interface CreateActivityData {
  activity_picture_url: string;
  amount: number;
  app_id: number;
  chain_type?: number;
  chain_id: number;
  command?: string;
  description: string;
  end_time?: number | null;
  start_time: number;
  id: number;
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

export const formDataTranslate = (data: FormData, app_id: number, id: number) => {
  let start_time = null;
  let end_time = null;
  start_time = dateTraslate(new Date(data.activityDate[0]));
  if (data.activityDate[1]) end_time = dateTraslate(new Date(data.activityDate[1]));
  return {
    activity_picture_url: data.activity_picture_url,
    amount: data.account,
    app_id: app_id,
    chain_id: data.chain_id,
    description: data.description,
    start_time: start_time,
    end_time: end_time ?? -1,
    id: id,
    max_mint_count: data.max_mint_count ?? -1,
    name: data.name,
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
