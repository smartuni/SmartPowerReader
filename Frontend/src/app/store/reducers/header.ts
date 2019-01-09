import * as header from '../actions/header';

export interface State {
    autoUpdate: boolean;
}

const initialState: State = {
    autoUpdate: false,
};


export function reducer(state = initialState, action: header.Actions): State {

    switch (action.type) {
        case header.AUTO_UPDATE: {
            return Object.assign({}, state, {
                autoUpdate: action.payload,
            });
        }
        default: {
            return state;
        }
    }
}

export const getAutoUpdate = (state: State) => state.autoUpdate;


