'use strict';

angular.module('happyChiefApp')
    .controller('LoginCtrl', function ($scope, AuthService) {

        $scope.credentials = {mail:'', password:''};

        //$scope.storeLogin = false;
        //restore account info
       /* if(!angular.isUndefined($cookieStore.get('login')) && !angular.isUndefined($cookieStore.get('password'))){
            $scope.credentials.login =         $cookieStore.get('login');
            $scope.credentials.password =      $cookieStore.get('password');
            $scope.storeLogin =    true;
        }*/

        $scope.login = function() {

            console.log($scope.credentials)
            if($scope.credentials.mail == '' || $scope.credentials.password == ''){
                $scope.messageError = 'Veuillez saisir votre e-mail et votre mot de passe pour vous connecter';
                return;
            }

            /*if($scope.storeLogin){
                $cookieStore.put('login', $scope.credentials.login);
                $cookieStore.put('password', $scope.credentials.password);
            }*/

            AuthService.login($scope.credentials).then(function () {

                //$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                //$location.path('admin');

            }, function () {
                //$rootScope.account = null;
                //$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                //$scope.messageError = "Erreur lors de l'authentification";
            });
        };

    });
