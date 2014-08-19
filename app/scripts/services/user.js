'use strict';

angular.module('happyChiefApp')
    .service('User', function User($http, session) {
        function getBookmaks(id){
            return $http.get('/admin/users/' + session.getUser()._id + '/bookmarks');
        }

        return {
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


        }
    });
