import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';
import * as actions from './actions';
import { ClarityDescription } from './descriptionInterface';

export type ClarityAction = ActionType<typeof actions>;

export interface ClarityState {
  /**
   * Descriptions from cumunity provided by Clarity API
   */
  descriptions?: ClarityDescription;
  toggleDescriptions?: boolean;
  // I will add more things i need for clarity later on
}

export const fetchClarityDescriptions_ = async () => {
  const data = await fetch('https://ice-mourne.github.io/database-clarity/descriptions.json');
  const json: ClarityDescription = await data.json();
  return json;
};

const initialState: ClarityState = {};
export const clarity: Reducer<ClarityState, ClarityAction> = (
  state: ClarityState = initialState,
  action: ClarityAction
) => {
  switch (action.type) {
    case getType(actions.fetchClarityDescriptions):
      return {
        ...state,
        descriptions: action.payload,
      };
    case getType(actions.toggleDescriptions):
      return {
        ...state,
        toggleDescriptions: !state.toggleDescriptions,
      };

    default:
      return state;
  }
};
