# ethereum-escrow-account

# Escrow scenario

Transfer ERC20 from A to B:

In order to transfer tokens from account A to account B using Contract C you would need to do the following:

From A call the ERC20 function approve(address _spender, uint256 _value) and pass the address of C as spender, plus the amount he is allowed to send. This would tell the Token Contract that your contract C is allowed to transfer the specified amount from your address A.
From C call the ERC20 function transferFrom(address _from, address _to, uint256 _value). Passing in from: A.address and to: B.address


# Testing command
```
truffle test --show-events
```