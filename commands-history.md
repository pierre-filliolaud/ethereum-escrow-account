npm install -g truffle
truffle init
npm init
npm install @openzeppelin/contracts@3.4.1
npm install

truffle compile
truffle migrate

truffle console
myToken = await MyToken.deployed()
myToken
myToken.address
totalSupply = await myToken.totalSupply()
totalSupply
name = await myToken.name()
name

escrow = await Escrow.deployed()
myTokenAddress = await escrow.getMyTokenAddress()
