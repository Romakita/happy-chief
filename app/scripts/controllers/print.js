'use strict';

angular
    .module('happyChiefApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute'
    ])

    .controller('PrintController', function ($rootScope, $scope, $location, Recipe) {



        console.log($location.path());

        if($location.path().replace('/','')){

            Recipe.get($location.path().replace('/','')).success(function(data){

                $rootScope.steps = {};
                $rootScope.shopGroups = {};

                $rootScope.data = data;
                $rootScope.now = new Date();


                for(var key in $rootScope.data.ingredients){
                    var current = $rootScope.data.ingredients[key];

                    if(typeof $rootScope.steps[current.step] == 'undefined'){
                        $rootScope.steps[current.step] = [];
                    }

                    $rootScope.steps[current.step].push(current);

                    if(typeof $rootScope.shopGroups[current.shopGroup] == 'undefined'){
                        $rootScope.shopGroups[current.shopGroup] = [];
                    }

                    $rootScope.shopGroups[current.shopGroup].push(current);
                }

            });
        }else{
            window.location = "/";
        }
    })

    .run(function ($rootScope, $route, $location) {

    });
