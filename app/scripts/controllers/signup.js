'use strict';

angular.module('happychief.controllers')
  .controller('SignupCtrl', function ($rootScope, $scope, authService, authEvents) {
        $scope.credentials = {};

        $scope.signup = function() {
            delete $scope.messageError;

            if($scope.credentials.email == '' || $scope.credentials.password == '' || $scope.credentials.name == '' || $scope.credentials.firstName == ''){
                $scope.messageError = 'Veuillez saisir les informations demandées par le formulaire';
                return;
            }

            authService.signup($scope.credentials).then(function () {

                $rootScope.$broadcast(authEvents.loginSuccess);

            }, function () {

                $scope.messageError = 'Une erreur est survenue lors de la création de votre compte';
            });
        };
  });
