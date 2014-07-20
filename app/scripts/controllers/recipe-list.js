'use strict';

angular.module('happyChiefApp')
    .controller('RecipeListCtrl', function ($scope, Recipe) {
        console.log('Recipes list');

        $scope.loader = function(o){
            console.log(o);

            return Recipe.getList(o).error(function(err){

                console.log(err);
            });
        };
    });
