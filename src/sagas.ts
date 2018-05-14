import axios from 'axios'
import {
  DeviceStorage,
  AuthResponse,
  VerificationParams,
  UserSignOutCredentials,
  SIGNOUT_REQUEST_SENT,
  VERIFY_CREDENTIAL_SENT
} from './types'
import {
  registrationRequestSucceeded,
  registrationRequestFailed,
  verifyTokenRequestSent,
  verifyTokenRequestSucceeded,
  verifyTokenRequestFailed,
  signInRequestSent,
  signInRequestSucceeded,
  signInRequestFailed,
  signOutRequestSent,
  signOutRequestSucceeded,
  signOutRequestFailed,
  setHasVerificationBeenAttempted,
  verifyCredentialFailed
} from './actions'
import {
  deleteAuthHeaders,
  deleteAuthHeadersFromDeviceStorage,
  getUserAttributesFromResponse,
  persistAuthHeadersInDeviceStorage,
  setAuthHeaders,
} from './services/auth'
import AsyncLocalStorage from './AsyncLocalStorage'
import { takeEvery, put, call, ForkEffect } from 'redux-saga/effects'
import {
  SAGA_REGISTRATION_REQUEST_SENT,
  SAGA_VERIFY_TOKEN_REQUEST_SENT,
  SAGA_SIGN_IN_REQUEST_SENT,
  sagaRegistrationPayload,
  sagaVerifyTokenPayload,
  sagaSignInPayload
} from './saga_actions';

async function apiRequest (
  method: 'GET' | 'POST' | 'DELETE', url: string, data: {}
): Promise<any> {
  try {
    await axios({ method, url, data })
  } catch(error) {
    throw error
  }
}

type sagaActionTypes =
  SAGA_REGISTRATION_REQUEST_SENT |
  SAGA_SIGN_IN_REQUEST_SENT |
  SAGA_VERIFY_TOKEN_REQUEST_SENT |
  VERIFY_CREDENTIAL_SENT | 
  SIGNOUT_REQUEST_SENT
type SagaWorkerAction = () => (action?: { payload: any }) => any

const generateSagaWatcher = (
  action_type: sagaActionTypes, worker: SagaWorkerAction
) => function * () {
  yield takeEvery(action_type, worker)
}

type SagaActionWatcher = () => IterableIterator<ForkEffect>
interface SagaWatchersExport {
  readonly registerUserWatcher: SagaActionWatcher
  readonly verifyTokenWatcher: SagaActionWatcher
  readonly signInUserWatcher: SagaActionWatcher
  readonly signOutUserWatcher: SagaActionWatcher
  readonly verifyCredentialsWatcher: SagaActionWatcher
}

export type SagaWatchersGeneratorExport = (
  config: { [key: string]: any }
) => SagaWatchersExport
const generateAuthSagaWatchers: SagaWatchersGeneratorExport = (config) => {
  const {
    registerUser,
    verifyToken,
    signInUser,
    signOutUser,
    verifyCredentials
  } = generateAuthSagaWorker(config)

  return ({
    registerUserWatcher: generateSagaWatcher(
      SAGA_REGISTRATION_REQUEST_SENT, registerUser
    ),
    verifyTokenWatcher: generateSagaWatcher(
      SAGA_VERIFY_TOKEN_REQUEST_SENT, verifyToken
    ),
    signInUserWatcher: generateSagaWatcher(
      SAGA_SIGN_IN_REQUEST_SENT, signInUser
    ),
    signOutUserWatcher: generateSagaWatcher(
      SIGNOUT_REQUEST_SENT, signOutUser
    ),
    verifyCredentialsWatcher: generateSagaWatcher(
      VERIFY_CREDENTIAL_SENT, verifyCredentials
    )
  })
}


interface SagaWorkerGenerator {
  readonly registerUser: SagaWorkerAction
  readonly verifyToken: SagaWorkerAction
  readonly signInUser: SagaWorkerAction
  readonly signOutUser: SagaWorkerAction
  readonly verifyCredentials: SagaWorkerAction
}

