'use strict';

angular.module('happyChiefApp')
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
            /**
             *
             * @returns {boolean}
             */
            isAuthenticated: function () {
                return session.exists();
            },

            isRoot:function(){
                return session.user.root;
            }
        };
    });
