import {Action} from '@ngrx/store';


export const SELECT_CURRENT_PERIOD = 'filter/SELECT_CURRENT_PERIOD';
export const UPDATE_END_TIME = 'filter/UPDATE_END_TIME';


export class SelectCurrentPeriodAction implements Action {
    readonly type = SELECT_CURRENT_PERIOD;

    constructor(public payload: any) {
    }
}

export class UpdateEndTimeAction implements Action {
    readonly type = UPDATE_END_TIME;

    constructor(public payload: any) {
    }
}

export type Actions =
    SelectCurrentPeriodAction
    | UpdateEndTimeAction;
