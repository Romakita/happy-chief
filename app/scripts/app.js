'use strict';

angular
    .module('happyChiefApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'mm.foundation',
        'loadash',
        'amplify',
        'toastr',
        'auth',
        'happychief.services',
        'happychief.directives',
        'happychief.filters',
        'happychief.controllers'
    ])

    .config(function ($routeProvider, $authProvider, $authRolesProvider) {
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
                controller: 'MyRecipesCtrl',
                title:'Mes recettes',

                $auth:true
            })

            .when('/categories', {
                templateUrl: 'views/categories.html',
                controller: 'CategoriesCtrl',
                title:'Gestion des catégories',

                $auth:{
                    fn:'edit',
                    module:'category'
                }

            })
            .otherwise({
                redirectTo: '/'
            });

        $authProvider
            .whenSuccess('/')
            .whenFail('/login')
            .whenDisconnect('/login')
            .requestLogin('/login')
            .requestLogout('/logout')
            .requestSignup('/signup');

        $authRolesProvider
            .whenGetRole(function($authSession){
                return $authSession.exists() ? '' : $authSession.getUser();
            })
            .addRole('admin', 'Administrateur', {

            });

    })

    .controller('AppController', function ($rootScope, $scope, $location, $authEvents, $auth, Recipe, Category) {

        $scope.randomRecipes = [];

        Recipe.randomList(8).success(function(data){
            $scope.randomRecipes = data;
        });

        $scope.onFocusSearch = function(){
            $location.path('/');
        };

        $scope.logout = function(){
            $auth.logout();
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
