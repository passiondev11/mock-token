const {BN} = require('@openzeppelin/test-helpers');

const MUSDT = artifacts.require("MUSDT");

const initialSupply = new BN(100000).mul(new BN(10).pow(new BN(18)));

async function deployContracts(deployer) {

  const deployerAddress = deployer.provider.addresses;
  const musdt = await deployer.deploy(MUSDT, initialSupply, deployerAddress[0]);
  
}

module.exports = function (deployer) {
  deployer.then(async () => {
    console.log(deployer.network);
    switch (deployer.network) {
      case 'development':
      case 'rinkeby':
      case 'ropsten':
        await deployContracts(deployer);
        break;
      case 'kovan':
        await deployContracts(deployer);
        break;
      case 'mainnet':
      case 'mainnet-fork':
        await deployContracts(deployer);
        break;
      default:
        throw ("Unsupported network");
    }
  }) 
};