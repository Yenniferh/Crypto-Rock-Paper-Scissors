const Game = artifacts.require("./Game.sol");

contract("Game", accounts => {
  let gameInstance
  beforeEach(async () => {
    gameInstance = await Game.new();
  })

  describe("RPS Token", () => {
    it("should have 0PPt.", async () => {
      const balance = await gameInstance.balanceOf(accounts[1]);
      assert.equal(balance.toNumber(), 0);
    });

    it("should send and receive RPS.", async () => {
      // Setup 2 accounts.
      const accountOne = accounts[1];
      const accountTwo = accounts[2];

      // Send 100RPS
      await gameInstance.transfer(accountOne, 100);

      // Get the new balance of the account
      const newBalance = await gameInstance.balanceOf(accountOne);

      assert.equal(newBalance.toNumber(), 100);

      // Receive RPS
      await gameInstance.transfer(accountTwo, 100, { from: accountOne });

      // Get the new balance of the account
      const newBalance2 = await gameInstance.balanceOf(accountTwo);

      assert.equal(newBalance2.toNumber(), 100);

      const finalBalance = await gameInstance.balanceOf(accountOne);

      assert.equal(finalBalance.toNumber(), 0);
    });
  });

  describe("Joining the game", () => {
    it("player should join to the game.", async () => {
      // Join the game
      await gameInstance.joinGame({from: accounts[1]});

      // Get the new balance of the account
      const newBalance = await gameInstance.balanceOf(accounts[1]);

      // Newbie should have 100RPS
      assert.equal(newBalance.toNumber(), 100);
    });

    it("owner should not join to the game.", async () => {
      // Join the game
      try {
        await gameInstance.joinGame({from: accounts[0]});
      } catch (error) {
        assert(
          error.reason === "Owner cannot be the player.",
          "unexpected error message");
        return;
      }

      assert.fail('should have thrown before');
    });

    it("player should not double join to the game.", async () => {
      await gameInstance.joinGame({from: accounts[1]});

      // Not allowed to join the game again, since it's already joined.
      try {
        await gameInstance.joinGame({from: accounts[1]});
      } catch (error) {
        assert(
          error.reason === "You already have joined to the game.",
          "unexpected error message"
        );
        return;
      }

      assert.fail('should have thrown before');
    });
  });

  /* describe("Playing the game", () => {
    it("should win the round.", async () => {
      // Play the game
      await gameInstance.play("0xafc83074eaf969f09fa6bca78540292cd5f2c865e73bbd50c164ecac4e661111", 0, {from: accounts[1]});


      // Get the new balance of the account
      const newBalance = await gameInstance.balanceOf(accounts[1]);

      // Player should have 220RPS
      assert.equal(newBalance.toNumber(), 220);
    });

    it("should be a tied round.", async () => {
      // Play the game
      await gameInstance.play("0xafc83074eaf969f09fa6bca78540292cd5f2c865e73bbd50c164ecac4e661111", 1, {from: accounts[1]});


      // Get the new balance of the account
      const newBalance = await gameInstance.balanceOf(accounts[1]);

      // Player should have 220RPS
      assert.equal(newBalance.toNumber(), 220);
    });

    it("should lose the round.", async () => {
      // Play the game
      await gameInstance.play("0xafc83074eaf969f09fa6bca78540292cd5f2c865e73bbd50c164ecac4e661111", 2, {from: accounts[1]});


      // Get the new balance of the account
      const newBalance = await gameInstance.balanceOf(accounts[1]);

      // Player should have 220RPS
      assert.equal(newBalance.toNumber(), 210);
    });
  }); */

  describe("Ending the game", () => {
    it("player should finish the game.", async () => {
      // Join the game
      await gameInstance.joinGame({from: accounts[1]});

      // Finish the game
      try {
        await gameInstance.finishGame({from: accounts[1]});
      } catch (error) {
        assert.equal(error.length, 0, 'error message must be empty');
      }

    });

    it("should not finish the game when user has not joined.", async () => {
      // Finish the game
      try {
        await gameInstance.finishGame({from: accounts[2]});
      } catch (error) {
        assert(
          error.reason === "You have not joined to the game.",
          "unexpected error message")
        ;
        return;
      }

      assert.fail('should have thrown before');
    });

    it("should not finish the game when user is the owner.", async () => {
      // Finish the game
      try {
        await gameInstance.finishGame({from: accounts[0]});
      } catch (error) {
        assert(
          error.reason === "You have not joined to the game.", // Owner cannot join the game.
          "unexpected error message"
        );
        return;
      }

      assert.fail('should have thrown before');
    });
  });
});