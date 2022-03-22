import { useState, useEffect } from 'react'
import Button from '../../components/Button'
import { ReactComponent as LoadingIcon} from '../../assets/loader.svg'

const Play = ({ isLoading, playGame, tokensAmount, outcome, query }) => {
  const [userDisplay, setUserDisplay] = useState('')
  const [robotDisplay, setRobotDisplay] = useState('')
  const [input, setInput] = useState('')

  const handleClick = async (choice) => {
    setUserDisplay(choice)
    playGame(choice)
  }

  useEffect(() => {
    if (outcome) {
      setRobotDisplay(outcome.contractChoice)
    }
  }, [outcome])

  const handleChange = (e) => {
    setInput(e.target.value)
  }

  return (
    <>
      <div className='max-w-md sm:grid sm:grid-cols-2 sm:mx-auto'>
        <span className='bg-green-200 font-body text-sm text-slate-900 py-2 px-6 rounded-lg sm:col-span-2 justify-self-end'>
          {tokensAmount} RPS
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
            <svg className="animate-spin h-20 w-20 text-green-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          ) : robotDisplay}
        </p>
      </div>
      {outcome && (
        <p className='max-w-md font-body text-xl font-medium'>
          {outcome.result}
        </p>
      )}
      {isLoading && (
        <>
          <input type='text' className='' value={input} onChange={handleChange} />
          <Button onClick={() => query(input)}>Send</Button>
        </>
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