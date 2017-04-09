pragma solidity ^0.4.4;


contract Remittance {
	address private owner;
	bytes32 private firstPasscode;
	bytes32 private secondPassCode; 
	uint private deadline;
	uint private limit;
	uint private challengeStartTime;
	uint private gasSpenttoDeployContract;


	/**
	 * Limit is set at the time contract is deployed.
	 */
	function Remittance(uint limitToSet) {
	   owner = msg.sender;
	   limit = limitToSet;
	   //msg.gas is the left over gas not the used gas
	   //gasSpenttoDeployContract = msg.gas*tx.gasprice;
	   gasSpenttoDeployContract = 0;

	}
	
	
	/**
	 *Remit Conditions are only allowed to be set by the owner of the Contract.
	 *The Challenge time is already started when the contract is deployed. 
	 */
	function setUpRemitConditions(bytes32 firstPasscodeToVerify, bytes32 secondPassCodeToverify, uint deadlineToSet) payable returns(bool) {
		if (msg.sender != owner) throw;
		//If deadline is more than the limit defined then throw
		if (deadline >= limit) throw;
		if (msg.value < 0) throw;
		firstPasscode = firstPasscodeToVerify;
		secondPassCode = secondPassCodeToverify;
		deadline = deadlineToSet;
		challengeStartTime = now;
		return true;
	}
	
	/**
	 * Challenge can be claimed by passing the sha3 passcodes.
	 */
	function claimChallenge(bytes32 firstPasscodeToVerify, bytes32 secondPassCodeToverify) 
			verifyPasscodes(firstPasscodeToVerify, secondPassCodeToverify) payable returns(bool){
		
		//Alice should not be claiming the challenge, it should be any body else who has paccodes
		if (msg.sender == owner) throw; 

		//If the claim is not within the deadline Bob cannot claim the challenge
		if (deadline < now-challengeStartTime) throw;

		//Give Bob a little less than the gasSpent tp deploy the contract
		if (!msg.sender.send(this.balance - gasSpenttoDeployContract)) throw;
		
		//Give Alice the amount it took her to deploy the contract
		//if (!owner.send(gasSpenttoDeployContract)) throw;
		return true;
	}
	
	/**
	* The Owner of the contract can only claim the unchallenged value.
	*/
	function claimUnchallengedValue() payable returns(bool){
		if (msg.sender != owner) throw;

		//If the deadline has passed Alice can claim the unchallenged ether, no need to throw just retun false since Alice is 
		//also the owner of the contract, just returning false should be enough.
		if (deadline  < now - challengeStartTime) {
			if (!owner.send(this.balance)) {
				return true;
			} else {
				return false;
			}
		}
	}

	
	modifier verifyPasscodes(bytes32 firstPasscodeToVerify, bytes32 secondPassCodeToverify) {
		if (firstPasscode != firstPasscodeToVerify) throw;
		if (secondPassCode != secondPassCodeToverify) throw;
		_;

	}
	

	
}
