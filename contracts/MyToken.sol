pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {

    event Msg(uint indexed orderId);
    address escrowAddress;

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) public ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function initEscrowAddress(address _escrowAddress) public onlyOwner {
        escrowAddress = _escrowAddress;
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        require(escrowAddress != address(0), "Escrow address must be initialized");
        require(msg.sender == escrowAddress, "Wrong Escrow address used");
        _approve(_txOrigin(), spender, amount);
        return true;
    }

    function _txOrigin() internal view virtual returns (address payable) {
        return tx.origin;
    }
}