'use strict';

angular
    .module('happyChiefApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'mm.foundation'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/signup', {
                templateUrl: 'views/signup.html',
                controller: 'SignupCtrl'
            })
            .when('/recipes/:id', {
              templateUrl: 'views/recipe.html',
              controller: 'RecipeCtrl'
            })
            .when('/recipes/:page?/:limit?/:search?', {
                templateUrl: 'views/recipes-list.html',
                controller: 'RecipeListCtrl'
            })
            .when('/', {
                templateUrl: 'views/recipes-list.html',
                controller: 'RecipeListCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })

    .controller('AppController', function ($rootScope, $scope, Recipe) {

        $scope.randomRecipes = [];

        Recipe.randomList(8).success(function(data){
            $scope.randomRecipes = data;
        });

        $scope.$watch('search', function(val){

        });

    })

    .run(function ($rootScope, $route, $location) {

        console.log('run app');

        $rootScope.$on('$viewContentLoaded', function () {
            console.log('$viewContentLoaded');
        });
        //
        // Protection des routes
        //
        /*$rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {

            if (!authService.isAuthenticated()) {
                if (newUrl.match('#/admin')) {
                    $location.path('/');
                }
            } else {
                if (newUrl.match('#/admin/users') && !authService.isRoot()) {
                    $location.path('/admin');
                }
            }

        });*/

        var original = $location.path;
        $location.path = function (path, reload) {
            if (reload === false) {
                var lastRoute = $route.current;
                var un = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    un();
                });
            }
            return original.apply($location, [path]);
        };

    });
