pragma solidity ^0.5.7;

contract Game {

    struct Player {
        uint id;
        string _name; 
    }

    mapping(address => bool) public loggedInPlayers;
    mapping(uint => Player) public players;
    uint public playersNumber;

    event loginEvent (
        uint indexed _playerId
    );

    function addPlayer (string memory _name) private {
        playersNumber ++;
        players[playersNumber] = Player(playersNumber, _name);
    }

    function login (string memory _name) public {
        addPlayer(_name);
        loggedInPlayers[msg.sender] = true;
        emit loginEvent(playersNumber);
    }
}
