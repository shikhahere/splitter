Extensions = require("../utils/extensions.js");
Extensions.init(web3, assert);


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
      return Splitter.deployed().sendEther(accounts[1],accounts[2],{from:accounts[0],value:1000,gas: 3000000 });

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

  return Splitter.deployed().kill({from:accounts[0],gas: 3000000})
  .then(function(txHash){
  	console.log(txHash);
  	return getCode(accounts[0]);
  }).then(function(_code){
        console.log("The Code is : " + _code );
      	assert.equal(_code, "0x0");
	return Splitter.killed;
  })
  
})

it("should not be possible to send Ether to it", function() {
    return Extensions.expectedExceptionPromise(
	() => web3.eth.sendTransactionPromise({
	    from: accounts[0],
	    to: accounts[1],
	    value: 1
	}),
	21000);
});

//Trying the kill method similar to safe mortal
 describe("After kill", function() {
        var splitter;
	var owner = accounts[0];
        beforeEach("should create a killed Splitter", function() {
            return Splitter.new({ from: owner })
                .then(created => {
                    splitter = created;
                    return splitter.kill({ from: owner });
                })
                .then(txObject => splitter.killed())
                .then(killed => assert.isTrue(killed, "should have been killed"));
        });

        it("should not be possible to call kill again", function() {
            return Extensions.expectedExceptionPromise(
                () => splitter.kill({ from: owner, gas: 3000000 }),
                3000000);
        });

        it("should not be possible to send Ether to it", function() {
            return Extensions.expectedExceptionPromise(
                () => web3.eth.sendTransactionPromise({
                    from: owner,
                    to: splitter.address,
                    value: 1
                }),
                3000000);
        });

    });


//Send Odd number of ethers to see if it works
 describe("Sending 999 ethers should send the left over value to second reciepient", function() {
        var splitter;
	var owner = accounts[0];
	var firstReciever = accounts[1];
	var secondReciever = accounts[2];
	var firstRecieverOldBalance;
	var secondRecieverOldBalance;

        beforeEach("should call the sendEther function and send value", function() {
            return Splitter.new({ from: owner })
                .then(created => {splitter = created;return web3.eth.getBalancePromise(firstReciever);})
                .then(balance =>{firstRecieverOldBalance = balance;return web3.eth.getBalancePromise(secondReciever);})
                .then(balance =>secondRecieverOldBalance = balance)
        });

        it("should spli the value", function() {
         return splitter.sendEther(firstReciever, secondReciever, { from: owner, value: 999, gas :3000000 })
         .then(web3.eth.getTransactionReceiptMined)
        .then(receipt => web3.eth.getBalancePromise(firstReciever))
        .then(balance => {assert.equal(firstRecieverOldBalance.plus(499).toString(10), balance.toString(10));return web3.eth.getBalancePromise(secondReciever);})
        .then(balance => assert.equal(secondRecieverOldBalance.plus(500).toString(10), balance.toString(10)))        
        });

    });

});