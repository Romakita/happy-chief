'use strict';

angular.module('happyChiefApp')
    .service('session', function ($window, User) {

        //console.log('service session');

        this.create = function (data) {

            $window.sessionStorage.token =      data.token;
            $window.sessionStorage.user =       JSON.stringify(data.user);

            this.user =     data.user;
        };

        this.setUser = function(u){
            $window.sessionStorage.user =       JSON.stringify(u);
            this.user =     u;
        };

        this.destroy = function () {

            delete $window.sessionStorage.token;
            delete $window.sessionStorage.user;

            this.user =     null;
            this.root =     null;

        };

        this.restore = function(){
            try{
                this.user =     JSON.parse($window.sessionStorage.user);
                this.root =     $window.sessionStorage.user.root;
            }catch(er){}
        };

        this.exists = function(){
            return !!($window.sessionStorage.token &&  $window.sessionStorage.user);
        };

        return this;
    });
