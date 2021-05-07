// Based on https://github.com/OpenZeppelin/openzeppelin-solidity/blob/v2.5.1/test/examples/SimpleToken.test.js

const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');

const Escrow = artifacts.require('./Escrow.sol')
const MyToken = artifacts.require('./MyToken.sol')

contract('Escrow', (accounts) => {

  const NAME = 'MyToken';
  const SYMBOL = 'SIM';
  const TOTAL_SUPPLY = new BN('10000');

  before(async () => {
    this.escrow = await Escrow.deployed()
    this.myToken = await MyToken.deployed()
    console.log('myToken:'+this.myToken.address)

    await this.escrow.updateMyToken(this.myToken.address, {from: accounts[0]})
    const myTokenAddress = await this.escrow.getMyTokenAddress();
    console.log('myTokenAddress:'+myTokenAddress)

  });

  it('deploys successfully', async () => {
    const address = await this.escrow.address
    const myTokenAddress = await this.escrow.getMyTokenAddress();
    console.log(this.myToken.address)
    console.log(myTokenAddress)
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)

    // assert.notEqual(myTokenAddress, 0x0)
    // assert.notEqual(myTokenAddress, '')
    // assert.notEqual(myTokenAddress, null)
    // assert.notEqual(myTokenAddress, undefined)

    // assert.equal(myTokenAddress, this.myToken.address)
  })

    it('create Order', async () => {
    // console.log(this.myToken.name())
    // // Use large integer comparisons
    expect(await this.myToken.balanceOf(accounts[0])).to.be.bignumber.equal(TOTAL_SUPPLY);
    expect(await this.myToken.balanceOf(accounts[1])).to.be.bignumber.equal(new BN(0));
    const address = await this.escrow.address
    const {logs} = await this.escrow.createOrder(1, accounts[1], 10);
    console.log('-------------------------')
    console.log(logs)
    // expectEvent.inLogs(logs, 'Approval', {
    //   owner: accounts[0],
    //   spender: this.escrow.address,
    //   value: new BN(10),
    // });
    // expectEvent.inLogs(logs, 'OrderUpdate', {
    //   orderId: new BN(1),
    //   seller: accounts[0],
    //   buyer: accounts[1],
    //   value: new BN(10),
    //   status: new BN(0)//Escrow.OrderStatus.Pending
    // });


    // console.log(this.escrow.getOrder(0)[0]);
    // expect(await this.escrow.getOrder(0)[3]).to.be.bignumber.equal(10);
    // expect(await this.myToken.name()).to.be.equal(NAME);
    // expect(await this.myToken.symbol()).to.be.equal(SYMBOL);
    // expect(await this.myToken.allowance(accounts[0], this.escrow.address)).to.be.bignumber.equal(new BN(10));
    // expect(await this.myToken.balanceOf(accounts[0])).to.be.bignumber.equal(new BN(9990));
  });

  // it('has been well initialized', async () => {
  //   // console.log(this.myToken.name())
  //   // Use large integer comparisons
  //   const address = await this.myToken.address
  //   expect(await this.myToken.totalSupply()).to.be.bignumber.equal(TOTAL_SUPPLY);
  //   expect(await this.myToken.name()).to.be.equal(NAME);
  //   expect(await this.myToken.symbol()).to.be.equal(SYMBOL);
  //   expect(await this.myToken.balanceOf(accounts[0])).to.be.bignumber.equal(TOTAL_SUPPLY);
  // });
})