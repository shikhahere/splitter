pragma solidity ^0.4.4;


contract Remittance {
	address private owner;
	bytes32 private challenge;
	uint private deadline;
	uint private limit;
	uint private challengeStartTime;
	uint private feeToPayToOwner;


	/**
	 * Limit is set at the time contract is deployed.
	 */
	function Remittance(uint limitToSet, uint fee) {
	   owner = msg.sender;
	   limit = limitToSet;
	   feeToPayToOwner = fee;

	}
	
	
	/**
	 *Remit Conditions are only allowed to be set by the owner of the Contract.
	 *The Challenge time is already started when the contract is deployed. 
	 */
	function setUpRemitConditions(bytes32 firstPasscodeToVerify, bytes32 secondPassCodeToverify, uint deadlineToSet) payable returns(bool) {
		if (msg.sender != owner) throw;
		//If deadline is more than the limit defined then throw
		if (deadline >= limit) throw;

		//The value sent should atleast be greater than the fee to be payed to the owner
		if (msg.value <= feeToPayToOwner) throw;
		challenge = computedShaValue(firstPasscodeToVerify, secondPassCodeToverify);
		deadline = deadlineToSet;
		challengeStartTime = now;
		return true;
	}
	
	/**
	 * Challenge can be claimed by passing the sha3 passcodes.
	 */
	function claimChallenge(bytes32 challengeToVerify) 
			verifyPasscodes(challengeToVerify) payable returns(bool){
		
		//Alice should not be claiming the challenge, it should be any body else who has paccodes
		if (msg.sender == owner) throw; 

		//If the claim is not within the deadline Bob cannot claim the challenge
		if (deadline < now-challengeStartTime) throw;

		//Give Bob a little less than the gasSpent tp deploy the contract
		if (!msg.sender.send(this.balance - feeToPayToOwner)) throw;
		
		//Give Alice the fee? Is that what we want?
		if (!owner.send(feeToPayToOwner)) throw;
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

	
	modifier verifyPasscodes(bytes32 challengeToVerify) {
		if (challenge != challengeToVerify) throw;
		_;

	}
	
	function computedShaValue(bytes32 a, bytes32 b) constant returns (bytes32) {
	//Generate a random sha3 value
        return sha3(a,b,100);
    }
	
}
