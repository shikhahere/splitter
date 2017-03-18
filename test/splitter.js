getBalanceForAcct = function (acct, interval) {return new Promise( function(resolve , reject ){
    return web3.eth.getBalance(acct, function(err, balance ){
            if(err)
                return reject(err);
            else {
                return resolve(balance);
            }
    }) ;
  } );
};

getCode = function (acct, interval) {return new Promise( function(resolve , reject ){
    return web3.eth.getCode(acct, function(err, code ){
            if(err)
                return reject(err);
            else {
                return resolve(code);
            }
    }) ;
  } );
};

contract('Splitter', function(accounts) {

console.log(accounts);

  // Your unit tests come here
it("should Spilt the value between 2 accounts",function() {
  var acc1PrevBalance, acc2PrevBalance, acc1NewBalance, acct2NewBalance ;

  return getBalanceForAcct(accounts[1]).then(function(_acc1PrevBalance){
    acc1PrevBalance = _acc1PrevBalance;
    console.log("The acc1PrevBalance balance before sending ether is : " + acc1PrevBalance.toString(10) );
    return getBalanceForAcct(accounts[2]);
    }).then(function(_acc2PrevBalance){
      acc2PrevBalance = _acc2PrevBalance;
      console.log("The acc2PrevBalance balance before sending ether is : " + acc2PrevBalance.toString(10) );
      return Splitter.deployed().sendEther(accounts[1],accounts[2],{from:accounts[0],value:1000});

    }).then(function(txhash){
      console.log(txhash );
    return getBalanceForAcct(accounts[1]);
    }).then(function(_acc1NewBalance){
      acc1NewBalance = _acc1NewBalance;
      console.log("The newBalance balance for first Acount after sending ether is : " + acc1NewBalance.toString(10) );
      return getBalanceForAcct(accounts[2]);
   }).then(function(_acc2NewBalance){
      acc2NewBalance = _acc2NewBalance;
      console.log("The newBalance balance for second account after sending ether is : " + acc2NewBalance.toString(10) );
      assert.equal(acc1PrevBalance.plus(500).toString(10), acc1NewBalance.toString(10));
      assert.equal(acc2PrevBalance.plus(500).toString(10), acc2NewBalance.toString(10));
   })
         
         
  })
  
it("should Kill the contract and return the code of 0",function() {

  return Splitter.deployed().kill({from:accounts[0]})
  .then(function(txHash){
  	console.log(txHash);
  	return getCode(accounts[0]);
  }).then(function(_code){
        console.log("The Code is : " + _code );
      	assert.equal(_code, "0x0");

  })
  
})

it("synchronous call doesnt work",function() {
	var balance = web3.eth.getBalance(accounts[0]);
	console.log("The balance is : " + balance );

})

});