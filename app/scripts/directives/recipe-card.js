'use strict';

angular.module('happyChiefApp')
    .controller('RecipeCardController', function ($scope, $attrs, $parse, $interpolate, $routeParams, $location, $sanitize) {
        var self = this;

        if (typeof $attrs.sortDefault !== 'undefined') {

            var sort = $attrs.sortDefault.split(' ');

            $scope.sortField = sort[0];
            $scope.sortOrder = sort.length == 2 ? sort[1] : 'asc';

        } else {
            $scope.sortField = false;
            $scope.sortOrder = false;
        }
        //
        // Paginations
        //
        $scope.paginations = typeof $attrs.paginations !== 'undefined' ? $attrs.paginations.split(',') : [20, 50, 100];
        $scope.totalItems = 0;
        $scope.currentPage = $routeParams.page ? $routeParams.page : 1;
        $scope.maxSize = 5;
        $scope.itemsPerPage = $routeParams.limit ? $routeParams.limit : 20;
        $scope.skip = ($scope.currentPage - 1) * ($scope.itemsPerPage);
        $scope.hidePagination = true;
        //
        // Recherche
        //
        $scope.search = $routeParams.search ? $routeParams.search : '';

        $scope.onChangeItemsPerPage = function (value) {
            $scope.itemsPerPage = value;
            $scope.currentPage = 1;

            self.setPath();
            self.loadList();
        };

        this.loadList = function () {

            var options = {
                limit: $scope.itemsPerPage,
                skip: $scope.skip,
                search: $scope.search,
                sortOrder: $scope.sortOrder,
                sortField: $scope.sortField
            };

            options = angular.extend(options, $scope.parameters || {});

            $scope.loader(options).success(function (obj) {
                console.log(obj);

                $scope.list = obj.data;
                $scope.totalItems = obj.maxLength;
                $scope.showPagination = obj.maxLength > $scope.itemsPerPage;
            });
        };

        this.setPath = function () {
            $location.path($scope.href.replace('#', '') + '/' + $scope.currentPage + '/' + ($scope.itemsPerPage) + ($scope.search ? ('/' + $scope.search) : ''), false);
        };

        $scope.sanitize = function(str){
            var charRemplacement = "-";

            var string = str.trim().replace(/ /g, charRemplacement);
            string = encodeURIComponent(string);
            string = string.replace(/(%C3%A9)|(%C3%A8)|(%C3%AA)|(%C3%AB)/g, 'e');
            string = string.replace(/(%C3%A0)|(%C3%A4)|(%C3%A2)/g, 'a');
            string = string.replace(/(%C3%B9)|(%C3%BC)|(%C3%BB)/g, 'u');
            string = string.replace(/(%C3%BF)/g, 'y');
            string = string.replace(/(%C3%B2)|(%C3%B6)|(%C3%B4)/g, 'o');
            string = string.replace(/(%C3%A7)/g, 'c');
            string = string.replace(/%[A-F0-9]{0,2}/g, '');

            var reg = new RegExp('/\\\\|\\/|\\||\\:|\\?|\\*|"|<|>|[[:cntrl:]]/', 'g');
            string = string.replace(reg, charRemplacement);
            string = string.replace(/[~'!\.]/g, '');

            string = string.replace(/--/g, '-');

            return string.toLowerCase();
        };

        $scope.onSelectPage = function(pageNo){
            $scope.currentPage = pageNo;
            $scope.skip =        ($scope.currentPage-1) * ($scope.itemsPerPage);
            //
            // Changement de l'historique
            //
            self.setPath();
            //
            // Chargement des données
            //
            self.loadList();
        };

        /*$scope.$watch('search', function(value){
            $scope.currentPage = 1;
            $scope.skip =        ($scope.currentPage-1) * ($scope.itemsPerPage);
            self.loadList();
        });*/

        $scope.$watch('parameters', function(){
            self.loadList();
        });
    })

    .directive('recipeCard', function ($parse) {
        return {
            restrict:       'EA',
            controller:     'RecipeCardController',
            templateUrl:    'views/recipe/card.html',
            transclude:     true,
            scope: {
                href:           '@',
                loader:         '=',
                parameters:     '='
            },
            replace:            true,
            link: function postLink(scope, element, attrs, tableDataCtrl) {
                scope.showCreate = typeof attrs.create == 'undefined' ? true : attrs.create;
            }
        };
    });