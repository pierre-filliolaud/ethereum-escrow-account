const MyToken = artifacts.require("MyToken");
const Escrow = artifacts.require("Escrow");

module.exports = function(deployer) {
  deployer.then(async () => {
    this.myToken = await deployer.deploy(MyToken, 'MyToken', 'SIM', 10000);
    this.escrow = await deployer.deploy(Escrow, MyToken.address);
    await this.escrow.initMyTokenAddress(this.myToken.address)
    console.log(Escrow.address)
    console.log(MyToken.address)
  });
}
