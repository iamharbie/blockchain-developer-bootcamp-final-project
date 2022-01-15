import React, { useEffect, useState } from "react";
import EtherVaultContract from "./contracts/EtherVault.json";
import getWeb3 from "./getWeb3";
import { Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";

const TIMEOUT = 5000;

const EtherVaultUI = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [amount, setAmount] = useState(null);
  const [transactionPending, setTransactionPending] = useState(false);
  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState(null);
  const [error, setError] = useState(null);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [etvBalance, setEtvBalance] = useState(0);

  useEffect(() => {
    async function initialize() {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = EtherVaultContract.networks[networkId];
        const instance = new web3.eth.Contract(
          EtherVaultContract.abi,
          deployedNetwork && deployedNetwork.address,
          {
            from: accounts[0],
          }
        );

        instance.events.VaultActivated().on("data", function (event) {
          console.log(event); // same results as the optional callback above
          setTransactionPending(false);
          setIsTransactionSuccessful(true);

          setTimeout(() => setIsTransactionSuccessful(null), TIMEOUT);
        });

        instance.events.VaultLiquidated().on("data", function (event) {
          console.log(event); // same results as the optional callback above
          setTransactionPending(false);

          setIsTransactionSuccessful(true);

          setTimeout(() => setIsTransactionSuccessful(null), TIMEOUT);
        });

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        // setInitData({ web3, });
        setWeb3(web3);
        setAccounts(accounts);
        setContract(instance);
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    }
    initialize();
  }, []);

  useEffect(() => {
    if (!web3 || !accounts || !contract) return;
    getVaultBalance();
    getEtvBalance();
  });

  // Notification to user that transaction is pending
  const SuccessAlert = () => {
    if (!isTransactionSuccessful) return null;
    return (
      <Alert
        key="pending"
        variant="primary"
        style={{ position: "absolute", top: 0 }}
      >
        Transaction successfully completed
      </Alert>
    );
  };

  const PendingAlert = () => {
    if (!transactionPending) return null;
    return (
      <Alert
        key="pending"
        variant="info"
        style={{ position: "absolute", top: 0 }}
      >
        Please confirm transaction to add to queue
      </Alert>
    );
  };

  const ErrorAlert = () => {
    if (!error) return null;
    return (
      <Alert
        key="error"
        variant="danger"
        style={{ position: "absolute", top: 0 }}
      >
        {error}
      </Alert>
    );
  };

  const getVaultBalance = async () => {
    const balance = await contract.methods.vaultBalance().call();
    setVaultBalance(web3.utils.fromWei(balance));
  };

  const getEtvBalance = async () => {
    const balance = await contract.methods.balanceOf(accounts[0]).call();
    setEtvBalance(web3.utils.fromWei(balance));
  };

  const activateVault = async (etherAmount) => {
    const weiAmount = web3.utils.toWei(etherAmount);

    contract.methods
      .activateVault()
      .send({ from: accounts[0], value: weiAmount })
      .on("receipt", function (receipt) {
        console.log(receipt);
      })
      .on("error", function (error, receipt) {
        setTransactionPending(false);
        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        setError("An Error Occured, Please try again!");
        setTimeout(() => setError(null), TIMEOUT);
        console.log(error);
        console.log(receipt);
      });
  };

  const liquidateVault = async (etherAmount) => {
    const weiAmount = web3.utils.toWei(etherAmount);

    contract.methods
      .liquidateVault(weiAmount)
      .send({ from: accounts[0] })
      .on("error", function (error, receipt) {
        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        setError("Insufficient ether balance");
        setTimeout(() => setError(null), TIMEOUT);
        console.log(error);
        console.log(receipt);
      });
  };

  const onInputChanged = (event) => {
    const value = event.target.value;
    if (value < 0) return;
    setAmount(event.target.value);
  };

  const handleSaveClicked = (event) => {
    event.preventDefault();
    setTransactionPending(true);
    setTimeout(() => setTransactionPending(false), TIMEOUT);
    activateVault(amount);
  };

  const handleWithdrawClicked = (event) => {
    event.preventDefault();
    setTransactionPending(true);
    setTimeout(() => setTransactionPending(false), TIMEOUT);
    liquidateVault(amount);
  };

  return !web3 ? (
    <div>Loading Web3, accounts, and contract...</div>
  ) : (
    <div className="App">
      <header className="App-header">
        <PendingAlert />
        <ErrorAlert />
        <SuccessAlert />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/512px-Ethereum-icon-purple.svg.png"
          className="App-logo"
          alt="Ethereum logo"
        />

        <h1>EtherVault!</h1>
        <p>You have {vaultBalance} ETH saved in vault</p>
        <p>You currently have {etvBalance} ETV token</p>

        <input
          name="amount"
          type="number"
          placeholder="Please enter ether amount to dep or withdraw"
          min="0"
          onChange={onInputChanged}
        />
        <Button onClick={handleSaveClicked} variant="primary">
          Save
        </Button>
        <Button onClick={handleWithdrawClicked} variant="secondary">
          Withdraw
        </Button>
      </header>
    </div>
  );
};

export default EtherVaultUI;
