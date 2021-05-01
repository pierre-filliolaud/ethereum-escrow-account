// Based on https://github.com/OpenZeppelin/openzeppelin-solidity/blob/v2.5.1/test/examples/SimpleToken.test.js

const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');

const MyToken = artifacts.require('./MyToken.sol')

contract('MyToken', (accounts) => {

  const NAME = 'MyToken';
  const SYMBOL = 'SIM';
  const TOTAL_SUPPLY = new BN('10000');

  before(async () => {
    this.myToken = await MyToken.deployed()
  });

  it('deploys successfully', async () => {
    const address = await this.myToken.address
    // console.log(address)
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)
  })

  it('has been well initialized', async () => {
    // console.log(this.myToken.name())
    // Use large integer comparisons
    const address = await this.myToken.address
    expect(await this.myToken.totalSupply()).to.be.bignumber.equal(TOTAL_SUPPLY);
    expect(await this.myToken.name()).to.be.equal(NAME);
    expect(await this.myToken.symbol()).to.be.equal(SYMBOL);
    expect(await this.myToken.balanceOf(accounts[0])).to.be.bignumber.equal(TOTAL_SUPPLY);
  });
})