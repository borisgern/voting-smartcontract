pragma solidity ^0.4.18;

contract Voting {
    address public owner; 
    mapping (uint8 => uint8) public votesArray;
    address[] public votersList;
    uint8[] public optionsList;
    
    
    event receiveVote(address indexed from);
    
    modifier onlyOwner() { 
        require(msg.sender == owner);
        _;
    }

    function Voting(uint8[] votingList) public {
        owner = msg.sender;
        optionsList = votingList;
    }
    
    function vote(uint8 option) public {
        if (!checkVoter(msg.sender) && checkOption(option)) {
            votersList.push(msg.sender);
            votesArray[option] += 1;   
            emit receiveVote(msg.sender);
        } 
    }

    function checkOption(uint8 option) view private returns (bool) {
        for(uint i = 0; i < optionsList.length; i++) {
            if (optionsList[i] == option) {
                return true;
            }
        }
        return false;
    }
    
    function checkVoter(address voterAddress) view private returns (bool) {
        for(uint i = 0; i < votersList.length; i++) {
            if (votersList[i] == voterAddress) {
                return true;
            }
        }
        return false;
    }

    function checkResult(uint8 option) view public returns (uint8) {
        return votesArray[option];
  }

}
