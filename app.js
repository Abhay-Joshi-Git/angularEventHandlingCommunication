angular.module('shoppingApp', [])
  .controller('shoppingMasterController', ['$scope', function($scope){
    $scope.balance = 1000;
    $scope.$on('BUY_EVENT', function(){
      $scope.balance -= 500;
      if($scope.balance <= 0){
        $scope.$broadcast('OUT_OF_BALANCE');
      }
    });
  }])
  .controller('ediblesController', ['$scope', function($scope){
    $scope.buyHandler = function(){
      $scope.$emit('BUY_EVENT');
    };
    $scope.$on('OUT_OF_BALANCE', function(){
      $scope.disableBuy = true;
    });

  }])
  .controller('clothesController', ['$scope', function($scope){
    $scope.buyHandler = function(){
      $scope.$emit('BUY_EVENT');
    };
    $scope.$on('OUT_OF_BALANCE', function(){
      $scope.disableBuy = true;
    });

  }]);