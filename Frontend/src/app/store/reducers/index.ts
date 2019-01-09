import {ActionReducer, ActionReducerMap, combineReducers, createSelector, MetaReducer} from '@ngrx/store';
import {environment} from 'environments/environment';

import * as fromSensors from './sensors';
import * as fromHeader from './header';
import * as fromFilter from './filter';
import * as fromGraph from './graph';

// import * as fromRouter from './router';


export interface State {
    sensors: fromSensors.State;
    header: fromHeader.State;
    filter: fromFilter.State;
    graph: fromGraph.State;
}

export const reducers: ActionReducerMap<State> = {
    sensors: fromSensors.reducer,
    header: fromHeader.reducer,
    filter: fromFilter.reducer,
    graph: fromGraph.reducer,
};


export function logger(reduce: ActionReducer<State>): ActionReducer<State> {
    return (state: State, action: any): any => {
        const result = reduce(state, action);
        console.groupCollapsed(action.type);
        console.log('prev state', state);
        console.log('action', action);
        console.log('next state', result);
        console.groupEnd();

        return result;
    };
}

// const developmentReducer: ActionReducer<State> = compose(storeFreeze, combineReducers)(reducers);
export const productionReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
//   if (environment.production) {
    return productionReducer(state, action);
//   } else {
//     return developmentReducer(state, action);
//   }
}

export const getSensorsState = (state: State) => state.sensors;
export const getHeaderState = (state: State) => state.header;
export const getFilterState = (state: State) => state.filter;
export const getGraphState = (state: State) => state.graph;


export const getSelectedSensors = createSelector(getSensorsState, fromSensors.getSelectedSensors);
export const getSensors = createSelector(getSensorsState, fromSensors.getSensors);

export const getAutoUpdate = createSelector(getHeaderState, fromHeader.getAutoUpdate);

export const isCurrentTime = createSelector(getFilterState, fromFilter.isCurrent);

export const isLoadedGraph = createSelector(getGraphState, fromGraph.isLoaded);
export const isLoadingGraph = createSelector(getGraphState, fromGraph.isLoading);
export const isUpdatingGraph = createSelector(getGraphState, fromGraph.isUpdating);
export const isUpdatedGraph = createSelector(getGraphState, fromGraph.isUpdated);
export const period = createSelector(getGraphState, fromGraph.period);


// export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
export const metaReducers: MetaReducer<State>[] = !environment.production
    ? []
    : [];
