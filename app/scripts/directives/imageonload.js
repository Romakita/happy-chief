'use strict';

angular.module('happyChiefApp')
  .directive('imageonload', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
          element.bind('load', function() {
                element.addClass('loaded');
          });
      }
    };
  });
