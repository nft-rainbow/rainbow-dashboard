interface ResetSwitcherAction {
  type: 'reset';
}

interface SetSwitcherAction {
  type: 'set';
  name: Switcher;
  value: boolean;
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
