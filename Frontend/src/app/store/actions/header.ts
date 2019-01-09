import {Action} from '@ngrx/store';


export const AUTO_UPDATE         = 'header/AUTO_UPDATE';


export class AutoUpdateAction implements Action {
    readonly type = AUTO_UPDATE;

    constructor(public payload: any) { }
}
export type Actions = AutoUpdateAction;
