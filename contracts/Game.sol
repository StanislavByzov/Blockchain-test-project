pragma solidity ^0.5.7;


contract Game {

    struct Player {
        uint id;
        string _name; 
    }

    mapping(address => bool) public loggedInPlayers;
    mapping(uint => Player) public players;
    uint public playersNumber;
    uint public cost;
    address payable private contractAddress;
    address private owner;

    event loginEvent (
        uint indexed _playerId
    );

    constructor() public {
        owner = msg.sender;
        cost = 1 ether;
    }

    modifier _ownerOnly() {
        require(msg.sender == owner);
        _;
    }

    function addPlayer (string memory _name) private {
        playersNumber ++;
        players[playersNumber] = Player(playersNumber, _name);
    }

    function login (string memory _name) public payable {
        require(msg.value == cost);
        addPlayer(_name);
        loggedInPlayers[msg.sender] = true;
        contractAddress.transfer(msg.value);
        emit loginEvent(playersNumber);
    }

    function setAddress (address payable addr) public _ownerOnly {
        contractAddress = addr; 
    }
}
