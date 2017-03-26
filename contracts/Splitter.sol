pragma solidity ^0.4.4;
import "./SafeMortal.sol";


contract Splitter is SafeMortal  {
	address owner;

	event LogTransfer(address indexed _from, address indexed _to_receiver1, address indexed _to_receiver2, uint256 _value1, uint256 _value2);

	function Splitter() {
		owner = msg.sender;
	}

	function sendEther(address receiverFirst,address receiverSecond) isNotKilled payable returns(bool sufficient) {
		if (msg.value > 0 ) {
			uint splitValue1 = msg.value/2;
			if(!receiverFirst.send(splitValue1)) throw;
			//Just give the left over value to reciever2, even if its a little more
			if(!receiverSecond.send(msg.value-splitValue1)) throw;
			LogTransfer(msg.sender, receiverFirst, receiverSecond,splitValue1, msg.value-splitValue1);
			return true;
		} else {
			return false;
		}
	}
	
}