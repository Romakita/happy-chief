'use strict';

angular.module('happychief.services')
    .service('Recipe', function Recipe($http) {
        return {
            /**
             * Récupère les informations d'une recette
             * @param id Numéro ID
             * @returns {HttpPromise}
             */
            get:function(id){
                return $http
                    .get('/recipes/' + id);
            },
            /**
             * Sauvegarde les informations d'une recette.
             * @param o Information du skillcenter.
             * @param encode
             * @returns {HttpPromise}
             */
            save:function(o){

                if(o._id){
                    return $http
                        .put('/recipes/' + o._id, o);
                }

                return $http
                    .post('/recipes', o);
            },
            /**
             * Supprime les informations d'une recette.
             * @param id Numéro ID
             * @returns {HttpPromise}
             */
            remove:function(id){
                return $http
                    .delete('/recipes/' + id);
            },
            /**
             * Récupère la liste des skillcenters.
             * @param options
             * @returns {HttpPromise}
             */
            randomList:function(nb){
                return $http({
                    url: '/recipes/random/'+ (nb || 5),
                    method: "GET"
                });
            },
            /**
             * Récupère la liste des skillcenters.
             * @param options
             * @returns {HttpPromise}
             */
            getList:function(options){
                return $http({
                    url: '/recipes',
                    method: "GET",
                    params: options
                });
            }
        }
    });
