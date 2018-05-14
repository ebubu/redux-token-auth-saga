"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var types_1 = require("./types");
var actions_1 = require("./actions");
var auth_1 = require("./services/auth");
var AsyncLocalStorage_1 = require("./AsyncLocalStorage");
var effects_1 = require("redux-saga/effects");
var saga_actions_1 = require("./saga_actions");
function apiRequest(method, url, data) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default({ method: method, url: url, data: data })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
var generateSagaWatcher = function (action_type, worker) { return function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, effects_1.takeEvery(action_type, worker)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}; };
var generateAuthSagaWatchers = function (config) {
    var _a = generateAuthSagaWorker(config), registerUser = _a.registerUser, verifyToken = _a.verifyToken, signInUser = _a.signInUser, signOutUser = _a.signOutUser, verifyCredentials = _a.verifyCredentials;
    return ({
        registerUserWatcher: generateSagaWatcher(saga_actions_1.SAGA_REGISTRATION_REQUEST_SENT, registerUser),
        verifyTokenWatcher: generateSagaWatcher(saga_actions_1.SAGA_VERIFY_TOKEN_REQUEST_SENT, verifyToken),
        signInUserWatcher: generateSagaWatcher(saga_actions_1.SAGA_SIGN_IN_REQUEST_SENT, signInUser),
        signOutUserWatcher: generateSagaWatcher(types_1.SIGNOUT_REQUEST_SENT, signOutUser),
        verifyCredentialsWatcher: generateSagaWatcher(types_1.VERIFY_CREDENTIAL_SENT, verifyCredentials)
    });
};
var generateAuthSagaWorker = function (config) {
    var authUrl = config.authUrl, storage = config.storage, userAttributes = config.userAttributes, userRegistrationAttributes = config.userRegistrationAttributes;
    var Storage = Boolean(storage.flushGetRequests)
        ? storage : AsyncLocalStorage_1.default;
    var registerUser = function () {
        return function (action) {
            var userRegistrationDetails, email, password, passwordConfirmation, data, response, userAttributesToSave, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userRegistrationDetails = action.payload.userRegistrationDetails;
                        email = userRegistrationDetails.email, password = userRegistrationDetails.password, passwordConfirmation = userRegistrationDetails.passwordConfirmation;
                        data = {
                            email: email,
                            password: password,
                            password_confirmation: passwordConfirmation,
                        };
                        Object.keys(userRegistrationAttributes).forEach(function (key) {
                            var backendKey = userRegistrationAttributes[key];
                            data[backendKey] = userRegistrationDetails[key];
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 6]);
                        console.log('register token called with payload ' + action.payload);
                        return [4 /*yield*/, effects_1.call(apiRequest, 'POST', authUrl, data)];
                    case 2:
                        response = _a.sent();
                        auth_1.setAuthHeaders(response.headers);
                        auth_1.persistAuthHeadersInDeviceStorage(Storage, response.headers);
                        userAttributesToSave = auth_1.getUserAttributesFromResponse(userAttributes, response);
                        return [4 /*yield*/, effects_1.put(actions_1.registrationRequestSucceeded(userAttributesToSave))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_2 = _a.sent();
                        return [4 /*yield*/, effects_1.put(actions_1.registrationRequestFailed())];
                    case 5:
                        _a.sent();
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        };
    };
    var verifyToken = function () { return function (action) {
        var url, response, userAttributesToSave, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, effects_1.put(actions_1.verifyTokenRequestSent())];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 7]);
                    url = authUrl + "/validate_token";
                    return [4 /*yield*/, effects_1.call(apiRequest, 'GET', url, action.payload.verificationParams)];
                case 3:
                    response = _a.sent();
                    auth_1.setAuthHeaders(response.headers);
                    auth_1.persistAuthHeadersInDeviceStorage(Storage, response.headers);
                    userAttributesToSave = auth_1.getUserAttributesFromResponse(userAttributes, response);
                    return [4 /*yield*/, effects_1.put(actions_1.verifyTokenRequestSucceeded(userAttributesToSave))];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    error_3 = _a.sent();
                    return [4 /*yield*/, effects_1.put(actions_1.verifyTokenRequestFailed())];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }; };
    var signInUser = function () { return function (action) {
        var _a, email, password, url, data, response, userAttributesToSave, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, effects_1.put(actions_1.signInRequestSent())];
                case 1:
                    _b.sent();
                    _a = action.payload.userSignInCredentials, email = _a.email, password = _a.password;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 7]);
                    url = authUrl + "/sign_in";
                    data = { email: email, password: password };
                    return [4 /*yield*/, effects_1.call(apiRequest, 'POST', url, data)];
                case 3:
                    response = _b.sent();
                    auth_1.setAuthHeaders(response.headers);
                    auth_1.persistAuthHeadersInDeviceStorage(Storage, response.headers);
                    userAttributesToSave = auth_1.getUserAttributesFromResponse(userAttributes, response);
                    return [4 /*yield*/, effects_1.put(actions_1.signInRequestSucceeded(userAttributesToSave))];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 5:
                    error_4 = _b.sent();
                    return [4 /*yield*/, effects_1.put(actions_1.signInRequestFailed())];
                case 6:
                    _b.sent();
                    throw error_4;
                case 7: return [2 /*return*/];
            }
        });
    }; };
    var signOutUser = function () { return function () {
        var userSignOutCredentials, _a, _b, url, data, error_5;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = {};
                    _b = 'access-token';
                    return [4 /*yield*/, effects_1.call(Storage.getItem, 'access-token')];
                case 1:
                    _a[_b] = _c.sent();
                    return [4 /*yield*/, effects_1.call(Storage.getItem, 'client')];
                case 2:
                    _a.client = _c.sent();
                    return [4 /*yield*/, effects_1.call(Storage.getItem, 'uid')];
                case 3:
                    userSignOutCredentials = (_a.uid = _c.sent(),
                        _a);
                    return [4 /*yield*/, effects_1.put(actions_1.signOutRequestSent())];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 8, , 10]);
                    url = authUrl + "/sign_out";
                    data = userSignOutCredentials;
                    return [4 /*yield*/, effects_1.call(apiRequest, 'DELETE', url, data)];
                case 6:
                    _c.sent();
                    auth_1.deleteAuthHeaders();
                    auth_1.deleteAuthHeadersFromDeviceStorage(Storage);
                    return [4 /*yield*/, effects_1.put(actions_1.signOutRequestSucceeded())];
                case 7:
                    _c.sent();
                    return [3 /*break*/, 10];
                case 8:
                    error_5 = _c.sent();
                    return [4 /*yield*/, effects_1.put(actions_1.signOutRequestFailed())];
                case 9:
                    _c.sent();
                    throw error_5;
                case 10: return [2 /*return*/];
            }
        });
    }; };
    var verifyCredentials = function () { return function () {
        var verificationParams, _a, _b, error_6;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 11]);
                    return [4 /*yield*/, effects_1.call(Storage.getItem, 'access-token')];
                case 1:
                    if (!_c.sent()) return [3 /*break*/, 6];
                    _a = {};
                    _b = 'access-token';
                    return [4 /*yield*/, effects_1.call(Storage.getItem, 'access-token')];
                case 2:
                    _a[_b] = _c.sent();
                    return [4 /*yield*/, effects_1.call(Storage.getItem, 'client')];
                case 3:
                    _a.client = _c.sent();
                    return [4 /*yield*/, effects_1.call(Storage.getItem, 'uid')];
                case 4:
                    verificationParams = (_a.uid = _c.sent(),
                        _a);
                    return [4 /*yield*/, effects_1.call(verifyToken, verificationParams)];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, effects_1.put(actions_1.setHasVerificationBeenAttempted(true))];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8: return [3 /*break*/, 11];
                case 9:
                    error_6 = _c.sent();
                    return [4 /*yield*/, effects_1.put(actions_1.verifyCredentialFailed())];
                case 10:
                    _c.sent();
                    throw error_6;
                case 11: return [2 /*return*/];
            }
        });
    }; };
    return {
        registerUser: registerUser,
        verifyToken: verifyToken,
        signInUser: signInUser,
        signOutUser: signOutUser,
        verifyCredentials: verifyCredentials,
    };
};
exports.default = generateAuthSagaWatchers;
//# sourceMappingURL=sagas.js.map