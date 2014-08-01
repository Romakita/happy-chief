'use strict';

angular.module('happyChiefApp')
  .controller('SignupCtrl', function ($scope, AuthService) {
        $scope.credentials = {};


        //$scope.storeLogin = false;
        //restore account info
        /* if(!angular.isUndefined($cookieStore.get('login')) && !angular.isUndefined($cookieStore.get('password'))){
         $scope.credentials.login =         $cookieStore.get('login');
         $scope.credentials.password =      $cookieStore.get('password');
         $scope.storeLogin =    true;
         }*/

        $scope.login = function() {
            delete $scope.messageError;

            $scope.mail = $('#credential-mail').val();
            $scope.password = $('#credential-password').val();

            if($scope.credentials.mail == '' || $scope.credentials.password == ''){
                $scope.messageError = 'Veuillez saisir votre e-mail et votre mot de passe pour vous connecter';
                return;
            }

            /*if($scope.storeLogin){
             $cookieStore.put('login', $scope.credentials.login);
             $cookieStore.put('password', $scope.credentials.password);
             }*/

            AuthService.signup($scope.credentials).then(function () {

                //$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                //$location.path('admin');

            }, function () {
                $scope.messageError = 'Une erreur est survenue lors de la création de votre compte';
                //$rootScope.account = null;
                //$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                //$scope.messageError = "Erreur lors de l'authentification";
            });
        };
  });
