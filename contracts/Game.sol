// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./PPT.sol";

contract Game is PPT {
    address public owner;

    // Game utilities
    mapping(address => bool) _userInitGame;
    mapping(uint256 => bytes32) _options;
    mapping(uint256 => bytes32) _playerSelectedOption;

    // Valid Options
    bytes32 public PIEDRA = keccak256("PIEDRA");
    bytes32 public PAPEL = keccak256("PAPEL");
    bytes32 public TIJERA = keccak256("TIJERA");

    // Game config
    uint256 public costPerGame = 10;
    uint256 public winPayingAmount = 30;

    constructor() {
        owner = msg.sender;

        // Set options
        _options[0] = PIEDRA;
        _options[1] = PAPEL;
        _options[2] = TIJERA;

        // Initial PPT Balance
        _mint(msg.sender, 1000000);
    }

    function joinGame() public {
        require(
            msg.sender != owner,
            "Owner cannot be the player"
        );
        require(
            _userInitGame[msg.sender] != true,
            "You already have joined to the game."
        );
        _userInitGame[msg.sender] = true;

        // Give some tokens to the player
        if (balanceOf(msg.sender) == 0) {
            _transfer(owner, msg.sender, 200);
        }
    }

    function play(bytes32 playerSelectedOption) public payable {
        _transfer(msg.sender, owner, costPerGame);

        // Request a random number
        uint256 requestId = block.timestamp; // Simulates a random number

        uint256 randomOption = requestId % 3;
        bytes32 contractChoice = _options[randomOption];

        // Outcomes
        if (isAWinScenario(playerSelectedOption, contractChoice)) {
            // User win
            _transfer(owner, msg.sender, winPayingAmount);
        } else if (playerSelectedOption == contractChoice) {
            // Tied match
            _transfer(owner, msg.sender, costPerGame);
        }
    }

    // Only for testing purposes
    function play(bytes32 playerSelectedOption, uint option) public payable {
        _transfer(msg.sender, owner, costPerGame);

        // Request a random number
        uint256 requestId = option; // Simulates a random number

        uint256 randomOption = requestId % 3;
        bytes32 contractChoice = _options[randomOption];

        // Outcomes
        if (isAWinScenario(playerSelectedOption, contractChoice)) {
            // User win
            _transfer(owner, msg.sender, winPayingAmount);
        } else if (playerSelectedOption == contractChoice) {
            // Tied match
            _transfer(owner, msg.sender, costPerGame);
        }
    }

    function isAWinScenario(
        bytes32 playerSelectedOption,
        bytes32 contractChoice
    ) private view returns (bool) {
        if (playerSelectedOption == PAPEL && contractChoice == PIEDRA) {
            return true;
        } else if (playerSelectedOption == TIJERA && contractChoice == PAPEL) {
            return true;
        } else if (playerSelectedOption == PIEDRA && contractChoice == TIJERA) {
            return true;
        }
        return false;
    }

    function finishGame() public {
        require(
            _userInitGame[msg.sender] == true,
            "You have not joined to the game."
        );

        // User is no longer playing
        _userInitGame[msg.sender] = false;
    }
}
