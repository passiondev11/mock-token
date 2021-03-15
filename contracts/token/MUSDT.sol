pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "../library/MinterRole.sol";

contract MUSDT is MinterRole, ERC20Burnable  {

    constructor(uint256 _initalSupply, address _treasuryAddress) 
    ERC20("Mock USDT", "MUSDT")
    public  
    { 
        _mint(_treasuryAddress, _initalSupply);
    }

    /**
     * return See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the {MinterRole}.
     */
    function mint(address account, uint256 amount) public onlyMinter returns (bool) {
        _mint(account, amount);
        return true;
    }
}
