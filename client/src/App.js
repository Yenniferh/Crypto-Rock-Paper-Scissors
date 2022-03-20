import React, { useState, useEffect } from "react";
import GameContract from "./contracts/Game.json";
import getWeb3 from "./getWeb3";

import "./App.css";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance , setBalance] = useState({
    WIN_PAYING_AMOUNT: null,
    COST_PER_GAME: null,
    of: null,
  });
  const [game, setGame] = useState({
    join: null,
    play: null,
    queryOutcome: null,
    finish: null,
  });
  const [options, setOptions] = useState({
    ROCK: null,
    PAPER: null,
    SCISSORS: null,
  });
  const [outcomes, setOutcomes] = useState({
    PLAYER_WINS: null,
    TIED_ROUND: null,
    PLAYER_LOSES: null,
  });

  useEffect(() => {
    const init = async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        if (web3) {
          console.log("web3:", web3);
        }
  
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
  
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        if (networkId !== 4) {
          alert("Please connect to the Rinkeby test network");
          return;
        }
        const deployedNetwork = GameContract.networks[networkId];
        const instance = new web3.eth.Contract(
          GameContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
  
        // Set web3, accounts, and contract to the state
        setWeb3(web3);
        setAccounts(accounts);
        setContract(instance);
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const setGameConstants = async () => {
      if(contract && contract.methods) {
        const methods = await contract.methods;
        setBalance({
          WIN_PAYING_AMOUNT: await methods.WIN_PAYING_AMOUNT().call(),
          COST_PER_GAME: await methods.COST_PER_GAME().call(),
          of: await methods.balanceOf,
        });
        setGame({
          join: await methods.joinGame,
          play: await methods.play,
          queryOutcome: await methods.queryOutcome,
          finish: await methods.finishGame,
        });
        setOptions({
          ROCK: await methods.ROCK().call(),
          PAPER: await methods.PAPER().call(),
          SCISSORS: await methods.SCISSORS().call(),
        });
        setOutcomes({
          PLAYER_WINS: await methods.PLAYER_WINS().call(),
          TIED_ROUND: await methods.TIED_ROUND().call(),
          PLAYER_LOSES: await methods.PLAYER_LOSES().call(),
        });
      }
    }

    setGameConstants();
  }, [contract]);
  const getBalance = async () => {
    const response = await balance.of(accounts[0]).call();

    alert(`Your balance is ${response}`);
  };

  if (!web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div className="App">
      <h1>Good to Go!</h1>
      <p>Your Truffle Box is installed and ready.</p>
      <h2>Smart Contract Example</h2>
      <p>
        If your contracts compiled and migrated successfully, below will show
        a stored value of 5 (by default).
      </p>
      <p>
        Try changing the value stored on <strong>line 42</strong> of App.js.
      </p>
      <button onClick={getBalance}>Get balance</button>
    </div>
  );
}

export default App;
