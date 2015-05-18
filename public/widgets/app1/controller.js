'use strict';

angular.module('app1', ['angularWidget'])
  .controller('widgetsList', function ($scope) {
    $scope.shouldShow = true;
    $scope.options = {collapse: true};
    $scope.addWidget = function (name, count) {
      for (var i = 0; i < count; i++) {
        if ($scope.widgets && $scope.widgets.length) {
          $scope.widgets.push({id: $scope.widgets[$scope.widgets.length - 1].id + 1, src: name});
        } else {
          $scope.widgets = [{id: 0, src: 'widget1'}];
        }
      }
    };
    $scope.addWidget('widget1', 1);
  })
  .controller('widgetContainer', function ($scope) {
    $scope.isLoading = true;

    $scope.$on('exportPropertiesUpdated', function (event, props) {
      $scope.title = props.title;
    });
    $scope.$on('widgetLoaded', function () {
      $scope.isLoading = false;
      $scope.isError = false;
    });
    $scope.$on('widgetError', function () {
      $scope.isLoading = false;
      $scope.isError = true;
    });

    $scope.reload = function () {
      $scope.isLoading = true;
      $scope.isError = false;
      $scope.$broadcast('reloadWidget');
    };
  })
  .config(function initializemanifestGenerator(widgetsProvider) {
    widgetsProvider.setManifestGenerator(function () {
      return function (name) {
        return {
          module: name,
          html: 'widgets/' + name + '/view.html',
          files: [
            'widgets/' + name + '/controller.js',
            'widgets/' + name + '/style.css'
          ]
        };
      };
    });
  });
