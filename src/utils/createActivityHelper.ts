interface FormSwitcherState {
  [key: string]: boolean;
}

interface SwitcherAction {
  type: string;
  name?: string;
  value?: boolean;
}

export const handleFormSwitch = (switchers: FormSwitcherState, action: SwitcherAction) => {
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
      throw Error('Unknown action: ' + action.type);
    }
  }
};

export const defaultSwitchers: FormSwitcherState = {
  dateDisabled: false,
  numberDisabled: false,
  publicLimitDisabled: false,
  privateLimitDisabled: false,
  whitelistDisabled: true,
  existRelationForbidden: false,
};
