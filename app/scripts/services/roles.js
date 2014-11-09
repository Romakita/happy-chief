'use strict';

angular.module('happychief.services')

    .constant('ROLES', {
        admin:{
            label:'Administrateur',
            modules:{}
        },

        moderator:{
            categories:{
                edit:   true,
                create: true,
                remove: true,
                list:   true
            }
        },

        user:{
            categories:{
                edit:   false,
                create: true,
                remove: false,
                list:   true
            }
        }
    })

    .filter('roles', function(authService){
        return function(e){

            if(authService.isAuthenticated()){

                if(!authService.isRoot()){
                    delete e.admin;
                }
            }

            return e;
        }
    })

