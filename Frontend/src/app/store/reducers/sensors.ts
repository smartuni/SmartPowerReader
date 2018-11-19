import * as sensors from '../actions/sensors';
import {Sensor} from '../../core/interfaces/sensor.interface';

export interface State {
    sensors: Sensor[];
    selectedSensors: Sensor[];
    loading: boolean;
    loaded: boolean;
}

const initialState: State = {
    sensors: [],
    selectedSensors: [],
    loading: false,
    loaded: false,
};


export function reducer(state = initialState, action: sensors.Actions): State {

    switch (action.type) {
        case sensors.SENSORS_LOADING: {
            return Object.assign({}, state, {
                loading: true,
                loaded: false
            });
        }

        case sensors.SENSORS_LOAD_SUCCESS: {
            return Object.assign({}, state, {
                loading: false,
                loaded: true,
                sensors: action.payload,
                selectedSensors: []
            });
        }

        case sensors.SENSORS_LOAD_FAIL: {
            return Object.assign({}, state, {
                loading: false,
                loaded: false,
            });
        }

        case sensors.UPDATE_SENSORS: {
            return Object.assign({}, state, {
                sensors: JSON.parse(JSON.stringify(action.payload)),
            });
        }

        case sensors.SELECT_SENSORS: {
            return Object.assign({}, state, {
                selectedSensors: JSON.parse(JSON.stringify(action.payload))
            });
        }

        case sensors.CLEAR_SENSORS: {
            return Object.assign({}, state, {
                sensors: [],
                selectedSensors: [],
            });
        }
        default: {
            return state;
        }
    }
}

export const getSensors = (state: State) => state.sensors;
export const getSelectedSensors = (state: State) => state.selectedSensors;


