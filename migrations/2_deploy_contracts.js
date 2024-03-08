var EthereumCashCoin = artifacts.require("./contracts/EthereumCashCoin.sol");
var EthereumCashCoinMultiSigWallet = artifacts.require("./contracts/EthereumCashCoinMultiSigWallet.sol");
var EthereumCashCoinMultiSigWalletWithMint = artifacts.require("./contracts/EthereumCashCoinMultiSigWalletWithMint.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(EthereumCashCoin, 'EthereumCash', 'EthereumCashCoin', accounts[0], accounts[1], accounts[2]).then( () => {
    console.log(`EthereumCashCoin deployed: address = ${EthereumCashCoin.address}`);

    deployer.
      deploy(EthereumCashCoinMultiSigWallet, [accounts[0], accounts[1], accounts[2]], 2, EthereumCashCoin.address,
          "vault multisig wallet");

      deployer.
      deploy(EthereumCashCoinMultiSigWalletWithMint, [accounts[0], accounts[1], accounts[2]], 2, EthereumCashCoin.address,
          "vault multisig wallet with mint");

  });
};
