import { useState, useEffect } from 'react'
// Web3
import GameContract from "../contracts/Game.json";
import getWeb3 from "../getWeb3";
// Components
import Header from '../components/Header';
import Join from './steps/Join';
import Play from './steps/Play';

const GameBoard = () => {
  // App states
  const [walletIsConnected, setWalletIsConnected] = useState(false)
  const [userJoined, setUserJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Web3 utilities
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);

  // Game constants and methods
  const [balance, setBalance] = useState({
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
  const [tokensAmount, setTokensAmount] = useState(0)
  const [requestId, setRequestId] = useState(0)
  const [outcome, setOutcome] = useState({
    contractChoice: null,
    result: null
  })
  const [responseIsReady, setResponseIsReady] = useState(false)

  const connectWallet = async () => {
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
      setWalletIsConnected(true);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  const disconnectWallet = async () => {
    try {
      await game.finish().send({ from: accounts[0] })
      setWeb3(null);
      setContract(null);
      setAccounts(null);
      setUserJoined(false)
      setIsLoading(false)
      setWalletIsConnected(false);
      setResponseIsReady(false);
    } catch (error) {
      alert("Failed to disconnect wallet");
      console.error(error);
    }
  }

  const joinToTheGame = async () => {
    try {
      // Send call to joinGame()
      await game.join().send({ from: accounts[0] })
      const userTokens = await balance.of(accounts[0]).call();
      setTokensAmount(
        userTokens
      )
      setRequestId(0)
      setUserJoined(true)
    } catch (error) {
      alert("Failed to join to the game");
      console.error(error);
    }
  }

  const play = async (choice) => {
    try {
      // Send call to play()
      let startedOptions = {
        address: contract.options.address,
        topics: ['0xecf01b9e4905413823508f9f7ad0076b5c32c938440e79349a04f18860adee39'],
      }
      // const subs = web3.eth.subscribe('logs', startedOptions, (error, result) => {
      //   if (error) {
      //     console.error(error);
      //   }
      // })
      // .on("connected", event => {
      //   console.log('connected:',event);
      // })
      // .on("data", function(log){
      //   if(requestId === 0) {
      //     const reqId = log.topics[1]
      //     console.log('requestId:',reqId);
      //     setRequestId(reqId)
      //   }
      // })

      // Init listener
      contract.events.PlayerRoundStarted(startedOptions)
      .on('data', event => {
        console.log("RequestId no entro:", event.returnValues.requestId);
        if(requestId === 0) {
          setRequestId(event.returnValues.requestId)
          console.log("RequestId:", event.returnValues.requestId);
        }
      })
      .on('error', err => {throw err;})

      // When response is ready
      let readyOptions = {
        address: contract.options.address,
        topics: ['0xeb9ca182e0cd21b184dc949ba6d0b18a6450931e124f62d75da6a82cb34e6535'],
      }
      contract.events.ContractChoiceReady(readyOptions)
      .on('data', event => {
        if(!responseIsReady) {
          setResponseIsReady(true)
          console.log("ContractChoiceReady se ejecuto");
        }
      })

      // Get response
      let responseOptions = {
        address: contract.options.address,
        topics: ['0x2988c76f2fd447471aa2e03447292becd77f98ef25532544a5558f452fa2ab2c'],
      }
      contract.events.RoundOutcome(responseOptions)
      .on('data', async (event) => {
        console.log("RoundOutcome se ejecuto");
        let result;
        let contractChoice;
        switch (event.returnValues.result) {
          case outcomes.PLAYER_WINS:
            result = 'You win!';
            break;
          case outcomes.TIED_ROUND:
            result = 'Tie!';
            break;
          case outcomes.PLAYER_LOSES:
            result = 'You lose!';
            break;
          default:
            break;
        }
        switch (event.returnValues.contractChoice) {
          case options.ROCK:
            contractChoice = '🪨';
            break;
          case options.PAPER:
            contractChoice = '📄';
            break;
          case options.SCISSORS:
            contractChoice = '✂️';
            break;
          default:
            break;
        }
        setOutcome({
          contractChoice: contractChoice,
          result: result
        })
        const userTokens = await balance.of(accounts[0]).call();
        setTokensAmount(
          userTokens
        )
        setIsLoading(false)
        setTimeout(() => {
          setOutcome({
            contractChoice: null,
            result: null
          })
          setRequestId(0);
        }, 5000);
      })
      .on('error', err => {throw err;})
      if (choice === '🪨') {
        console.log("play:", options.ROCK);
        await game.play(options.ROCK).send({ from: accounts[0] })
      }else if (choice === '📄') {
        console.log("play:", options.PAPER);
        await game.play(options.PAPER).send({ from: accounts[0] })
      }else if (choice === '✂️') {
        console.log("play:", options.SCISSORS);
        await game.play(options.SCISSORS).send({ from: accounts[0] })
      }
      const userTokens = await balance.of(accounts[0]).call();
      setTokensAmount(
        userTokens
      )
      setIsLoading(true);
      // subs.unsubscribe(function(error, success){
      //   if(success){
      //     console.log('Successfully unsubscribed!');
      //   }
      // });
      // contract.events.PlayerRoundStarted(startedOptions)
      // .on('data', event => {
      //   console.log("RequestId no entro:", event.returnValues.requestId);
      //   if(requestId === 0) {
      //     setRequestId(event.returnValues.requestId)
      //     console.log("RequestId:", event.returnValues.requestId);
      //   }
      // })
      // .on('error', err => {throw err;})
      // Response is ready
      /* let eventOptions = {
        filter: {
          value: [],
        },
        fromBlock: 0
      }
      contract.events.ContractChoiceReady(eventOptions)
      .on('data', async () => {
        try {
          await game.queryOutcome(requestId).send({ from: accounts[0] })
        } catch (error) {
          console.log(error);
        }
      })
      .on('error', err => {throw err;})
      // Get result
      contract.events.RoundOutcome(eventOptions)
      .on('data', async (event) => {
        let result;
        let contractChoice;
        switch (event.returnValues.result) {
          case outcomes.PLAYER_WINS:
            result = 'You win!';
            break;
          case outcomes.TIED_ROUND:
            result = 'Tie!';
            break;
          case outcomes.PLAYER_LOSES:
            result = 'You lose!';
            break;
          default:
            break;
        }
        switch (event.returnValues.contractChoice) {
          case options.ROCK:
            contractChoice = '🪨';
            break;
          case options.PAPER:
            contractChoice = '📄';
            break;
          case options.SCISSORS:
            contractChoice = '✂️';
            break;
          default:
            break;
        }
        setOutcome({
          contractChoice: contractChoice,
          result: result
        })
        const userTokens = await balance.of(accounts[0]).call();
        setTokensAmount(
          userTokens
        )
        setIsLoading(false)
        setTimeout(() => {
          setOutcome({
            contractChoice: null,
            result: null
          })
          setRequestId(0);
        }, 5000);
      })
      .on('error', err => {throw err;}) */
    } catch (error) {
      alert("Failed to play");
      console.error(error);
    }
  }

  const query = async (requestId) => {
    try {
      const result = await game.queryOutcome(requestId).send({ from: accounts[0] });
      console.log(result);
      const userTokens = await balance.of(accounts[0]).call();
      setTokensAmount(
        userTokens
      )
      setIsLoading(false)
      setResponseIsReady(false)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const setGameConstants = async () => {
      if (contract && contract.methods) {
        try {
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
        } catch (error) {
          console.error(error);
        }
      }
    }
    setGameConstants();
  }, [contract]);

  useEffect(() => {
    const getResponse = async () => {
      if (requestId !== 0 && responseIsReady) {
        try {
          const result = await game.queryOutcome(requestId).send({ from: accounts[0] });
          console.log(result);
          const userTokens = await balance.of(accounts[0]).call();
          setTokensAmount(
            userTokens
          )
          setIsLoading(false)
          setResponseIsReady(false)
        } catch (error) {
          console.error(error);
        }
      }
    }
    getResponse();
  }, [responseIsReady, accounts, requestId, game, balance]);


  const getContent = () => {
    if (walletIsConnected && userJoined) {
      return <Play
        isLoading={isLoading}
        playGame={play}
        tokensAmount={tokensAmount}
        outcome={outcome}
        query={query}
      />
    }
    return <Join
      joinToTheGame={joinToTheGame}
      walletIsConnected={walletIsConnected}
    />
  }

  return (
    <>
      <Header
        walletIsConnected={walletIsConnected}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />
      <main className='flex justify-center '>
        <div className="container w-full max-w-3xl p-4 text-slate-900">
          {getContent()}
        </div>
      </main>
    </>
  )
}

export default GameBoard