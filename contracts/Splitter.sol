pragma solidity ^0.4.4;


contract Splitter {
	address owner;

	event LogTransfer(address indexed _from, address indexed _to, uint256 _value);

	function Splitter() {
		owner = msg.sender;
	}

	function sendEther(address receiverFirst,address receiverSecond) payable returns(bool sufficient) {
		if (msg.value > 0 ) {
			uint split = msg.value/2;
			if (split+split != msg.value) {
				//the value is not splittable example 3
				throw;
			}
			if(!receiverFirst.send(split)) throw;
			if(!receiverSecond.send(split)) throw;
			LogTransfer(msg.sender, receiverFirst, split);
			LogTransfer(msg.sender, receiverSecond, split);
			return true;
		} else {
			return false;
		}
	}
	
	function kill() {
		if (msg.sender == owner) {
		selfdestruct(owner);
		}
	}
}