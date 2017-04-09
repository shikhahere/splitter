Extensions = require("../utils/extensions.js");
Extensions.init(web3, assert);


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract('Remittance', function(accounts) {
	console.log(accounts);

describe("Claim Challenge", function() {
    var remittance;
    var firstPasscodeToVerify = web3.sha3("Give the Money");
    var secondPasscodeToVerify = web3.sha3("Its my Money");
    var limit = 5*24*60*60; //5 days
	var owner = accounts[0];
    var reciever = accounts[1];
    var recieverOriginalBalance;
    var ownerOriginalBalance;
    var recieverBalanceAfterClaim;
    var ownerBalanceAfterClaim;
    var deadline = 24*60*60;//1 day
    var gasToDeployContract;
        beforeEach("should setup remit conditions", function() {

            return Remittance.new(limit, { from: owner })
                .then(created => {
                    remittance = created;
                    return web3.eth.getTransactionReceiptMined(remittance.transactionHash);
                 })
                    .then(receipt => {console.log(receipt);
                            return Promise.all([
                                    receipt.gasUsed,
                                    web3.eth.getTransactionPromise(receipt.transactionHash)
                    ]);
            }).then(txAndBalances => {
                    gasToDeployContract = txAndBalances[0] * txAndBalances[1].gasPrice.toNumber();
                    console.log("gasToDeployContract ====>"+gasToDeployContract);
                    return remittance.setUpRemitConditions(firstPasscodeToVerify, secondPasscodeToVerify, deadline/*1 day deadline*/, 
                        { from: owner, value: web3.toWei(2,'ether')});
                    }).then(txObject => web3.eth.getTransactionReceiptMined(txObject))
                        .then(receipt => {//console.log(receipt);
                                return Promise.all([
                                    web3.eth.getBalancePromise(owner),
                                    web3.eth.getBalancePromise(reciever),
                                    web3.eth.getTransactionPromise(receipt.transactionHash)
                                ]);
                 }).then(txAndBalances => {recieverOriginalBalance = txAndBalances[1];
                                ownerOriginalBalance = txAndBalances[0];

                })  
              
        });

        it("Should be possible to claim the challenge after passing the correct passcodes", function() {
            return remittance.claimChallenge(firstPasscodeToVerify, secondPasscodeToVerify, {from : reciever})
           .then(txObject => {console.log(txObject);return web3.eth.getTransactionReceiptMined(txObject);})
    	   .then(receipt => {console.log(receipt);
                            return Promise.all([
                                    web3.eth.getBalancePromise(owner),
                                    web3.eth.getBalancePromise(reciever),
                                    receipt.gasUsed,
                                    web3.eth.getTransactionPromise(receipt.transactionHash)
                    ]);
            }).then(txAndBalances => {
                                recieverBalanceAfterClaim = txAndBalances[1];
                                ownerBalanceAfterClaim = txAndBalances[0];
                                var gasUsed = txAndBalances[2];
                                var transactionGasPrice = txAndBalances[3].gasPrice.toNumber();
                                var gaspricebyTheTransaction = transactionGasPrice * gasUsed;
                                console.log(txAndBalances[3]);
                                console.log("gaspricebyTheTransaction"+gaspricebyTheTransaction);

                                //For now donot remove the gas to deploy contract, since its not supported in the contract
                                assert.equal(recieverOriginalBalance.minus(gaspricebyTheTransaction)//.minus(gasToDeployContract)
                                        .plus(web3.toWei(2,'ether')).toString(10), recieverBalanceAfterClaim.toString(10));

            })
    	});

            it("Should not be possible to claim the challenge if the passcodes are incorrect", function() {
            return Extensions.expectedExceptionPromise(
                () => remittance.claimChallenge("Incorrect PassCode 1", "Incorrect Passcode 2", {from : reciever, gas: 3000000 }),
                3000000);
            });

            it("It should not be possible for the owner to call the claim challenge himself", function() {
            return Extensions.expectedExceptionPromise(
                () => remittance.claimChallenge(firstPasscodeToVerify, secondPasscodeToVerify, {from : owner, gas: 3000000 }),
                3000000);
            });

        });

describe("Claim Challenge when deadline has passed", function() {
    var remittance;
    var firstPasscodeToVerify = web3.sha3("Give the Money");
    var secondPasscodeToVerify = web3.sha3("Its my Money");
    var limit = 5*24*60*60; //5 days
    var owner = accounts[0];
    var reciever = accounts[1];
    var recieverOriginalBalance;
    var ownerOriginalBalance;
    var recieverBalanceAfterClaim;
    var ownerBalanceAfterClaim;
    var deadline = 12;//12 sec
        beforeEach("should setup remit conditions", function() {

            return Remittance.new(limit, { from: owner })
                .then(created => {
                    remittance = created;
                    return remittance.setUpRemitConditions(firstPasscodeToVerify, secondPasscodeToVerify, deadline/*12 sec*/, 
                        { from: owner, value: web3.toWei(2,'ether')});
                })
                .then(txObject => web3.eth.getTransactionReceiptMined(txObject))
                .then(receipt => {console.log(receipt);
                                return Promise.all([
                                    web3.eth.getBalancePromise(owner),
                                    web3.eth.getBalancePromise(reciever),
                                    web3.eth.getTransactionPromise(receipt.transactionHash)
                                ]);
                }).then(txAndBalances => {recieverOriginalBalance = txAndBalances[1];
                                ownerOriginalBalance = txAndBalances[0];

                })                
        });
        it("It should not be possible to claim the challenge since the deadline has passed", function() {
            return sleep(15000) //A little more than 12 sec
            .then( sleptforSpecifiedTime => {Extensions.expectedExceptionPromise(
            () => remittance.claimChallenge(firstPasscodeToVerify, secondPasscodeToVerify, {from : reciever, gas: 3000000 }),
            3000000);});
        });

        });

});