# Final Project - EtherVault

On EtherVault, users would be able to swap their ether for an ERC20 Token (ETV token). This could help safeguard in a vault while they can use the provided ETV token for any other thing.

They could return the provided ETV token at a later time to retreive their original ether.

## Live Site

[EtherVault](https://ether-vault-ui.herokuapp.com/)

## Walkthrough Video

[Walkthrough of EtherVault](https://drive.google.com/file/d/1OXSgS4RxXtltmrhWlAP8mFi3DikYoeey/view?usp=sharing)

## To Run Locally

### Prerequisites

- Node.js >= v14
- ganache/ganache-cli
- truffle
- Yarn
- `git@github.com:iamharbie/blockchain-developer-bootcamp-final-project.git`

### Backend

- Run `yarn install` to download project dependencies
- In a console window, run `ganache-cli` and ensure it can accept connections on port `8545`
- In another console, compile and deploy the contract by running `truffle compile && truffle migrate`.

### Frontend

- Change directory to client where the front end code reside using `cd client`
- Run `yarn install` to download the frontend dependencies
- Run `yarn start` to build and run the front code on `http://localhost:3000`

## To Run Tests

Ensure ganache or ganache-cli is running and run `truffle test`
