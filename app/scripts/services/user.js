'use strict';

angular.module('happychief.services')
    .service('User', function User($http, $authSession) {

        function getBookmaks(id){
            return $http.get('/admin/users/' + $authSession.getUser()._id + '/bookmarks');
        }

        return {
            /**
             *
             * @param id
             * @returns {*}
             */
            addBookmark:function(id){
                return $http.post('/admin/users/' + $authSession.getUser()._id + '/bookmarks/' + id)
                    .success(function(){
                        getBookmaks(session.getUser()._id)
                            .success(function(data){
                                session.getUser().bookmarks = data;

                                session.save();
                            });
                    });
            },
            /**
             *
             * @param id
             * @returns {*}
             */
            removeBookmark:function(id){
                return $http.delete('/admin/users/' + $authSession.getUser()._id + '/bookmarks/' + id)

                    .success(function(){
                        getBookmaks($authSession.getUser()._id)
                            .success(function(data){
                                $authSession.getUser().bookmarks = data;

                                $authSession.save();
                            });
                    });
            },
            /**
             *
             * @returns {*}
             */
            getBookmarks: function(){

                if(!$authSession.exists()){
                    return [];
                }

                return $authSession.getUser().bookmarks || [];
            },
            /**
             *
             * @param id
             * @returns {HttpPromise}
             */
            getRecipes:function(id){
                return $http.get('/users/' + id  + '/recipes');
            }

        }
    });
