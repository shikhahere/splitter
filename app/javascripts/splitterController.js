var app = angular.module('splitterApp', []);

app.config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.controller("splitterController", [ '$scope', '$location', '$http', '$q', '$window', '$timeout', function($scope , $location, $http, $q, $window, $timeout) {

$scope.sendEther = function(receiver1, receiver2, ether) {
	Splitter.deployed().sendEther(receiver1,receiver2,{from:account,value:ether})
						.then(function(tx){
							console.log(tx);

							return web3.eth.getTransactionReceiptMined(tx);
						})
						.then(function(receipt){
							console.log(receipt);
						});
};
$window.onload = function () {

		initUtils(web3);
		web3.eth.getAccounts(function(err, accs) {
			if (err != null) {
			  alert("There was an error fetching your accounts.");
			  return;
			}

			if (accs.length == 0) {
			  alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
			  return;
			}

			accounts = accs;
			account = accounts[0];

		});		

	}
}]);
