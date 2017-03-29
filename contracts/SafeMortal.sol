//Taken from Xavier repository for safe mortal

pragma solidity ^0.4.4;

contract SafeMortal {
	address public owner;
	bool public killed;
	event LogKilled(address owner, bool killed);

	function SafeMortal() {
		owner = msg.sender;
	}

	function kill() isNotKilled {
		if (msg.sender != owner) {
			throw;
		}
		if (!owner.call.value(this.balance)()) {
			throw;
		}
		killed = true;
		LogKilled(owner,killed);
	}

	modifier isNotKilled {
		if (killed) {
			throw;
		}
		_;
	}

	//function () isNotKilled payable {}
}