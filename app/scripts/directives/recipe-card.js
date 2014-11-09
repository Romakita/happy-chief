'use strict';

angular.module('happychief.directives')
    .controller('CardsContainerController', function ($scope, $attrs, $parse, $interpolate, $routeParams, $location, $sanitize) {
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
        $scope.havePicture = false;
        $scope.totalPages = 1;
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
                sortField: $scope.sortField,
                havePicture: $scope.havePicture
            };

            options = angular.extend(options, $scope.parameters || {});

            $scope.loader(options).success(function (obj) {
                //$scope.list = obj.data;

                $scope.list1 =[];
                $scope.list2 =[];

                for(var i = 0; i < obj.data.length; i++){
                    if(i % 2 == 0){
                        $scope.list1.push(obj.data[i]);
                    }else{
                        $scope.list2.push(obj.data[i]);
                    }
                }

                $scope.totalItems = obj.maxLength;
                $scope.totalPages = Math.ceil(obj.maxLength / $scope.itemsPerPage);
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

        $scope.$parent.$watch('search', function(){
            $scope.currentPage = 1;
            $scope.search =      $scope.$parent.search || '';
            $scope.havePicture = $scope.$parent.havePicture || '';
            $scope.skip =        ($scope.currentPage-1) * ($scope.itemsPerPage);

            self.loadList();
        });

        $scope.$parent.$watch('havePicture', function(){
            $scope.currentPage = 1;
            $scope.search =      $scope.$parent.search || '';
            $scope.havePicture = $scope.$parent.havePicture || '';
            $scope.skip =       ($scope.currentPage-1) * ($scope.itemsPerPage);

            self.loadList();
        });

        $scope.$watch('parameters', function(){
            self.loadList();
        });
    })

    .controller('CardController', function ($scope, $attrs) {

    })

    .directive('cardsContainer', function ($parse) {
        return {
            restrict:       'EA',
            controller:     'CardsContainerController',
            templateUrl:    'views/recipe/cards-container.html',
            transclude:     true,
            scope: {
                href:           '@',
                loader:         '=',
                parameters:     '='
            },
            replace:            true,
            link: function postLink(scope, element, attrs) {

            }
        };
    })
    .directive('card', function ($parse) {
        return {
            restrict:       'EA',
            controller:     'CardController',
            templateUrl:    'views/recipe/card.html',
            transclude:     true,
            scope: {
                href:           '@',
                item:           '='
            },
            replace:            true,
            link: function postLink(scope, element, attrs) {

            }
        };
    });