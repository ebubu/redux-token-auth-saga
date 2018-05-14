"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAGA_REGISTRATION_REQUEST_SENT = 'redux-token-auth/SAGA_REGISTRATION_REQUEST_SENT';
exports.SAGA_SIGN_IN_REQUEST_SENT = 'redux-token-auth/SAGA_SIGN_IN_REQUEST_SENT';
exports.SAGA_VERIFY_TOKEN_REQUEST_SENT = 'redux-token-auth/SAGA_VERIFY_TOKEN_REQUEST_SENT';
exports.sagaRegistrationRequest = function (userRegistrationDetails) { return ({
    type: exports.SAGA_REGISTRATION_REQUEST_SENT,
    payload: {
        userRegistrationDetails: userRegistrationDetails
    }
}); };
exports.sagaSignInRequest = function (userSignInCredentials) { return ({
    type: exports.SAGA_SIGN_IN_REQUEST_SENT,
    payload: {
        userSignInCredentials: userSignInCredentials
    }
}); };
exports.sagaVerifyTokenRequest = function (verificationParams) { return ({
    type: exports.SAGA_VERIFY_TOKEN_REQUEST_SENT,
    payload: { verificationParams: verificationParams }
}); };
//# sourceMappingURL=saga_actions.js.map