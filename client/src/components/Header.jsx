import Button from "./Button"

const Header = ({ connectWallet, disconnectWallet, walletIsConnected }) => {

  return (
    <header className="w-full my-4 flex justify-center">
      <div className="container flex justify-end max-w-3xl">
      {!walletIsConnected ?
        (<Button className="font-body font-medium text-lg animate-bounce" onClick={connectWallet}>
          Connect Wallet
        </Button>)
        : (<Button className="font-body font-medium text-lg" onClick={disconnectWallet}>
          Disconnect
        </Button>
      )}
      </div>
    </header>
  )
}

export default Header
