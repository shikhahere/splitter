pragma solidity ^0.4.4;


contract Splitter {
	address owner;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);
	mapping (address => uint) balances;

	function Splitter() {
		owner = msg.sender;
		balances[msg.sender] = 1000;
	}

	function sendEther(address receiverFirst,address receiverSecond) payable returns(bool sufficient) {
		uint amount = msg.value;
		if (amount > balances[msg.sender]) return false;
		balances[msg.sender] -= amount;
		balances[receiverFirst] += amount/2;
		balances[receiverSecond] += amount/2;
		if(!receiverFirst.send(amount/2)) throw;
		if(!receiverSecond.send(amount/2)) throw;
		Transfer(msg.sender, receiverFirst, amount/2);
		Transfer(msg.sender, receiverSecond, amount/2);
		return true;
	}
	
	function kill() {
		if (msg.sender == owner) {
			selfdestruct(owner);
		}
	}
}