const generateAuthSagaWorker = (
  config: { [key: string]: any }
): SagaWorkerGenerator => {
  const {
    authUrl,
    storage,
    userAttributes,
    userRegistrationAttributes,
  } = config
  const Storage: DeviceStorage = Boolean(storage.flushGetRequests)
    ? storage : AsyncLocalStorage

  const registerUser = () =>
    function * (action: sagaRegistrationPayload) {
      const userRegistrationDetails = action.payload.userRegistrationDetails
      const {
        email,
        password,
        passwordConfirmation,
      } = userRegistrationDetails
      const data = {
        email,
        password,
        password_confirmation: passwordConfirmation,
      }
      Object.keys(userRegistrationAttributes).forEach((key: string) => {
        const backendKey = userRegistrationAttributes[key]
        data[backendKey] = userRegistrationDetails[key]
      })
      try {
        console.log('register token called with payload ' + action.payload)
        const response: AuthResponse = yield call(
          apiRequest, 'POST', authUrl,  data)
        setAuthHeaders(response.headers)
        persistAuthHeadersInDeviceStorage(Storage, response.headers)
        const userAttributesToSave = getUserAttributesFromResponse(
          userAttributes, response
        )
        yield put(registrationRequestSucceeded(userAttributesToSave))
      } catch (error) {
        yield put(registrationRequestFailed())
        throw error
      }
  }
  const verifyToken = () => function * (action: sagaVerifyTokenPayload) {
    yield put(verifyTokenRequestSent())
    try {
      const url = `${authUrl}/validate_token`
      const response: AuthResponse = yield call(
        apiRequest, 'GET', url, action.payload.verificationParams
      )
      setAuthHeaders(response.headers)
      persistAuthHeadersInDeviceStorage(Storage, response.headers)
      const userAttributesToSave = getUserAttributesFromResponse(
        userAttributes, response
      )
      yield put(verifyTokenRequestSucceeded(userAttributesToSave))
    } catch (error) {
      yield put(verifyTokenRequestFailed())
    }
  }
  const signInUser = () => function * (action: sagaSignInPayload) {
    yield put(signInRequestSent())
    const {
      email,
      password,
    } = action.payload.userSignInCredentials
    try {
      const url = `${authUrl}/sign_in`
      const data = { email, password }
      const response = yield call(apiRequest, 'POST', url, data)
      setAuthHeaders(response.headers)
      persistAuthHeadersInDeviceStorage(Storage, response.headers)
      const userAttributesToSave = getUserAttributesFromResponse(userAttributes, response)
      yield put(signInRequestSucceeded(userAttributesToSave))
    } catch (error) {
      yield put(signInRequestFailed())
      throw error
    }
  }
  const signOutUser = () => function * () {
    const userSignOutCredentials: UserSignOutCredentials = {
      'access-token': yield call(Storage.getItem, 'access-token'),
      client: yield call(Storage.getItem, 'client'),
      uid: yield call(Storage.getItem, 'uid'),
    }
    yield put(signOutRequestSent())
    try {
      const url = `${authUrl}/sign_out`
      const data = userSignOutCredentials
      yield call(apiRequest, 'DELETE', url, data)
      deleteAuthHeaders()
      deleteAuthHeadersFromDeviceStorage(Storage)
      yield put(signOutRequestSucceeded())
    } catch (error) {
      yield put(signOutRequestFailed())
      throw error
    }
  }
  const verifyCredentials = () => function * () {
    try {
      if (yield call(Storage.getItem, 'access-token')) {
        const verificationParams: VerificationParams = {
          'access-token': yield call(Storage.getItem, 'access-token'),
          client: yield call(Storage.getItem, 'client'),
          uid: yield call(Storage.getItem, 'uid'),
        }
        yield call(verifyToken, verificationParams)
      } else {
        yield put(setHasVerificationBeenAttempted(true))
      }
    } catch(error) {
      yield put(verifyCredentialFailed())
      throw error
    }
  }
  return {
    registerUser,
    verifyToken,
    signInUser,
    signOutUser,
    verifyCredentials,
  }
}

export default generateAuthSagaWatchers
