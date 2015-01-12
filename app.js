
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

//communication using a service and events on rootScope
//angular.module('factoryERPApp', [])
//  .controller('productionFloorController', ['$scope', 'ironService', function($scope, ironService){
//    $scope.fetchIron = function(){
//      ironService.fetchIron(100);
//    };
//    $scope.$on('ironQtyChanged', function(event, args){
//      $scope.notEnoughIron = args.ironQty < 100 ;
//    });
//  }])
//  .controller('inventoryController', ['$scope', 'ironService', function($scope, ironService){
//    $scope.$on('ironQtyChanged', function(event, args){
//      $scope.ironAvailable = args.ironQty;
//    });
//    $scope.ironAvailable = ironService.getIronQty();
//  }])
//  .factory('ironService', function($rootScope){
//    var ironQty = 300;
//    var fetchIron = function(qty){
//      ironQty = ironQty - qty;
//      $rootScope.$broadcast('ironQtyChanged', {ironQty: ironQty});
//    };
//    var getIronAvailableQty = function(){
//      return ironQty;
//    };
//    return {
//      fetchIron: fetchIron,
//      getIronQty: getIronAvailableQty
//    }
//  });

//communication using a service with so called pub-sub model
angular.module('factoryERPApp', [])
  .controller('dashboardController', ['$scope', 'ironService', function($scope, ironService){
    var unSubscribeIronQtyChangesEvent;
    $scope.ironQtyChanges = 0;
    $scope.AluminiumQtyChanges = 0;
    $scope.RubberQtyChanges = 0;
    var onIronQtyChange = function(event, args){
      $scope.ironQtyChanges =  $scope.ironQtyChanges + args.changedQty;
    };
    $scope.subscribeIronQtyChanges = function(){
      unSubscribeIronQtyChangesEvent = ironService.subscribeOnIronQtyChange($scope, onIronQtyChange);
    };
    $scope.unSubscribeIronQtyChanges = function(){
      unSubscribeIronQtyChangesEvent();
    };
  }])
  .controller('productionFloorController', ['$scope', 'ironService', function($scope, ironService){
    $scope.fetchIron = function(){
      ironService.fetchIron(100);
    };
    var onIronQtyChange = function(event, args){
      $scope.notEnoughIron = args.ironQty < 100 ;
    };
    ironService.subscribeOnIronQtyChange($scope, onIronQtyChange);
  }])
  .controller('inventoryController', ['$scope', 'ironService', function($scope, ironService){
    $scope.ironAvailable = ironService.getIronQty();
    var onIronQtyChange = function(event, args){
      $scope.ironAvailable = args.ironQty;
    };
    ironService.subscribeOnIronQtyChange($scope, onIronQtyChange);
  }])
  .factory('ironService', function($rootScope){
    var ironQty = 300;
    var fetchIron = function(qty){
      ironQty = ironQty - qty;
      $rootScope.$broadcast('ironQtyChanged', {ironQty: ironQty, changedQty: qty});
    };
    var getIronAvailableQty = function(){
      return ironQty;
    };
    var subscribeOnIronQtyChange = function(scope, handler){
      return scope.$on('ironQtyChanged', handler);
    };
    return {
      fetchIron: fetchIron,
      getIronQty: getIronAvailableQty,
      subscribeOnIronQtyChange: subscribeOnIronQtyChange
    }
  });

angular.bootstrap(angular.element('#ironFactoryERPApp'), ['factoryERPApp']);

//inter module communication
angular.module('revenueApp', [])
  .factory('revenueCommunicationChannel', ['$log', '$window', function($log, $window){
    return {
      subscribe: function(handler){
        $log.info('subscribing...');
        $window.OnChangeHandler = handler; //we are using window here, instead we can use local storage
      },
      emit: function(amt){
        if($window.OnChangeHandler){
          $log.info('calling handler .. with amt : '+ amt);

          $window.OnChangeHandler(amt);
        }
        else{
          $log.info('no handler..');
        }
      }
    }
  }]);

angular.module('parentCompanyApp', ['revenueApp'])
  .controller('dashboardController', ['$scope', 'revenueCommunicationChannel', function($scope, revenueCommunicationChannel){
    $scope.totalRevenue = 0;
    var onChangeInRevenue = function(change){
      console.log('in handler with amt : '+ change);
      $scope.totalRevenue = $scope.totalRevenue + change;
      $scope.$apply();
    };
    revenueCommunicationChannel.subscribe(onChangeInRevenue);
  }]);

angular.module('childCompanyApp', ['revenueApp'])
  .controller('sellsController', ['$scope', 'revenueCommunicationChannel', function($scope, revenueCommunicationChannel){
    $scope.addRevenue = function(){
      revenueCommunicationChannel.emit(100);
    };
  }]);


angular.bootstrap(angular.element('#parentCompanyApp'), ['parentCompanyApp']);
angular.bootstrap(angular.element('#childCompanyApp'), ['childCompanyApp']);

