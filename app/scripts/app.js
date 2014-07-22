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
            .when('/', {
                templateUrl: 'views/recipes-list.html',
                controller: 'RecipeListCtrl'
            })
            .when('/recipes/show/:id/:title', {
              templateUrl: 'views/recipe.html',
              controller: 'RecipeCtrl'
            })
            .when('/recipes/:page?/:limit?/:search?', {
                templateUrl: 'views/recipes-list.html',
                controller: 'RecipeListCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .run(function ($rootScope, $route, $location) {

        console.log('run app');

        $rootScope.$on('$viewContentLoaded', function () {
            console.log('$viewContentLoaded');
            //$(document).foundation();
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
