'use strict';

angular.module('happyChiefApp')
    .service('Category', function Category($http) {
        return {
            /**
             * Sauvegarde une catégorie
             * @param o Information du skillcenter.
             * @param encode
             * @returns {HttpPromise}
             */
            save:function(o){

                if(o._id){
                    return $http
                        .put('/categories/' + o._id, o);
                }

                return $http
                    .post('/categories', o);
            },
            /**
             * Supprime une catégorie
             * @param id Numéro ID
             * @returns {HttpPromise}
             */
            remove:function(id){
                return $http
                    .delete('/categories/' + id);
            },
            /**
             * Supprime liste les catégories
             * @param options
             * @returns {HttpPromise}
             */
            list:function(options){
                return $http({
                    url: '/categories',
                    method: "GET",
                    params: options
                });
            }
        }
    });
