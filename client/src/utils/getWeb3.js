import Web3 from "web3";

const getWeb3 = () =>
  new Promise(async (resolve, reject) => {
    // Modern dapp browsers...
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Accounts now exposed
        resolve(web3);
      } catch (error) {
        reject(error);
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      // Use Mist/MetaMask's provider.
      const web3 = window.web3;
      console.log("Injected web3 detected.");
      resolve(web3);
    }
    // Fallback to localhost; use dev console port by default...
    else {
      const providerDevelop = new Web3.providers.HttpProvider(
        "http://127.0.0.1:8545"
      );
      const web3 = new Web3(providerDevelop);
      if (web3.isConnected()) {
        console.log("No web3 instance injected, using Local web3.");
        resolve(web3);
      } else {
        const providerGanache = new Web3.providers.HttpProvider(
          "http://127.0.0.1:7545"
        );
        const web3Ganache = new Web3(providerGanache);
        if (web3Ganache.isConnected()) {
          console.log("Local web3 instance not connected, using Ganache.");
          resolve(web3Ganache);
        }
      }
    }
  });

export default getWeb3;
