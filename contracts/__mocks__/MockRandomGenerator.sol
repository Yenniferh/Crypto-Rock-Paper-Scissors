//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract MockRandomGenerator {
    uint internal requestIdCounter = 3000;
    uint256 internal random = 0;

    function setRandom(uint random_) external {
        random = random_;
    }

    function requestRandomWords()
    internal returns (uint256) {
        requestIdCounter++;
        return requestIdCounter;
    }

    function rawFulfillRandomWords(
        uint256 requestId
    ) internal {
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = random;
        fulfillRandomWords(requestId, randomWords);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal virtual;
}
