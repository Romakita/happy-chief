'use strict';

angular.module('happychief.controllers')
    .controller('CategoriesCtrl', function ($scope, $rootScope, Category) {
        $scope.list = [];

        Category.list({enabled:'all'})
            .success(function(data){
                $scope.list = data;
            });


        $scope.add = function(){

            $scope.list.push({
                label:      '',
                enabled:    true
            });

        };

        $scope.onChange = function(item){

            Category.save(item)
                .success(function(){
                    $rootScope.$broadcast('categories.update');
                });
        };


    });
