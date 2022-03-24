const options = {
  ROCK: null,
  PAPER: null,
  SCISSORS: null,
}
const outcomes = {
  PLAYER_WINS: null,
  TIED_ROUND: null,
  PLAYER_LOSES: null,
}

const initGameConstants = async (contract) => {
  if(!contract) return;

  options.ROCK = await contract.methods.ROCK().call()
  options.PAPER = await contract.methods.PAPER().call()
  options.SCISSORS = await contract.methods.SCISSORS().call()

  outcomes.PLAYER_WINS = await contract.methods.PLAYER_WINS().call()
  outcomes.TIED_ROUND = await contract.methods.TIED_ROUND().call()
  outcomes.PLAYER_LOSES = await contract.methods.PLAYER_LOSES().call()
}

const emojiToBytes32 = (emoji) => {
  let emojiString = ''
  switch (emoji) {
    case '🪨':
      emojiString = options.ROCK
      break;
    case '📄':
      emojiString = options.PAPER
      break;
    case '✂️':
      emojiString = options.SCISSORS
      break;
    default:
      break;
  }
  return emojiString
}

const resultBytes32ToString = (result) => {
  let resultString = ''
  switch (result) {
    case outcomes.PLAYER_WINS:
      resultString = 'You win!';
      break;
    case outcomes.TIED_ROUND:
      resultString = 'Tie!';
      break;
    case outcomes.PLAYER_LOSES:
      resultString = 'You lose!';
      break;
    default:
      break;
  }
  return resultString
}

const bytes32ToEmoji = (option) => {
  let emoji = ''
  switch (option) {
    case options.ROCK:
      emoji = '🪨';
      break;
    case options.PAPER:
      emoji = '📄';
      break;
    case options.SCISSORS:
      emoji = '✂️';
      break;
    default:
      break;
  }
  return emoji
}

export {
  outcomes,
  initGameConstants,
  emojiToBytes32,
  resultBytes32ToString,
  bytes32ToEmoji,
}