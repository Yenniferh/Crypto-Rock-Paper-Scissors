import getWeb3 from "./getWeb3";
import GameContract from "../contracts/Game.json";

const getGameContract = () =>
  new Promise(async (resolve, reject) => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      if (networkId !== 4) {
        throw new Error("Network not supported");
      }
      const deployedNetwork = GameContract.networks[networkId];
      const instance = new web3.eth.Contract(
        GameContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      resolve({ web3, accounts, contract: instance });
    } catch (error) {
      reject(error);
    }
  });

export default getGameContract;
