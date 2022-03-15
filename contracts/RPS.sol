// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RPS is ERC20("Rock-Paper-Scissors Token", "RPS"){

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

}
