import {Action} from '@ngrx/store';


export const UPDATE_SENSORS         = 'main/UPDATE-SENSORS';

export const CLEAR_SENSORS          = 'main/CLEAR-SENSORS';

export const SENSORS_LOADING        = 'main/SENSORS_LOADING';
export const SENSORS_LOAD_SUCCESS   = 'main/SENSORS_LOAD_SUCCESS';
export const SENSORS_LOAD_FAIL      = 'main/SENSORS_LOAD_FAIL';

export const SELECT_SENSORS         = 'main/SELECT_SENSORS';



/**
 * Update Sensors Action
 */
export class UpdateSensorsSAction implements Action {
  readonly type = UPDATE_SENSORS;

  constructor(public payload: any) { }
}


/**
 * Update Selected Sensors Action
 */
export class SelectSensorsAction implements Action {
  readonly type = SELECT_SENSORS;

  constructor(public payload: any) { }
}


/**
 * Load Sensors Action
 */
export class SensorsLoadingAction implements Action {
  readonly type = SENSORS_LOADING;
  constructor() {
  }
}

export class SensorsLoadedSuccessAction implements Action {
  readonly type = SENSORS_LOAD_SUCCESS;

  constructor(public payload: any) { }
}


export class SensorsLoadedFailAction implements Action {
  readonly type = SENSORS_LOAD_FAIL;

  constructor() { }
}


/**
 * Clear Sensors Actions
 */
export class ClearSensorsAction implements Action {
  readonly type = CLEAR_SENSORS;

  constructor() { }
}


export type Actions
  = UpdateSensorsSAction
  | SelectSensorsAction
  | SensorsLoadingAction
  | SensorsLoadedSuccessAction
  | SensorsLoadedFailAction
  | ClearSensorsAction;
