const Game = artifacts.require("./Game.sol");

contract("PPT Game", accounts => {
  
  it("...should have 0PPt.", async () => {
    const gameInstance = await Game.deployed();
    const balance = await gameInstance.balanceOf(accounts[1]);

    assert.equal(balance.toNumber(), 0);
  });

  it("...should send and receive PPT.", async () => {
    const gameInstance = await Game.deployed();

    // Setup 2 accounts.
    const accountOne = accounts[1];
    const accountTwo = accounts[2];

    // Send 1000PPT
    await gameInstance.transfer(accountOne, 1000);

    // Get the new balance of the account
    const newBalance = await gameInstance.balanceOf(accountOne);

    assert.equal(newBalance.toNumber(), 1000);

    // Receive PPT
    await gameInstance.transfer(accountTwo, 1000, { from: accountOne });

    // Get the new balance of the account
    const newBalance2 = await gameInstance.balanceOf(accountTwo);

    assert.equal(newBalance2.toNumber(), 1000);

    const finalBalance = await gameInstance.balanceOf(accountOne);

    assert.equal(finalBalance.toNumber(), 0);
  });

  it("...player should join to the game.", async () => {
    const gameInstance = await Game.deployed();

    // Join the game
    await gameInstance.joinGame({from: accounts[1]});

    // Get the new balance of the account
    const newBalance = await gameInstance.balanceOf(accounts[1]);

    // Newbie should have 200PPT
    assert.equal(newBalance.toNumber(), 200);
  });

  it("...should win the round.", async () => {
    const gameInstance = await Game.deployed();

    // Play the game
    await gameInstance.play("0xafc83074eaf969f09fa6bca78540292cd5f2c865e73bbd50c164ecac4e661111", 0, {from: accounts[1]});


    // Get the new balance of the account
    const newBalance = await gameInstance.balanceOf(accounts[1]);

    // Player should have 220PPT
    assert.equal(newBalance.toNumber(), 220);
  });

  it("...should be a tied round.", async () => {
    const gameInstance = await Game.deployed();

    // Play the game
    await gameInstance.play("0xafc83074eaf969f09fa6bca78540292cd5f2c865e73bbd50c164ecac4e661111", 1, {from: accounts[1]});


    // Get the new balance of the account
    const newBalance = await gameInstance.balanceOf(accounts[1]);

    // Player should have 220PPT
    assert.equal(newBalance.toNumber(), 220);
  });

  it("...should lose the round.", async () => {
    const gameInstance = await Game.deployed();

    // Play the game
    await gameInstance.play("0xafc83074eaf969f09fa6bca78540292cd5f2c865e73bbd50c164ecac4e661111", 2, {from: accounts[1]});


    // Get the new balance of the account
    const newBalance = await gameInstance.balanceOf(accounts[1]);

    // Player should have 220PPT
    assert.equal(newBalance.toNumber(), 210);
  });

  it("...owner should not join to the game.", async () => {
    const gameInstance = await Game.deployed();

    // Join the game
    try {
      await gameInstance.joinGame({from: accounts[0]});
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return;
    }

    assert.fail('should have thrown before');
  });

  it("...player should not double join to the game.", async () => {
    const gameInstance = await Game.deployed();

    // Not allowed to join the game again, since it's already joined.
    try {
      await gameInstance.joinGame({from: accounts[1]});
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return;
    }

    assert.fail('should have thrown before');
  });

  it("...player should finish the game.", async () => {
    const gameInstance = await Game.deployed();

    // Finish the game
    try {
      await gameInstance.finishGame({from: accounts[1]});
    } catch (error) {
      assert.equal(error.length, 0, 'error message must be empty');
    }

  });

  it("...should not finish the game when user has not joined.", async () => {
    const gameInstance = await Game.deployed();

    // Finish the game
    try {
      await gameInstance.finishGame({from: accounts[1]});
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return;
    }

    assert.fail('should have thrown before');
  });

  it("...should not finish the game when user is the owner.", async () => {
    const gameInstance = await Game.deployed();

    // Finish the game
    try {
      await gameInstance.finishGame({from: accounts[0]});
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return;
    }

    assert.fail('should have thrown before');
  });
});