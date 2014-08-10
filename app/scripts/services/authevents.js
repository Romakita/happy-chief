'use strict';

angular.module('happyChiefApp')
    .constant('authEvents', {
        loginSuccess:       'auth-login-success',
        loginFailed:        'auth-login-failed',
        logoutSuccess:      'auth-logout-success',
        sessionTimeout:     'auth-session-timeout',
        notAuthenticated:   'auth-not-authenticated',
        notAuthorized:      'auth-not-authorized'
    })
    .constant('userRoles', {
        root: 'root',
        user: 'user'
    });