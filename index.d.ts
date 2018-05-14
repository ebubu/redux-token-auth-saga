import { Reducer } from 'redux'
import {
  ActionsGeneratorExport,
  GenerateRequireSignInWrapperConfig,
  RequireSignInWrapper,
} from './src/types'
import { SagaWatchersGeneratorExport } from './src/sagas';
import { sagaRegistrationAction, sagaSignInAction, sagaVerifyTokenAction } from './src/saga_actions';

export const reduxTokenAuthReducer: Reducer<{}>

export const generateAuthActions: ActionsGeneratorExport

export const generateRequireSignInWrapper: (config: GenerateRequireSignInWrapperConfig) => RequireSignInWrapper

export const generateAuthSagaWatchers: SagaWatchersGeneratorExport

export const sagaRegistrationRequest: sagaRegistrationAction
export const sagaSignInRequest: sagaSignInAction
export const sagaVerifyTokenRequest: sagaVerifyTokenAction
