'use strict';

angular.module('happychief.controllers')
    .controller('RecipeListCtrl', function ($scope, $routeParams, Recipe) {
        console.log('Recipes list');


        $scope.loader = function(o){

            if($routeParams.category){
                o.category = $routeParams.category;
            }

            return Recipe.getList(o);
        };
    });
