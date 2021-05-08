const MyToken = artifacts.require("MyToken");
const Escrow = artifacts.require("Escrow");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(MyToken, 'MyToken', 'SIM', 10000);
    await deployer.deploy(Escrow, MyToken.address);
    console.log(Escrow.address)
    console.log(MyToken.address)
  });
}
