// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Ppt is ERC20("Piedra-Papel-Tijera Token", "PPT") {

    constructor() {
        _mint(msg.sender, 10000000);
    }
}
