'use strict';

angular.module('happyChiefApp')
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
    });


