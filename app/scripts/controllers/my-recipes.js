'use strict';

angular.module('happyChiefApp')
  .controller('MyRecipesCtrl', function ($scope, session) {

        var data = session.getUser().bookmarks;

        $scope.href = '#/recipes';

        $scope.list1 =[];
        $scope.list2 =[];

        for(var i = 0; i < data.length; i++){
            if(i % 2 == 0){
                $scope.list1.push(data[i]._recipe);
            }else{
                $scope.list2.push(data[i]._recipe);
            }
        }
  });
