'use strict';

angular.module('tqiApp')
    .controller('TableDataController', function ($scope, $attrs, $parse, $interpolate, $routeParams, $location, $modal) {
        var self = this;

        if(typeof $attrs.sortDefault !== 'undefined'){

            var sort = $attrs.sortDefault.split(' ');

            $scope.sortField = sort[0];
            $scope.sortOrder = sort.length == 2 ? sort[1] : 'asc';

        }else{
            $scope.sortField =      false;
            $scope.sortOrder =      false;
        }
        //
        // Paginations
        //
        $scope.paginations =    typeof $attrs.paginations !== 'undefined' ? $attrs.paginations.split(',') : [20, 50, 100];
        $scope.totalItems =     0;
        $scope.currentPage =    $routeParams.page ? $routeParams.page : 1;
        $scope.maxSize =        5;
        $scope.itemsPerPage =   $routeParams.limit ? $routeParams.limit : 20;
        $scope.skip =           ($scope.currentPage-1) * ($scope.itemsPerPage);
        $scope.hidePagination = true;
        //
        // Recherche
        //
        $scope.search =         $routeParams.search ? $routeParams.search : '';

        $scope.rendererField = function(item, options){
            var value = options.value ? item[options.key][options.value] : item[options.key];

            if(typeof options.filter === 'function'){
                return options.filter.call(this, value);
            }

            return value;
        };

        $scope.onClickFieldHeader = function(data){
            if(data.sortable){
                if(data.key != $scope.sortField){
                    $scope.sortOrder = 'asc';
                }else{
                    $scope.sortOrder = $scope.sortOrder == 'asc' ? 'desc' : 'asc';
                }

                $scope.sortField = data.key;

                self.loadList();
            }
        };

        $scope.onChangeItemsPerPage = function(value){
            $scope.itemsPerPage = value;
            $scope.currentPage =  1;

            self.setPath();
            self.loadList();
        };

        $scope.openRemove = function(event, item) {

            if(typeof $attrs.popinTemplate !== 'undefined'){
                event.preventDefault();

                var modalInstance = $modal.open({
                    templateUrl:    $attrs.popinTemplate,
                    controller:     "TableDataModalController",
                    resolve: {
                        item: function () {
                            return item;
                        },
                        onCloseRemove: function(){
                            return $scope.onCloseRemove;
                        }
                    }
                });

                return false;
            }

            $location.path($scope.href.replace('#','') + '/' + item._id + '/remove');
        };

        this.loadList = function(){

            var options = {
                limit:      $scope.itemsPerPage,
                skip:       $scope.skip,
                search:     $scope.search,
                sortOrder:  $scope.sortOrder,
                sortField:  $scope.sortField
            };

            options = angular.extend(options, $scope.parameters || {});

            $scope.loader(options).success(function (obj) {
                $scope.list =           obj.data;
                $scope.totalItems =     obj.maxLength;
                $scope.showPagination = obj.maxLength > $scope.itemsPerPage;
            });
        };

        this.setPath = function(){
            $location.path($scope.href.replace('#', '') + '/' + $scope.currentPage + '/' + ($scope.itemsPerPage) + ($scope.search ? ('/' + $scope.search) : ''), false);
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

        $scope.onClickCreate = function(event){

            if(typeof $scope.onCreate == 'function'){
                return $scope.onCreate.call(this, event);
            }

        };

        $scope.$watch('search', function(value){
            $scope.currentPage = 1;
            $scope.skip =        ($scope.currentPage-1) * ($scope.itemsPerPage);
            self.loadList();
        });

        $scope.$watch('parameters', function(){
            self.loadList();
        });
    })
    .directive('tableData', function ($parse) {
        return {
            restrict:       'EA',
            controller:     'TableDataController',
            templateUrl:    'views/tabledata/tabledata.html',
            transclude:     true,
            scope: {
                //list:           '=',
                header:         '=',
                href:           '@',
                editable:       '=',
                removable:      '=',
                loader:         '=',
                onCreate:        '=',
                labelCreate:    '@',
                onCloseRemove:  '=',
                parameters:     '='
            },
            replace:            true,
            link: function postLink(scope, element, attrs, tableDataCtrl) {
                scope.showCreate = typeof attrs.create == 'undefined' ? true : attrs.create;
            }
        };
    })

    .controller('TableDataModalController', function ($scope, $modalInstance, item, onCloseRemove) {

        angular.extend($scope, item);
        $modalInstance.$scope = $scope;

        $scope.submit = function () {
            onCloseRemove.call($modalInstance, item);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });