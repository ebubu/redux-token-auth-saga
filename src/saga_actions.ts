import {
  UserRegistrationDetails,
  UserSignInCredentials,
  VerificationParams,
} from './types'
export type SAGA_REGISTRATION_REQUEST_SENT =
'redux-token-auth/SAGA_REGISTRATION_REQUEST_SENT'
export const SAGA_REGISTRATION_REQUEST_SENT: SAGA_REGISTRATION_REQUEST_SENT =
'redux-token-auth/SAGA_REGISTRATION_REQUEST_SENT'

export type SAGA_SIGN_IN_REQUEST_SENT =
'redux-token-auth/SAGA_SIGN_IN_REQUEST_SENT'
export const SAGA_SIGN_IN_REQUEST_SENT: SAGA_SIGN_IN_REQUEST_SENT =
'redux-token-auth/SAGA_SIGN_IN_REQUEST_SENT'

export type SAGA_VERIFY_TOKEN_REQUEST_SENT =
'redux-token-auth/SAGA_VERIFY_TOKEN_REQUEST_SENT'
export const SAGA_VERIFY_TOKEN_REQUEST_SENT: SAGA_VERIFY_TOKEN_REQUEST_SENT =
'redux-token-auth/SAGA_VERIFY_TOKEN_REQUEST_SENT'

export type sagaRegistrationPayload = {
  payload: { userRegistrationDetails: UserRegistrationDetails }
}
export interface sagaRegistrationSentAction extends sagaRegistrationPayload {
  readonly type:  SAGA_REGISTRATION_REQUEST_SENT
}

export type sagaSignInPayload = {
  payload: { userSignInCredentials: UserSignInCredentials }
}
export interface sagaSignInSentAction extends sagaSignInPayload {
  readonly type: SAGA_SIGN_IN_REQUEST_SENT
}

export type sagaVerifyTokenPayload = {
  payload: { verificationParams: VerificationParams }
}
export interface sagaVerifyTokenSentAction extends sagaVerifyTokenPayload {
  readonly type: SAGA_VERIFY_TOKEN_REQUEST_SENT
}

export const sagaRegistrationRequest = (
  userRegistrationDetails: UserRegistrationDetails
) : sagaRegistrationSentAction => ({
  type: SAGA_REGISTRATION_REQUEST_SENT,
  payload: {
    userRegistrationDetails
  }
})

export const sagaSignInRequest = (
  userSignInCredentials: UserSignInCredentials
) : sagaSignInSentAction => ({
  type: SAGA_SIGN_IN_REQUEST_SENT,
  payload: {
    userSignInCredentials
  }
})

export const sagaVerifyTokenRequest = (
  verificationParams: VerificationParams
) : sagaVerifyTokenSentAction => ({
  type: SAGA_VERIFY_TOKEN_REQUEST_SENT,
  payload: { verificationParams }
})
