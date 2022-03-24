import { useState, useEffect } from 'react'
import Button from '../../components/Button'
import Loader from '../../components/Loader'

import {
  outcomes,
  initGameConstants,
  emojiToBytes32,
  resultBytes32ToString,
  bytes32ToEmoji
} from '../../utils/game.js'


const Play = ({
  web3,
  contract,
  accounts,
}) => {
  // State
  const [requestId, setRequestId] = useState(0)
  const [responseIsReady, setResponseIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [outcome, setOutcome] = useState({
    contractChoice: null,
    result: null
  })
  const [tokensBalance, setTokensBalance] = useState(0)

  const [userDisplay, setUserDisplay] = useState('')


  useEffect(() => {
    if(!contract || !web3) return;

    const ContractChoiceReadyOptions = {
      address: contract.options.address,
      topics: [
        '0xeb9ca182e0cd21b184dc949ba6d0b18a6450931e124f62d75da6a82cb34e6535',
      ],
    }
    const ContractChoiceReadySuscription = 
      web3.eth.subscribe(
        'logs',
        ContractChoiceReadyOptions,
        (error, _) => {
          if (error) {
            console.error(error);
          }
      })
      .on("data", function(log){
        setResponseIsReady(true)
        setRequestId(log.topics[1])
      })
      .on('error', err => console.log(err))

    return () => ContractChoiceReadySuscription &&
      ContractChoiceReadySuscription.unsubscribe((error, _) => {
        if(error){
          console.log('Suscription got error:', error);
        }
      })
  }, [contract, web3, requestId])

  useEffect(() => {
    const getTokensBalance = async () => {
      if(!contract || !accounts) return;
      const balance = await contract.methods.balanceOf(accounts[0]).call()
      setTokensBalance(balance)
    }
    getTokensBalance()
  }, [contract, accounts, outcome.result])

  useEffect(() => {
    if(!contract) return;
    initGameConstants(contract)
  }, [contract])

  useEffect(() => {
    const getResponse = async () => {
      // if no pending request or is not ready or was already set
      if (requestId === 0 || !responseIsReady || !contract) return;

      try {
        const response = await contract.methods.queryOutcome(requestId).send({ from: accounts[0] });

        const contractChoice = bytes32ToEmoji(
          response.events.RoundOutcome.returnValues.contractChoice
        )
        const result = resultBytes32ToString(
          response.events.RoundOutcome.returnValues.result
        )
        setOutcome({
          contractChoice: contractChoice,
          result: result
        })
        setIsLoading(false)
        setTimeout(() => {
          setOutcome({
            contractChoice: null,
            result: null
          })
          setRequestId(0);
          setResponseIsReady(false);
        }, 5000);
      } catch (error) {
        console.error(error);
      }
    }

    getResponse();
  }, [responseIsReady, accounts, requestId, contract]);

  useEffect(() => {
    if(outcome.result) return;
    setUserDisplay('')
  }, [outcome.result])


  // Funcions
  const handleClick = async (choice) => {
    if(!contract || !accounts) return;
    try {
      setUserDisplay(choice)
      setIsLoading(true)
      await contract.methods.play(
        emojiToBytes32(choice)
      ).send({ from: accounts[0] })
      const balance = await contract.methods.balanceOf(accounts[0]).call()
      setTokensBalance(balance)
    } catch (error) {
      console.error(error);
    }
  }

  let robotDisplay = ''
  let resultColor = 'text-slate-900'
  if(outcome.result && outcome.contractChoice){
    robotDisplay = outcome.contractChoice
    if(outcome.result === resultBytes32ToString(outcomes.PLAYER_WINS)){
      resultColor = 'text-green-500'
    } else if(outcome.result === resultBytes32ToString(outcomes.TIED_ROUND)){
      resultColor = 'text-slate-600'
    } else if(outcome.result === resultBytes32ToString(outcomes.PLAYER_LOSES)){
      resultColor = 'text-red-500'
    }
  } 

  return (
    <>
      <div className='max-w-md sm:grid sm:grid-cols-2 sm:mx-auto'>
        <span className='bg-green-200 font-body text-sm text-slate-900 py-2 px-6 rounded-lg sm:col-span-2 justify-self-end'>
          {tokensBalance} RPS
        </span>
        <h2 className='font-display uppercase text-xl font-bold my-4 '>
          You
        </h2>
        <p className='w-36 h-36 mx-auto py-6 text-8xl sm:row-start-3 text-center'>
          {userDisplay}
        </p>
        <h2 className='font-display uppercase text-xl font-bold my-4 '>
          Robot
        </h2>
        <p className='w-36 h-36 mx-auto py-6 text-8xl sm:row-start-3 text-center'>
          {isLoading ? (
            <Loader />
          ) : robotDisplay}
        </p>
      </div>
      {outcome && (
        <p className={`max-w-md font-body text-xl font-medium text-center my-6 mx-auto ${resultColor}`}>
          {outcome.result}
        </p>
      )}
      <h2 className='font-display font-semibold text-2xl text-center mb-3'>Select an option</h2>
      <div className='flex flex-col gap-2'>
        <Button
          onClick={() => handleClick('🪨')}
          className='font-display font-extrabold py-0.5 text-xl w-full uppercase hover:border-2 rounded-lg max-w-md block mx-auto'
        >
          Rock
        </Button>
        <Button
          onClick={() => handleClick('📄')}
          className='font-display font-extrabold py-0.5 text-xl w-full uppercase hover:border-2 rounded-lg max-w-md block mx-auto'
        >
          Paper
        </Button>
        <Button
          onClick={() => handleClick('✂️')}
          className='font-display font-extrabold py-0.5 text-xl w-full uppercase hover:border-2 rounded-lg max-w-md block mx-auto'
        >
          Scissors
        </Button>
      </div>
    </>
  )
}

export default Play