'use strict';

angular.module('happychief.services')

    .constant('authEvents', {
        loginSuccess:       'auth-login-success',
        loginFailed:        'auth-login-failed',
        logoutSuccess:      'auth-logout-success',
        sessionTimeout:     'auth-session-timeout',
        notAuthenticated:   'auth-not-authenticated',
        notAuthorized:      'auth-not-authorized'
    })

    .config(function($httpProvider) {

        $httpProvider.interceptors.push([
            '$injector',
            function ($injector) {
                return $injector.get('authInterceptor');
            }
        ]);

    })

    .factory('authInterceptor', function ($rootScope, $q, $window, authEvents) {
        return {
            request: function (config) {
                config.headers = config.headers || {};

                if ($window.sessionStorage.token) {

                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                }
                return config;
            },

            responseError: function (response) {
                if (response.status === 401) {
                    $rootScope.$broadcast(authEvents.notAuthenticated, response);
                }

                if (response.status === 403) {
                    $rootScope.$broadcast(authEvents.notAuthorized, response);
                }

                if (response.status === 419 || response.status === 440) {
                    $rootScope.$broadcast(authEvents.sessionTimeout, response);
                }

                return $q.reject(response);
            }
        };
    })

    .service('authService', function authService($rootScope, $http, session, authEvents) {

        return {
            /**
             *
             * @param credentials
             * @returns {*}
             */
            login: function (credentials) {
                return $http
                    .post('/login', credentials)
                    .success(function (data, status, headers, config) {
                        session.create(data);
                    })
                    .error(function (data, status, headers, config) {
                        session.destroy();
                    });
            },
            /**
             *
             * @param credentials
             * @returns {*}
             */
            signup: function (credentials) {

                return $http
                    .post('/signup', credentials)
                    .success(function (data, status, headers, config) {
                        session.create(data);
                    })
                    .error(function (data, status, headers, config) {
                        session.destroy();
                    });
            },
            /**
             *
             * @returns {*}
             */
            logout:function(){

                $rootScope.$broadcast(authEvents.logoutSuccess);

                return $http
                    .post('/logout')
                    .success(function (data, status, headers, config) {
                        session.destroy();
                    })
                    .error(function (data, status, headers, config) {
                        session.destroy();
                    });
            },

            isRoot:function(){
                return session.user.root;
            }
        };
    });


