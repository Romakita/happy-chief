'use strict';

angular.module('happyChiefApp')
  .controller('RecipeCtrl', function ($scope, $routeParams, Recipe) {

        $scope.steps = {};

        $scope.sanitize = function(str){
            return str.replace("<br />", "").replace(/<br \/>$/, '');
        };

        if($routeParams.id){
            Recipe.get($routeParams.id).success(function(data){
                $scope.data = data;
                $scope.now = new Date();


                for(var key in $scope.data.ingredients){
                    var current = $scope.data.ingredients[key];

                    if(typeof $scope.steps[current.step] == 'undefined'){
                        $scope.steps[current.step] = [];
                    }

                    $scope.steps[current.step].push(current);
                }

            });
        }
  });
