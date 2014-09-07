'use strict';

angular
    .module('happyChiefApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'mm.foundation'
    ])
    .config(function ($routeProvider, $httpProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/auth/:json', {
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
            .when('/my-recipes', {
              templateUrl: 'views/my-recipes.html',
              controller: 'MyRecipesCtrl'
            })
            .when('/categories', {
              templateUrl: 'views/categories.html',
              controller: 'CategoriesCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        try {

            $httpProvider.interceptors.push([
                '$injector',
                function ($injector) {
                    return $injector.get('authInterceptor');
                }
            ]);

        } catch (er) {
            alert(er)
        }
    })

    .controller('AppController', function ($rootScope, $scope, $location, Recipe, Category, authService, session, userRoles, authEvents) {

        $scope.randomRecipes = [];

        Recipe.randomList(8).success(function(data){
            $scope.randomRecipes = data;
        });

        $scope.onFocusSearch = function(){
            $location.path('/');
        };

        $scope.account =        null;
        $scope.userRoles =      userRoles;
        $scope.isAuthorized =   authService.isAuthorized;

        if(session.exists()){
            session.restore();
            $scope.account =   session.user;
        }

        $rootScope.$on(authEvents.loginSuccess, function(event, args) {
            $scope.account = session.user;
            $location.path('/');
        });

        $rootScope.$on(authEvents.logoutSuccess, function(event, args) {
            $scope.account = null;
        });

        $rootScope.$on(authEvents.loginFailed, function(event, args) {
            $scope.account = null;
            $location.path('/login');
        });

        $rootScope.$on(authEvents.sessionTimeout, function(event, args) {
            $scope.account = null;
            $location.path('/login');
        });

        $scope.logout = function(){
            authService.logout();
        };


        Category.list().success(function(data){
            $scope.categories = data;
        });

        $rootScope.$on('categories.update', function(event, data){
            Category.list().success(function(data){
                $scope.categories = data;
            });
        });
    })

    .run(function ($rootScope, $route, $location, $routeParams) {

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
