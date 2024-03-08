"use strict"

var EthereumCashCoin = artifacts.require("./EthereumCashCoin.sol");
const theBN = require("bn.js")

/**
 * EthereumCashCoin contract tests 2
 */
contract('EthereumCashCoin2', function(accounts) {
  const BIG = (v) => new theBN.BN(v)

  const owner = accounts[0];
  const admin = accounts[1];
  const vault = accounts[2];
  const minter = accounts[0];

  const user1 = accounts[4];
  const user2 = accounts[5];
  const user3 = accounts[6];
  const user4 = accounts[7];
  const user5 = accounts[8];

  let coin, OneEthereumCashCoinInMinunit, NoOfTokens, NoOfTokensInMinunit;

  const bnBalanceOf = async addr => await coin.balanceOf(addr);
  const bnReserveOf = async addr => await coin.reserveOf(addr);
  const bnAllowanceOf = async (owner, spender) => await coin.allowance(owner, spender);

  const balanceOf = async addr => (await coin.balanceOf(addr)).toString();
  const reserveOf = async addr => (await coin.reserveOf(addr)).toString();
  const allowanceOf = async (owner, spender) => (await coin.allowance(owner,spender)).toString();


  before(async () => {
    coin = await EthereumCashCoin.deployed();
    NoOfTokensInMinunit = await coin.totalSupply();
    OneEthereumCashCoinInMinunit = await coin.getOneEthereumCashCoin();
    NoOfTokens = NoOfTokensInMinunit.div(OneEthereumCashCoinInMinunit)
  });

  const clearUser = async user => {
    await coin.setReserve(user, 0, {from: admin});
    await coin.transfer(vault, await bnBalanceOf(user), {from: user});
  };

  beforeEach(async () => {
    await clearUser(user1);
    await clearUser(user2);
    await clearUser(user3);
    await clearUser(user4);
    await clearUser(user5);
  });

  it("reserve and then approve", async() => {
    assert.equal(await balanceOf(user4), "0");

    const OneEthereumCashTimesTwoInMinunit = OneEthereumCashCoinInMinunit.mul(BIG(2))
    const OneEthereumCashTimesTwoInMinunitStr = OneEthereumCashTimesTwoInMinunit.toString()

    const OneEthereumCashTimesOneInMinunit = OneEthereumCashCoinInMinunit.mul(BIG(1))
    const OneEthereumCashTimesOneInMinunitStr = OneEthereumCashTimesOneInMinunit.toString()

    // send 2 EthereumCash to user4 and set 1 EthereumCash reserve
    coin.transfer(user4, OneEthereumCashTimesTwoInMinunit, {from: vault});
    coin.setReserve(user4, OneEthereumCashCoinInMinunit, {from: admin});
    assert.equal(await balanceOf(user4), OneEthereumCashTimesTwoInMinunitStr);
    assert.equal(await reserveOf(user4), OneEthereumCashCoinInMinunit.toString());

    // approve 2 EthereumCash to user5
    await coin.approve(user5, OneEthereumCashTimesTwoInMinunit, {from:user4});
    assert.equal(await allowanceOf(user4, user5), OneEthereumCashTimesTwoInMinunitStr);

    // transfer 2 EthereumCash from user4 to user5 SHOULD NOT BE POSSIBLE
    try {
      await coin.transferFrom(user4, user5, OneEthereumCashTimesTwoInMinunit, {from: user5});
      assert.fail();
    } catch(exception) {
      assert.isTrue(exception.message.includes("revert"));
    }

    // transfer 1 EthereumCash from user4 to user5 SHOULD BE POSSIBLE
    await coin.transferFrom(user4, user5, OneEthereumCashTimesOneInMinunit, {from: user5});
    assert.equal(await balanceOf(user4), OneEthereumCashTimesOneInMinunitStr);
    assert.equal(await reserveOf(user4), OneEthereumCashTimesOneInMinunitStr); // reserve will not change
    assert.equal(await allowanceOf(user4, user5), OneEthereumCashTimesOneInMinunitStr); // allowance will be reduced
    assert.equal(await balanceOf(user5), OneEthereumCashTimesOneInMinunitStr);
    assert.equal(await reserveOf(user5), "0");

    // transfer .5 EthereumCash from user4 to user5 SHOULD NOT BE POSSIBLE if balance <= reserve
    const halfEthereumCashInMinunit = OneEthereumCashCoinInMinunit.div(BIG(2));
    try {
      await coin.transferFrom(user4, user5, halfEthereumCashInMinunit, {from: user5});
      assert.fail();
    } catch(exception) {
      assert.isTrue(exception.message.includes("revert"));
    }
  })

  it("only minter can call mint", async() => {
      const OneEthereumCashTimesTenInMinunit = OneEthereumCashCoinInMinunit.mul(BIG(10))
      const OneEthereumCashTimesTenInMinunitStr = OneEthereumCashTimesTenInMinunit.toString()

      assert.equal(await balanceOf(user4), "0");

      await coin.mint(user4, OneEthereumCashTimesTenInMinunit, {from: minter})

      const totalSupplyAfterMintStr = (await coin.totalSupply()).toString()
      assert.equal(totalSupplyAfterMintStr, OneEthereumCashTimesTenInMinunit.add(NoOfTokensInMinunit).toString())
      assert.equal(await balanceOf(user4), OneEthereumCashTimesTenInMinunitStr);

      try {
          await coin.mint(user4, OneEthereumCashTimesTenInMinunit, {from: user4})
          assert.fail();
      } catch(exception) {
          assert.equal(totalSupplyAfterMintStr, OneEthereumCashTimesTenInMinunit.add(NoOfTokensInMinunit).toString())
          assert.isTrue(exception.message.includes("revert"));
      }
  })

  it("cannot mint above the mint cap", async() => {
      const OneEthereumCashTimes100BilInMinunit = 
              OneEthereumCashCoinInMinunit.mul(BIG(100000000000))

      assert.equal(await balanceOf(user4), "0");


      try {
          await coin.mint(user4, OneEthereumCashTimes100BilInMinunit, {from: minter})
          assert.fail();
      } catch(exception) {
          assert.isTrue(exception.message.includes("revert"));
      }
  })
});
