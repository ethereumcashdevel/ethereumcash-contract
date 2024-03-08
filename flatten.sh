#!/bin/zsh
truffle-flattener contracts/EthereumCashCoin.sol > EthereumCashCoin.flatten.sol
truffle-flattener contracts/EthereumCashCoinMultiSigWallet.sol > EthereumCashCoinMultiSigWallet.flatten.sol
