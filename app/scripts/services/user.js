'use strict';

angular.module('happyChiefApp')
    .service('User', function User($http, session) {

        function getBookmaks(id){
            return $http.get('/admin/users/' + session.getUser()._id + '/bookmarks');
        }

        return {
            /**
             *
             * @param id
             * @returns {*}
             */
            addBookmark:function(id){
                return $http.post('/admin/users/' + session.getUser()._id + '/bookmarks/' + id)
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
                return $http.delete('/admin/users/' + session.getUser()._id + '/bookmarks/' + id)

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
             * @returns {*}
             */
            getBookmarks: function(){

                if(!session.exists()){
                    return [];
                }

                return session.getUser().bookmarks || [];
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
