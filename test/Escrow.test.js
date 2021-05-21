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

    await this.escrow.initMyTokenAddress(this.myToken.address, {from: accounts[0]})
    const myTokenAddress = await this.escrow.getMyTokenAddress();
    await this.myToken.initEscrowAddress(this.escrow.address, {from: accounts[0]});

  });

  it('deploys successfully', async () => {
    const address = await this.escrow.address
    const myTokenAddress = await this.escrow.getMyTokenAddress();
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)

    assert.notEqual(myTokenAddress, 0x0)
    assert.notEqual(myTokenAddress, '')
    assert.notEqual(myTokenAddress, null)
    assert.notEqual(myTokenAddress, undefined)

    assert.equal(myTokenAddress, this.myToken.address)
  })

    it('create Order successfully', async () => {
    // console.log(this.myToken.name())
    // // Use large integer comparisons
    expect(await this.myToken.balanceOf(accounts[0])).to.be.bignumber.equal(TOTAL_SUPPLY);
    expect(await this.myToken.balanceOf(accounts[1])).to.be.bignumber.equal(new BN(0));
    const address = await this.escrow.address
    const result = await this.escrow.createOrder(accounts[1], 10, 5, {from: accounts[0]});

    await expectEvent.inTransaction(result.tx, MyToken, 'Approval', {
      owner: accounts[0],
      spender: this.escrow.address,
      value: new BN(10)
    });
    await expectEvent.inLogs(result.logs, 'OrderUpdate', {
      orderId: new BN(1),
      seller: accounts[0],
      buyer: accounts[1],
      quantity: new BN(10),
      settlementAmount: new BN(5),
      status: new BN(0)//Escrow.OrderStatus.Pending
    });
    expect(await this.myToken.allowance(accounts[0], this.escrow.address)).to.be.bignumber.equal(new BN(0));
    expect(await this.myToken.balanceOf(accounts[0])).to.be.bignumber.equal(new BN(9990));
  });

  it('accept Order successfully', async () => {
    let balance = await web3.eth.getBalance(this.escrow.address);
    console.log('balance:'+balance)
    let balance2 = await web3.eth.getBalance(accounts[0]);
    console.log('balance2:'+balance2)
    let balance3 = await web3.eth.getBalance(accounts[1]);
    console.log('balance3:'+balance3)
    // expect(balance).to.be.bignumber.equal(new BN(5));
    // const initialBalance = accounts[0].balance
    const result = await this.escrow.acceptOrder(1, accounts[0], {from: accounts[1], value: 5000000000000000000, gas: 4712388});
    await expectEvent.inLogs(result.logs, 'OrderUpdate', {
      orderId: new BN(1),
      seller: accounts[0],
      buyer: accounts[1],
      quantity: new BN(10),
      settlementAmount: new BN(5),
      status: new BN(2)//Escrow.OrderStatus.Pending
    });
    balance = await web3.eth.getBalance(this.escrow.address);
    console.log('balance:'+balance)
    balance2 = await web3.eth.getBalance(accounts[0]);
    console.log('balance2:'+balance2)
    balance3 = await web3.eth.getBalance(accounts[1]);
    console.log('balance3:'+balance3)
    expect(await this.myToken.allowance(accounts[0], this.escrow.address)).to.be.bignumber.equal(new BN(0));
    expect(await this.myToken.balanceOf(accounts[0])).to.be.bignumber.equal(new BN(9990));
    expect(await this.myToken.balanceOf(accounts[1])).to.be.bignumber.equal(new BN(10));
    // expect(accounts[0].balance).to.be.bignumber.equal(new BN(initialBalance+5));
  });
})