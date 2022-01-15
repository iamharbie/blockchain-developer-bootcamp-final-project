const EtherVault = artifacts.require("./EtherVault.sol");
const truffleAssert = require("truffle-assertions");

contract("EtherVault, on activation", (accounts) => {
  it("should save sent ether for activated account ", async () => {
    const etherVaultInstance = await EtherVault.deployed();
    const etherAmount = web3.utils.toWei("2");

    await etherVaultInstance.activateVault({ value: etherAmount });

    const savedEthAmount = await etherVaultInstance.vaultBalance.call();
    assert.equal(
      etherAmount,
      savedEthAmount,
      "Saved ether not equal to sent ether"
    );
  });

  it("should should emit event when vault is activated", async () => {
    const etherVaultInstance = await EtherVault.deployed();
    const etherAmount = web3.utils.toWei("2");

    const tx = await etherVaultInstance.activateVault({ value: etherAmount });

    truffleAssert.eventEmitted(tx, "VaultActivated");
  });
});

contract("EtherVault, is expected to", (accounts) => {
  it("should send corresponding ETV token to activated account ", async () => {
    const etherVaultInstance = await EtherVault.deployed();
    const etherAmount = web3.utils.toWei("2");

    await etherVaultInstance.activateVault({ value: etherAmount });

    const etvBalance = await etherVaultInstance.balanceOf(accounts[0]);
    const rate = await etherVaultInstance.rate.call();

    assert.equal(
      etherAmount * rate,
      etvBalance,
      "ETV balance should be" + etherAmount * rate
    );
  });
});

contract("EtherVault, on liquidation", (accounts) => {
  let etherVaultInstance;

  beforeEach(async () => {
    etherVaultInstance = await EtherVault.deployed();
    const etherAmount = web3.utils.toWei("2");
    await etherVaultInstance.activateVault({ value: etherAmount });
  });

  it("should withdraw corresponding ETV token from account when liquidated", async () => {
    const startingEtvBalance = await etherVaultInstance.balanceOf(accounts[0]);
    const rate = await etherVaultInstance.rate.call();

    const amountToBeLiquidated = web3.utils.toWei("1");

    await etherVaultInstance.liquidateVault(amountToBeLiquidated);

    const currentEtvBalance = await etherVaultInstance.balanceOf(accounts[0]);

    assert.equal(
      startingEtvBalance - amountToBeLiquidated * rate,
      currentEtvBalance,
      "ETV balance should be" + startingEtvBalance - amountToBeLiquidated * rate
    );
  });

  it("should should throw when amount to be liquidated > saved amount", async () => {
    const amountToBeLiquidated = web3.utils.toWei("3");

    try {
      await etherVaultInstance.liquidateVault(amountToBeLiquidated);
    } catch (ex) {
      expect(err.message).to.contain("Insufficient ether balance");
    }
  });

  it("should should emit event when vault is liquidated", async () => {
    const amountToBeLiquidated = web3.utils.toWei("1");

    const tx = await etherVaultInstance.liquidateVault(amountToBeLiquidated);

    truffleAssert.eventEmitted(tx, "VaultLiquidated");
  });
});

contract("EtherVault, while attempting to mint token", (accounts) => {
  it("should mint token to caller caller address", async () => {
    const etherVaultInstance = await EtherVault.deployed();

    const ETV = 2;

    await etherVaultInstance.mint(accounts[0], ETV);

    const currentEtvBalance = await etherVaultInstance.balanceOf(accounts[0]);

    assert.equal(
      ETV,
      currentEtvBalance,
      "ETV balance should be 2 after minting "
    );
  });

  it("should ensure only accounts with MINTER_ROLE can mint", async () => {
    let etherVaultInstance = await EtherVault.deployed();
    const minter = accounts[4];

    try {
      await etherVaultInstance.mint(minter, 2, { from: minter });
    } catch (ex) {
      expect(ex.message).to.contain(
        `account ${minter.toLowerCase()} is missing role`
      );
    }
  });
});

contract("EtherVault, while attempting to burn token", (accounts) => {
  it("should ensure only accounts with BURNER_ROLE can mint", async () => {
    let etherVaultInstance = await EtherVault.deployed();
    const burner = accounts[4];

    try {
      await etherVaultInstance.burn(burner, 2, { from: burner });
    } catch (ex) {
      expect(ex.message).to.contain(
        `account ${burner.toLowerCase()} is missing role`
      );
    }
  });
});
