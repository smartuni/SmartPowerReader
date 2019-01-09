import * as graph from '../actions/graph';

export interface State {
    isLoading: boolean;
    isLoaded: boolean;
    isUpdating: boolean;
    isUpdated: boolean;
    endTime: number;
}

const initialState: State = {
    isLoading: true,
    isLoaded: false,
    isUpdating: false,
    isUpdated: false,
    endTime: 0,
};


export function reducer(state = initialState, action: graph.Actions): State {

    switch (action.type) {
        case graph.GRAPH_LOADING: {
            return Object.assign({}, state, {
                isLoading: true,
                isLoaded: false
            });
        }

        case graph.GRAPH_LOADED: {
            return Object.assign({}, state, {
                isLoading: false,
                isLoaded: true,
            });
        }

        case graph.GRAPH_UPDATING: {
            return Object.assign({}, state, {
                isUpdating: true,
                isUpdated: false,
            });
        }

        case graph.GRAPH_UPDATED: {
            return Object.assign({}, state, {
                isUpdating: false,
                isUpdated: true,
            });
        }

        case graph.GRAPH_PERIOD: {
            return Object.assign({}, state, {
                endTime: action.payload
            });
        }

        default: {
            return state;
        }
    }
}

export const isLoading = (state: State) => state.isLoading;
export const isLoaded = (state: State) => state.isLoaded;

export const isUpdating = (state: State) => state.isUpdating;
export const isUpdated = (state: State) => state.isUpdated;
export const period = (state: State) =>  state.endTime;


