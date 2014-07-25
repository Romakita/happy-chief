'use strict';

angular.module('happyChiefApp')
  .controller('RecipeCtrl', function ($scope, $routeParams, Recipe) {
        if($routeParams.id){
            Recipe.get($routeParams.id).success(function(data){
                $scope.data = data;
                $scope.now = new Date();
            });
        }
  });
