import * as filter from '../actions/filter';

export interface State {
    isCurrent: boolean;
    endTime: number[];
}

const initialState: State = {
    isCurrent: false,
    endTime: []
};


export function reducer(state = initialState, action: filter.Actions): State {

    switch (action.type) {
        case filter.SELECT_CURRENT_PERIOD: {
            return Object.assign({}, state, {
                isCurrent: action.payload,
            });
        }
        case filter.UPDATE_END_TIME: {
            return Object.assign({}, state, {
                endTime: action.payload,
            });
        }

        default: {
            return state;
        }
    }
}

export const isCurrent = (state: State) => state.isCurrent;


