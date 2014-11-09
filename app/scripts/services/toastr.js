/**
 * Created by romak_000 on 09/11/2014.
 */
angular
    .module('toastr', [])

    .config(function(){
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "positionClass": "toast-top-right",
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };
    })

    .factory('$toastr', function(){
        return toastr;
    });
