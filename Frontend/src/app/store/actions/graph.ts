import {Action} from '@ngrx/store';


export const GRAPH_LOADED = 'graph/GRAPH_LOADED';
export const GRAPH_LOADING = 'graph/GRAPH_LOADING';
export const GRAPH_UPDATING = 'graph/GRAPH_UPDATING';
export const GRAPH_UPDATED = 'graph/GRAPH_UPDATED';
export const GRAPH_PERIOD   = 'graph/GRAPH_PERIOD';


export class GraphLoadingAction implements Action {
    readonly type = GRAPH_LOADING;

    constructor(public payload?: any) {
    }
}

export class GraphLoadedAction implements Action {
    readonly type = GRAPH_LOADED;

    constructor(public payload?: any) {
    }
}



export class GraphUpdatingAction implements Action {
    readonly type = GRAPH_UPDATING;

    constructor(public payload?: any) {
    }
}

export class GraphUpdatedAction implements Action {
    readonly type = GRAPH_UPDATED;

    constructor(public payload?: any) {
    }
}

export class GraphPeriodAction implements Action {
    readonly type = GRAPH_PERIOD;

    constructor(public payload?: any) {
    }
}

export type Actions =
    GraphLoadingAction
    | GraphLoadedAction
    | GraphUpdatingAction
    | GraphUpdatedAction
    | GraphPeriodAction;
