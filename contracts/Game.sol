// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./RPS.sol";
import "./RandomGenerator.sol";

contract Game is RPS, RandomGenerator {
    address public immutable owner;

    // Game utilities
    mapping(address => bool ) private _userInitGame;
    mapping(uint => bytes32) private _options;
    mapping(uint => bytes32) private _playerSelectedOption;
    mapping(uint => uint) private _randomRequestsResult;

    // Valid Options
    bytes32 public constant ROCK = keccak256("ROCK");
    bytes32 public constant PAPER = keccak256("PAPER");
    bytes32 public constant SCISSORS = keccak256("SCISSORS");

    // Game config
    uint public constant COST_PER_GAME = 10;
    uint public constant WIN_PAYING_AMOUNT = 30;
    uint private constant COURTESY_AMOUNT = 100;
    uint private constant MINTING_AMOUNT = 1000;

    // Outcomes
    bytes32 public constant PLAYER_WINS = keccak256("PLAYER WINS");
    bytes32 public constant TIED_ROUND = keccak256("TIED ROUND");
    bytes32 public constant PLAYER_LOSES = keccak256("PLAYER LOSES");

    // Error constants
    uint private constant RANDOM_IN_PROGRESS = 8; // Random number is not available yet
    uint private constant ALREADY_VISITED = 9; // User has queried the result of the match before

    // Events
    event PlayerRoundStarted(
        uint indexed requestId,
        address indexed player
    );
    event ContractChoiceReady(
        uint indexed requestId,
        uint indexed randomChoice
    );
    event RoundOutcome(
        uint indexed requestId,
        bytes32 indexed contractChoice,
        bytes32 indexed result
    );

    constructor() {
        owner = msg.sender;

        // Set options
        _options[0] = ROCK;
        _options[1] = PAPER;
        _options[2] = SCISSORS;

        // Initial RPS Balance
        _mint(msg.sender, MINTING_AMOUNT);
    }

    function joinGame() public {
        require(
            msg.sender != owner,
            "Owner cannot be the player."
        );
        require(
            _userInitGame[msg.sender] != true,
            "You already have joined to the game."
        );
        _userInitGame[msg.sender] = true;

        // Give some tokens to the player
        if(balanceOf(msg.sender) == 0){
            _transfer(owner, msg.sender, COURTESY_AMOUNT);
        }
    }

    function play(
        bytes32 playerSelectedOption_
    ) public payable {
        require(
            _userInitGame[msg.sender] == true,
            "You have not joined to the game."
        );
        require(
            (playerSelectedOption_ == ROCK
            || playerSelectedOption_ == PAPER
            || playerSelectedOption_ == SCISSORS),
            "Invalid option."
        );
        if(balanceOf(owner) <= WIN_PAYING_AMOUNT) {
            _mint(owner, MINTING_AMOUNT);
        }
        _transfer(msg.sender, owner, COST_PER_GAME);

        // Request a random number
        uint requestId = super.requestRandomWords();
        _playerSelectedOption[requestId] = playerSelectedOption_;
        _randomRequestsResult[requestId] = RANDOM_IN_PROGRESS;

        emit PlayerRoundStarted(requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint randomOption = (randomWords[0] % 3) + 1; // Random can't be 0
        _randomRequestsResult[requestId] = randomOption;

        emit ContractChoiceReady(requestId, randomOption);
    }

    function queryOutcome(
        uint256 requestId
    ) public {
        require(
            _randomRequestsResult[requestId] != RANDOM_IN_PROGRESS,
            "Outcome not available yet."
        );
        require(
            _randomRequestsResult[requestId] != 0,
            "Request not found."
        );
        require(
            _randomRequestsResult[requestId] != ALREADY_VISITED,
            "The outcome for this match was queried before."
        );
        bytes32 playerSelectedOption_ = _playerSelectedOption[requestId];
        bytes32 contractChoice = _options[_randomRequestsResult[requestId] - 1]; // Options start from 0
        _randomRequestsResult[requestId] = ALREADY_VISITED;

        // Outcomes
        if(isAWinScenario(playerSelectedOption_, contractChoice)) { // User win
            _transfer(owner, msg.sender, WIN_PAYING_AMOUNT);
            emit RoundOutcome(requestId, contractChoice, PLAYER_WINS);
        }else if (playerSelectedOption_ == contractChoice){ // Tied match
            _transfer(owner, msg.sender, COST_PER_GAME);
            emit RoundOutcome(requestId, contractChoice, TIED_ROUND);
        }else {
            emit RoundOutcome(requestId, contractChoice, PLAYER_LOSES);
        }
    }

    function isAWinScenario(
        bytes32 playerSelectedOption_,
        bytes32 contractChoice
    ) private pure returns (bool){
        if(playerSelectedOption_ == PAPER && contractChoice == ROCK){
            return true;
        }else if(playerSelectedOption_ == SCISSORS && contractChoice == PAPER){
            return true;
        }else if (playerSelectedOption_ == ROCK && contractChoice == SCISSORS){
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
