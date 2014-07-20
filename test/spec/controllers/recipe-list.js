'use strict';

describe('Controller: RecipeListCtrl', function () {

  // load the controller's module
  beforeEach(module('happyChiefRecettesApp'));

  var RecipeListCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RecipeListCtrl = $controller('RecipeListCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
