angular.module( 'ctpidirective', [] )
    .directive('helloWorld', function() {
        return {
            restrict: 'AE',
            scope: {},
            replace: 'true',
            template: '<div class="stark">Helloa World!!</div>'
        };
    });

