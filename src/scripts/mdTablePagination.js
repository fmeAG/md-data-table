'use strict';

angular.module('md.data.table').directive('mdTablePagination', mdTablePagination);

function mdTablePagination() {

  function compile(tElement) {
    tElement.addClass('md-table-pagination');
  }

  function Controller($attrs, $mdUtil, $scope) {
    var self = this;

    function updateTranslations() {
      self.$label = angular.extend({
        page: 'Page:',
        rowsPerPage: 'Rows per page:',
        of: 'of'
      }, $scope.$eval(self.label) || {});
    }
    updateTranslations();
    $scope.$watch('$pagination.label', updateTranslations);

    function isPositive(number) {
      return parseInt(number, 10) > 0;
    }

    function isZero(number) {
      return number === 0 || number === '0';
    }

    self.disableNext = function () {
      return isZero(self.limit) || !self.hasNext();
    }

    self.eval = function (expression) {
      return $scope.$eval(expression);
    };

    self.first = function () {
      self.page = 1;
      self.onPaginationChange();
    };

    self.hasNext = function () {
      return self.page * self.limit < self.total;
    };

    self.hasPrevious = function () {
      return self.page > 1;
    };

    self.last = function () {
      self.page = self.pages();
      self.onPaginationChange();
    };

    self.max = function () {
      return self.hasNext() ? self.page * self.limit : self.total;
    };

    self.min = function () {
      return isPositive(self.total) ? self.page * self.limit - self.limit + 1 : 0;
    };

    self.next = function () {
      self.page++;
      self.onPaginationChange();
    };

    self.onPaginationChange = function () {
      if (angular.isFunction(self.onPaginate)) {
        $mdUtil.nextTick(function () {
          self.onPaginate(self.page, self.limit);
        });
      }
    };

    self.pages = function () {
      return isPositive(self.total) ? Math.ceil(self.total / (isPositive(self.limit) ? self.limit : 1)) : 1;
    };

    self.previous = function () {
      self.page--;
      self.onPaginationChange();
    };

    self.showBoundaryLinks = function () {
      return $attrs.mdBoundaryLinks === '' || self.boundaryLinks;
    };

    self.showPageSelect = function () {
      return $attrs.mdPageSelect === '' || self.pageSelect;
    };

    $scope.$watch('$pagination.limit', function (newValue, oldValue) {
      if (isNaN(newValue) || isNaN(oldValue) || newValue === oldValue) {
        return;
      }

      // find closest page from previous min
      self.page = Math.floor(((self.page * oldValue - oldValue) + newValue) / (isPositive(newValue) ? newValue : 1));
      self.onPaginationChange();
    });

    $scope.$watch('$pagination.total', function (newValue, oldValue) {
      if (isNaN(newValue) || newValue === oldValue) {
        return;
      }

      if (self.page > self.pages()) {
        self.last();
      }
    });
  }

  Controller.$inject = ['$attrs', '$mdUtil', '$scope'];

  return {
    bindToController: {
      boundaryLinks: '=?mdBoundaryLinks',
      label: '@?mdLabel',
      disabled: '=ngDisabled',
      limit: '=mdLimit',
      page: '=mdPage',
      pageSelect: '=?mdPageSelect',
      onPaginate: '=?mdOnPaginate',
      limitOptions: '=?mdOptions',
      total: '@mdTotal'
    },
    compile: compile,
    controller: Controller,
    controllerAs: '$pagination',
    restrict: 'E',
    scope: {},
    templateUrl: 'md-table-pagination.html'
  };
}
