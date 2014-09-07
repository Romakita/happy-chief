'use strict';

angular.module('happyChiefApp')
  .controller('RecipeCtrl', function ($scope, $routeParams, Recipe, User) {

        $scope.steps = {};
        $scope.bookmark = false;

        $scope.sanitize = function(str){
            if(str)
                return str.replace("<br />", "").replace(/<br \/>$/, '');

            return '';
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

                angular.forEach(User.getBookmarks(), function(item){
                    if(item._recipe == data._id){
                        $scope.bookmark = true;
                    }
                });
            });
        }

        $scope.addBookmark = function(){
            $scope.bookmark = true;
            User.addBookmark($scope.data._id);
        };

        $scope.removeBookmark = function(){
            $scope.bookmark = false;
            User.removeBookmark($scope.data._id);
        };
  });
