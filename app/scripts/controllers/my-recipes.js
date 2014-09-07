'use strict';

angular.module('happyChiefApp')
  .controller('MyRecipesCtrl', function ($scope, User, session) {

        User.getRecipes(session.getUser()._id)
            .success(function(data){
                $scope.href = '#/recipes';

                $scope.list1 =[];
                $scope.list2 =[];

                for(var i = 0; i < data.length; i++){
                    if(i % 2 == 0){
                        $scope.list1.push(data[i]);
                    }else{
                        $scope.list2.push(data[i]);
                    }
                }
            });


  });
