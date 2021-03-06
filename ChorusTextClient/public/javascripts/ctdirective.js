angular.module( 'ctpidirective', [] )
    .directive('focusLine', function() {
        return {
            restrict: 'AE',
            scope: true,
            transclude: 'true',
            template: '<span class="focusl" ng-transclude></span>'
        };
    })
    .directive('focusWord', function() {
        return {
            restrict: 'AE',
            scope: {},
            transclude: 'true',
            template: '<span class="focusw" ng-transclude></span>'
        };
    })
    .directive('focusChar', function() {
        return {
            restrict: 'AE',
            scope: {},
            transclude: 'true',
            template: '<span class="focusc" ng-transclude></span>'
        };
    });

