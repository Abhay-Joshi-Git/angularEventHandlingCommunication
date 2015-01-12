
//communication in nested controllers through events using $broadcast, $emit and $on
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

angular.module('factoryERPApp', [])
  .controller('productionFloorController', ['$scope', 'ironService', function($scope, ironService){
    $scope.fetchIron = function(){
      ironService.fetchIron(100);
    };
    $scope.$on('ironQtyChanged', function(event, args){
      $scope.notEnoughIron = args.ironQty < 100 ;
    });
  }])
  .controller('inventoryController', ['$scope', 'ironService', function($scope, ironService){
    $scope.$on('ironQtyChanged', function(event, args){
      $scope.ironAvailable = args.ironQty;
    });
    $scope.ironAvailable = ironService.getIronQty();
  }])
  .factory('ironService', function($rootScope){
    var ironQty = 300;
    var fetchIron = function(qty){
      ironQty = ironQty - qty;
      $rootScope.$broadcast('ironQtyChanged', {ironQty: ironQty});
    };
    var getIronAvailableQty = function(){
      return ironQty;
    };
    return {
      fetchIron: fetchIron,
      getIronQty: getIronAvailableQty
    }
  });

angular.bootstrap(angular.element('#ironFactoryERPApp'), ['factoryERPApp']);