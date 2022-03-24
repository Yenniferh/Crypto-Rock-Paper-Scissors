import { useState } from 'react'
import web3Instance from '../utils/getGameContract';
// Components
import Header from '../components/Header';
import Join from './steps/Join';
import Play from './steps/Play';

const GameBoard = () => {
  // App states
  const [walletIsConnected, setWalletIsConnected] = useState(false)
  const [userJoined, setUserJoined] = useState(false)

  // Web3 utilities
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);


  const connectWallet = () => {
    web3Instance().then(({ web3, accounts, contract }) => {
      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
      if (web3 && accounts && contract) {
        setWalletIsConnected(true)
      }
    }).catch(error => {
      if (error.message === "Network not supported") {
        alert("Please connect to the Rinkeby test network");
      }else {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    });
  }


  const disconnectWallet = async () => {
    try {
      await contract.methods.finishGame().send({ from: accounts[0] })
      localStorage.removeItem('userJoined')
      setWeb3(null);
      setAccounts(null);
      setContract(null);
      setUserJoined(false)
      setWalletIsConnected(false);
    } catch (error) {
      alert("Failed to disconnect wallet");
      console.error(error);
    }
  }


  const getContent = () => {
    if (walletIsConnected && userJoined) {
      return <Play
        web3={web3}
        contract={contract}
        accounts={accounts}
      />
    }
    return <Join
      contract={contract}
      accounts={accounts}
      setUserJoined={setUserJoined}
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