'use strict';

angular.module('happyChiefApp')
    .controller('LoginCtrl', function ($rootScope, $scope, $routeParams, $location, authService, authEvents, session) {

        $scope.credentials = {};

        if($routeParams.json){
            var obj = JSON.parse($routeParams.json);
            session.create(obj);

            $rootScope.$broadcast(authEvents.loginSuccess);

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

            authService.login($scope.credentials).then(function () {

                $rootScope.$broadcast(authEvents.loginSuccess);

            }, function () {
                $rootScope.$broadcast(authEvents.loginFailed);
                $scope.messageError = 'Votre e-mail et mot de passe ne correspond à aucun compte utilisateur';
            });

        };

    });
