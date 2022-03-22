import React from 'react'
import Button from '../../components/Button'

const Join = ({joinToTheGame, walletIsConnected}) => {
  return (
    <>
      <h1 className='font-display uppercase text-3xl font-bold text-center mt-2 mb-56 '>
        Rock, Paper,
        <br />
        Scissors
      </h1>
      <h2 className='font-display font-semibold text-2xl text-center mb-3'>How it works?</h2>
      <p className='font-body font-light text-lg max-w-md mx-auto mb-4'>
        Connect your wallet, play Rock Paper Scissors and earn RPS tokens. Test Ether needed.
      </p>
      <Button 
        onClick={joinToTheGame}
        className='font-display font-extrabold text-xl w-full uppercase hover:border-2 rounded-lg max-w-md block mx-auto disabled:bg-slate-400'
        disabled={!walletIsConnected}
      >
        Join
      </Button>
    </>
  )
}

export default Join