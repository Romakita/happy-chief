'use strict';

angular.module('happyChiefApp')
  .controller('SignupCtrl', function ($scope, authService, authEvents) {
        $scope.credentials = {};

        $scope.signup = function() {
            delete $scope.messageError;

            if($scope.credentials.email == '' || $scope.credentials.password == '' || $scope.credentials.name || $scope.credentials.firstName){
                $scope.messageError = 'Veuillez saisir les informations demandées par le formulaire';
                return;
            }

            authService.login($scope.credentials).then(function () {

                $rootScope.$broadcast(authEvents.loginSuccess);

            }, function () {
                $rootScope.$broadcast(authEvents.loginFailed);
                $scope.messageError = 'Une erreur est survenue lors de la création de votre compte';
            });
        };
  });
