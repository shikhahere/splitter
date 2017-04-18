Extensions = require("../utils/extensions.js");
Extensions.init(web3, assert);


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract('Remittance', function(accounts) {
	console.log(accounts);

describe("Claim Challenge", function() {
    var remittance;
    var firstPasscodeToVerify = "Give the Money";
    var secondPasscodeToVerify = "Its my Money";
    var limit = 5*24*60*60; //5 days
	var owner = accounts[0];
    var reciever = accounts[1];
    var recieverOriginalBalance;
    var ownerOriginalBalance;
    var recieverBalanceAfterClaim;
    var ownerBalanceAfterClaim;
    var deadline = 24*60*60;//1 day
    var gasToDeployContract;
    var challengeToVerify ;
    var fee = web3.toWei(.01,'ether');
    beforeEach("should setup remit conditions", function() {

            return Remittance.new(limit, fee, { from: owner })
                .then(created => {
                    remittance = created;
                    return web3.eth.getTransactionReceiptMined(remittance.transactionHash);
                 })
                    .then(receipt => {console.log(receipt);
                            return Promise.all([
                                    receipt.gasUsed,
                                    web3.eth.getTransactionPromise(receipt.transactionHash),
                                    remittance.computedShaValue(firstPasscodeToVerify,secondPasscodeToVerify)
                    ]);
            }).then(txAndBalances => {
                    gasToDeployContract = txAndBalances[0] * txAndBalances[1].gasPrice.toNumber();

                    console.log("gasToDeployContract ====>"+gasToDeployContract);
                    challengeToVerify = txAndBalances[2];
                    console.log("===computed=="+challengeToVerify);
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
            return remittance.claimChallenge(challengeToVerify, {from : reciever})
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

                                //Should get a little less than the transferred ether (i.e. less by amount of fee)
                                assert.equal(recieverOriginalBalance.minus(gaspricebyTheTransaction).minus(fee)
                                        .plus(web3.toWei(2,'ether')).toString(10), recieverBalanceAfterClaim.toString(10));
                                //owner original balance is taken after 2 ether were transferred, so this comparison is okay, he should only 
                                //have additional fee different
                                assert.equal(ownerOriginalBalance.plus(fee), ownerBalanceAfterClaim.toString(10));

            })
    	});

            it("Should not be possible to claim the challenge if the passcodes are incorrect", function() {
            return Extensions.expectedExceptionPromise(
                () => remittance.claimChallenge("Incorrect PassCode 1", {from : reciever, gas: 3000000 }),
                3000000);
            });

            it("It should not be possible for the owner to call the claim challenge himself", function() {
            return Extensions.expectedExceptionPromise(
                () => remittance.claimChallenge(challengeToVerify, {from : owner, gas: 3000000 }),
                3000000);
            });

        });

describe("Claim Challenge when deadline has passed", function() {
    var remittance;
    var firstPasscodeToVerify = "Give the Money";
    var secondPasscodeToVerify = "Its my Money";
    var challengeToVerify;
    var limit = 5*24*60*60; //5 days
    var owner = accounts[0];
    var reciever = accounts[1];
    var recieverOriginalBalance;
    var ownerOriginalBalance;
    var recieverBalanceAfterClaim;
    var ownerBalanceAfterClaim;
    var deadline = 12;//12 sec
        var fee = web3.toWei(.01,'ether');

        beforeEach("should setup remit conditions", function() {

            return Remittance.new(limit, fee, { from: owner })
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
                                    web3.eth.getTransactionPromise(receipt.transactionHash),
                                    remittance.computedShaValue(firstPasscodeToVerify,secondPasscodeToVerify)

                                ]);
                }).then(txAndBalances => {recieverOriginalBalance = txAndBalances[1];
                                ownerOriginalBalance = txAndBalances[0];
                                challengeToVerify = txAndBalances[2];

                })                
        });
        it("It should not be possible to claim the challenge since the deadline has passed", function() {
            return sleep(15000) //A little more than 12 sec
            .then( sleptforSpecifiedTime => {Extensions.expectedExceptionPromise(
            () => remittance.claimChallenge(challengeToVerify, {from : reciever, gas: 3000000 }),
            3000000);});
        });

        });

});