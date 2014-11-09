'use strict';

angular.module('happychief.controllers')

    .controller('LoginCtrl', function ($rootScope, $scope, $routeParams, $location, $auth) {

        $scope.credentials = {};

        if($routeParams.json){
            $auth.store(JSON.parse($routeParams.json));
            $location.path('/');
        }

        //$scope.storeLogin = false;
        //restore account info
       /* if(!angular.isUndefined($cookieStore.get('login')) && !angular.isUndefined($cookieStore.get('password'))){
            $scope.credentials.login =         $cookieStore.get('login');
            $scope.credentials.password =      $cookieStore.get('password');
            $scope.storeLogin =    true;
        }*/

        $scope.login = function() {
            delete $scope.messageError;

            $scope.credentials.email = $('#credential-email').val();
            $scope.credentials.password = $('#credential-password').val();

            if ($scope.credentials.email == '' || $scope.credentials.password == '') {
                $scope.messageError = 'Veuillez saisir votre e-mail et votre mot de passe pour vous connecter';
                return;
            }

            /*if($scope.storeLogin){
             $cookieStore.put('login', $scope.credentials.login);
             $cookieStore.put('password', $scope.credentials.password);
             }*/

            $auth
                .login($scope.credentials)
                .success(function(){

                })
                .error(function(){

                })

        };

    });
