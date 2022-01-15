var EtherVault = artifacts.require("./EtherVault.sol");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(EtherVault, [accounts[0]], [accounts[0]]);
};
