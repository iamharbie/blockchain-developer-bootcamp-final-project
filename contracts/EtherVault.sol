// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title A vault to safely keep ether and issue a corresponding ERC20 token
/// @author Abdul-Azeez Lawal
contract EtherVault is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    //May be better to use oracle if this is deployed to mainnet
    uint256 public rate = 10;
    mapping(address => uint256) private vault;

    constructor(address[] memory minters, address[] memory burners)
        ERC20("Vault", "ETV")
    {
        for (uint256 i = 0; i < minters.length; ++i) {
            _setupRole(MINTER_ROLE, minters[i]);
        }

        for (uint256 i = 0; i < burners.length; ++i) {
            _setupRole(BURNER_ROLE, burners[i]);
        }
    }

    event VaultActivated(address indexed accountAddress, uint256 weiAmount);
    event VaultLiquidated(address indexed accountAddress, uint256 weiAmount);

    /// @notice check if an address has enough wei balance
    /// @param accountAddress is the address of the account
    /// @param amount is the wei amount to validate
    modifier hasEtherInVault(address accountAddress, uint256 amount) {
        require(vault[accountAddress] >= amount, "Insufficient ether balance");
        _;
    }

    /// @notice receive wei and send corresponding ETV to the sender
    function activateVault() external payable {
        vault[msg.sender] += msg.value;

        //send Vault Token
        uint256 vaultToken = msg.value * rate;
        _mint(msg.sender, vaultToken);

        emit VaultActivated(msg.sender, msg.value);
    }

    /// @notice Use to withdraw ether saved in the vault
    /// @param amount provided is expect to be the wei amount to withdraw
    function liquidateVault(uint256 amount)
        public
        payable
        hasEtherInVault(msg.sender, amount)
    {
        vault[msg.sender] -= amount;

        transfer(address(this), amount * rate);

        (bool sent, ) = msg.sender.call{value: amount}("");

        require(sent, "Failed transfer");

        emit VaultLiquidated(msg.sender, amount);
    }

    /// @notice check the balance of caller
    /// @return wei balance of the account
    function vaultBalance() external view returns (uint256) {
        return vault[msg.sender];
    }

    /// @notice check the balance of the provided account
    /// @param accountAddress is the account to check vault balance of
    /// @return wei balance of the account
    function vaultBalanceOf(address accountAddress)
        external
        view
        returns (uint256)
    {
        return vault[accountAddress];
    }

    /// @notice check the ether balance of the contrace
    /// @return wei balance of the contract
    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice mints the vaults token to a specified address
    /// @param to is the account to mint to
    /// @param amount it the amount of ETV to mint
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        // Only minters can mint
        _mint(to, amount);
    }

    /// @notice burn the  vault token at a specified address
    /// @param from is the account to burn from
    /// @param amount it the amount of ETV to mint
    function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {
        // Only burners can burn
        _burn(from, amount);
    }
}
