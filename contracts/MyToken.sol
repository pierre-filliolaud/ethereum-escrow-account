pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {

    event Msg(uint indexed orderId);

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

    function approve(address spender, uint256 amount) public  override returns (bool) {
        emit Msg(1);
        _approve(_txOrigin(), spender, amount);
        emit Approval(_txOrigin(), spender, amount);
        return true;
    }

    function test(address spender, uint256 amount) public  returns (bool) {
        emit Msg(1);
        return true;
    }

    function _txOrigin() internal view virtual returns (address payable) {
        return tx.origin;
    }
}