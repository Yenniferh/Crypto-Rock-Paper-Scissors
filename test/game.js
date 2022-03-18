const Game = artifacts.require("./Game.sol");
const MockGame = artifacts.require("./__mocks__/MockGame.sol");

const filterLogsByEvent = (logs, eventName) => {
  return logs.filter(log => log.event === eventName);
};

contract("Game", accounts => {
  let gameInstance
  beforeEach(async () => {
    gameInstance = await Game.new();
  })

  describe("RPS Token", () => {
    describe("Owner", () => {
      it("should have 1000RPS initially", async () => {
        const balance = await gameInstance.balanceOf(accounts[0]);
        assert.equal(balance.toNumber(), 1000);
      });
    });

    describe("Players", () => {
      it("should have 0RPS initially", async () => {
        const balance = await gameInstance.balanceOf(accounts[1]);
        assert.equal(balance.toNumber(), 0);
      });

      it("should send RPS", async () => {
        // Setup account
        const accountOne = accounts[1];
        const accountTwo = accounts[2];

        // Owner send 100RPS to accountOne
        await gameInstance.transfer(accountOne, 100);

        // AccountOne send 40RPS to accountTwo
        await gameInstance.transfer(accountTwo, 40, { from: accountOne });

        // Get the new balance of the accountOne
        const newBalance = await gameInstance.balanceOf(accountOne);

        assert.equal(newBalance.toNumber(), 60);
      });

      it("should receive RPS", async () => {
        // Setup account
        const accountOne = accounts[1];
        const accountTwo = accounts[2];

        // Owner send 100RPS to accountOne
        await gameInstance.transfer(accountOne, 100);

        // AccountOne send 40RPS to accountTwo
        await gameInstance.transfer(accountTwo, 40, { from: accountOne });

        // Get the new balance of the accountTwo
        const newBalance = await gameInstance.balanceOf(accountTwo);

        assert.equal(newBalance.toNumber(), 40);
      });
    });
  });

  describe("Game", () => {
    describe("Owner", () => {
      context("When joining to the game", async () => {
        it("should not join", async () => {
          try {
            await gameInstance.joinGame({from: accounts[0]});
          } catch (error) {
            assert(
              error.reason === "Owner cannot be the player.",
              `unexpected error message: ${error.reason}`
            );
            return;
          }
          assert.fail('should have thrown before');
        });
      });

      context("When playing", async () => {
        it("should not play since can not join", async () => {
          let PAPER = await gameInstance.PAPER();
          try {
            await gameInstance.play(PAPER, {from: accounts[0]});
          } catch (error) {
            assert(
              error.reason === "You have not joined to the game.",
              `unexpected error message: ${error.reason}`
            );
            return;
          }
          assert.fail('should have thrown before');
        });
      });

      context("When finishing the game", async () => {
        it("should not finish since can not join", async () => {
          try {
            await gameInstance.finishGame({from: accounts[0]});
          } catch (error) {
            assert(
              error.reason === "You have not joined to the game.",
              `unexpected error message: ${error.reason}`
            );
            return;
          }
          assert.fail('should have thrown before');
        });
      });
    });

    describe("Player", () => {
      context("Joining to the game", async () => {
        it("should join", async () => {
          // Join the game
          await gameInstance.joinGame({from: accounts[1]});
    
          // Get the new balance of the account
          const newBalance = await gameInstance.balanceOf(accounts[1]);
    
          // Newbie should have 100RPS
          assert.equal(newBalance.toNumber(), 100);
        });

        it("should not double join", async () => {
          await gameInstance.joinGame({from: accounts[1]});

          try {
            await gameInstance.joinGame({from: accounts[1]});
          } catch (error) {
            assert(
              error.reason === "You already have joined to the game.",
              `unexpected error message: ${error.reason}`
            );
            return;
          }
          assert.fail('should have thrown before');
        });
      });

      context("Have joined to the game", async () => {
        context("when playing", async () => {
          let mockGameInstance;

          // Options
          let ROCK; // Option 0
          let PAPER; // Option 1
          let SCISSORS; // Option 2

          //Outcomes
          let PLAYER_WINS, TIED_ROUND, PLAYER_LOSES;

          before(async () => {
            mockGameInstance = await MockGame.new();
            // Set constants
            ROCK = await mockGameInstance.ROCK();
            PAPER = await mockGameInstance.PAPER();
            SCISSORS = await mockGameInstance.SCISSORS();
            PLAYER_WINS = await mockGameInstance.PLAYER_WINS();
            TIED_ROUND = await mockGameInstance.TIED_ROUND();
            PLAYER_LOSES = await mockGameInstance.PLAYER_LOSES();
          });

          beforeEach(async () => {
            mockGameInstance = await MockGame.new();
            await mockGameInstance.joinGame({from: accounts[1]});
          });

          context("ROCK vs. SCISSORS", async () => {
            it("should win the round", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(2);

              // Play the game
              const play = await mockGameInstance.play(
                ROCK,
                {from: accounts[1]}
              );

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              const outcome = await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              // Result should be PLAYER WINS
              const result = filterLogsByEvent(
                outcome.logs,
                "RoundOutcome"
              )[0].args.result;
              assert.equal(result, PLAYER_WINS);
            });

            it("should win 30RPS", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(2);

              // Play the game
              const play = await mockGameInstance.play(
                ROCK,
                {from: accounts[1]}
              );

              const initialBalance = await mockGameInstance.balanceOf(accounts[1]);

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              const finalBalance = await mockGameInstance.balanceOf(accounts[1]);

              assert.equal(finalBalance.toNumber(), initialBalance.toNumber() + 30);
            });
          });
          
          context("ROCK vs. ROCK", async () => {
            it("should be a tied round", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(0);

              // Play the game
              const play = await mockGameInstance.play(
                ROCK,
                {from: accounts[1]}
              );

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              const outcome = await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              // Result should be TIED ROUND
              const result = filterLogsByEvent(
                outcome.logs,
                "RoundOutcome"
              )[0].args.result;
              assert.equal(result, TIED_ROUND);
            });

            it("should get the bet amount back", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(0);

              // Play the game
              const play = await mockGameInstance.play(
                ROCK,
                {from: accounts[1]}
              );

              const initialBalance = await mockGameInstance.balanceOf(accounts[1]);

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              const finalBalance = await mockGameInstance.balanceOf(accounts[1]);

              assert.equal(finalBalance.toNumber(), initialBalance.toNumber() + 10);
            });
          });

          context("ROCK vs. PAPER", async () => {
            it("should lose the round", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(1);

              // Play the game
              const play = await mockGameInstance.play(
                ROCK,
                {from: accounts[1]}
              );

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              const outcome = await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              // Result should be PLAYER LOSES
              const result = filterLogsByEvent(
                outcome.logs,
                "RoundOutcome"
              )[0].args.result;
              assert.equal(result, PLAYER_LOSES);
            });

            it("should not get RPS", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(1);

              // Play the game
              const play = await mockGameInstance.play(
                ROCK,
                {from: accounts[1]}
              );

              const initialBalance = await mockGameInstance.balanceOf(accounts[1]);

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              const finalBalance = await mockGameInstance.balanceOf(accounts[1]);

              assert.equal(finalBalance.toNumber(), initialBalance.toNumber());
            });
          });

          context("PAPER vs. ROCK", async () => {
            it("should win the round", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(0);
  
              // Play the game
              const play = await mockGameInstance.play(
                PAPER,
                {from: accounts[1]}
              );
  
              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              const outcome = await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );
  
              // Result should be PLAYER WINS
              const result = filterLogsByEvent(
                outcome.logs,
                "RoundOutcome"
              )[0].args.result;
              assert.equal(result, PLAYER_WINS);
            });

            it("should win 30RPS", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(0);
  
              // Play the game
              const play = await mockGameInstance.play(
                PAPER,
                {from: accounts[1]}
              );

              const initialBalance = await mockGameInstance.balanceOf(accounts[1]);

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              const finalBalance = await mockGameInstance.balanceOf(accounts[1]);

              assert.equal(finalBalance.toNumber(), initialBalance.toNumber() + 30);
            });
          });
          
          context("PAPER vs. PAPER", async () => {
            it("should be a tied round", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(1);
  
              // Play the game
              const play = await mockGameInstance.play(
                PAPER,
                {from: accounts[1]}
              );
  
              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              const outcome = await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );
  
              // Result should be TIED ROUND
              const result = filterLogsByEvent(
                outcome.logs,
                "RoundOutcome"
              )[0].args.result;
              assert.equal(result, TIED_ROUND);
            });

            it("should get the bet amount back", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(1);
  
              // Play the game
              const play = await mockGameInstance.play(
                PAPER,
                {from: accounts[1]}
              );

              const initialBalance = await mockGameInstance.balanceOf(accounts[1]);

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              const finalBalance = await mockGameInstance.balanceOf(accounts[1]);

              assert.equal(finalBalance.toNumber(), initialBalance.toNumber() + 10);
            });
          });

          context("PAPER vs. SCISSORS", async () => {
            it("should lose the round", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(2);
  
              // Play the game
              const play = await mockGameInstance.play(
                PAPER,
                {from: accounts[1]}
              );
  
              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              const outcome = await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );
  
              // Result should be PLAYER LOSES
              const result = filterLogsByEvent(
                outcome.logs,
                "RoundOutcome"
              )[0].args.result;
              assert.equal(result, PLAYER_LOSES);
            });

            it("should not get RPS", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(2);
  
              // Play the game
              const play = await mockGameInstance.play(
                PAPER,
                {from: accounts[1]}
              );

              const initialBalance = await mockGameInstance.balanceOf(accounts[1]);

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              const finalBalance = await mockGameInstance.balanceOf(accounts[1]);

              assert.equal(finalBalance.toNumber(), initialBalance.toNumber());
            });
          });

          context("SCISSORS vs. PAPER", async () => {
            it("should win the round", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(1);

              // Play the game
              const play = await mockGameInstance.play(
                SCISSORS,
                {from: accounts[1]}
              );

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              const outcome = await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              // Result should be PLAYER WINS
              const result = filterLogsByEvent(
                outcome.logs,
                "RoundOutcome"
              )[0].args.result;
              assert.equal(result, PLAYER_WINS);
            });

            it("should win 30RPS", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(1);

              // Play the game
              const play = await mockGameInstance.play(
                SCISSORS,
                {from: accounts[1]}
              );

              const initialBalance = await mockGameInstance.balanceOf(accounts[1]);

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              const finalBalance = await mockGameInstance.balanceOf(accounts[1]);

              assert.equal(finalBalance.toNumber(), initialBalance.toNumber() + 30);
            });
          });
          
          context("SCISSORS vs. SCISSORS", async () => {
            it("should be a tied round", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(2);

              // Play the game
              const play = await mockGameInstance.play(
                SCISSORS,
                {from: accounts[1]}
              );

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              const outcome = await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              // Result should be TIED ROUND
              const result = filterLogsByEvent(
                outcome.logs,
                "RoundOutcome"
              )[0].args.result;
              assert.equal(result, TIED_ROUND);
            });

            it("should get the bet amount back", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(2);

              // Play the game
              const play = await mockGameInstance.play(
                SCISSORS,
                {from: accounts[1]}
              );

              const initialBalance = await mockGameInstance.balanceOf(accounts[1]);

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              const finalBalance = await mockGameInstance.balanceOf(accounts[1]);

              assert.equal(finalBalance.toNumber(), initialBalance.toNumber() + 10);
            });
          });

          context("SCISSORS vs. ROCK", async () => {
            it("should lose the round", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(0);

              // Play the game
              const play = await mockGameInstance.play(
                SCISSORS,
                {from: accounts[1]}
              );

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              const outcome = await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              // Result should be PLAYER LOSES
              const result = filterLogsByEvent(
                outcome.logs,
                "RoundOutcome"
              )[0].args.result;
              assert.equal(result, PLAYER_LOSES);
            });

            it("should not get RPS", async () => {
              // Mock random provided by chainlink
              await mockGameInstance.setRandom(0);

              // Play the game
              const play = await mockGameInstance.play(
                SCISSORS,
                {from: accounts[1]}
              );

              const initialBalance = await mockGameInstance.balanceOf(accounts[1]);

              // Get the result of the round
              const requestId = filterLogsByEvent(
                play.logs,
                "PlayerRoundStarted"
              )[0].args.requestId;
              await mockGameInstance.queryOutcome(
                requestId,
                {from: accounts[1]}
              );

              const finalBalance = await mockGameInstance.balanceOf(accounts[1]);

              assert.equal(finalBalance.toNumber(), initialBalance.toNumber());
            });
          });

          context("send an invalid option", async () => {
            it("should not play", async () => {
              // keccak256("OTHER")
              let OTHER = "0x35b65de3b579a9ce74763d33e74f08dcef72a66ee55fd214549ace2be760d16d";
              await gameInstance.joinGame({from: accounts[1]});
              try {
                await gameInstance.play(
                  OTHER,
                  {from: accounts[1]}
                );
              } catch (error) {
                assert(
                  error.reason === "Invalid option.",
                  `unexpected error message: ${error.reason}`
                );
                return;
              }
              assert.fail('should have thrown before');
            });
          });
        });

        context("when finishing the game", async () => {
          it("should finish", async () => {
            await gameInstance.joinGame({from: accounts[1]});

            try {
              await gameInstance.finishGame({from: accounts[1]});
            } catch (error) {
              assert.equal(error.length, 0, 'error message must be empty');
              return;
            }
          });
        });
      });

      context("Not joined to the game", async () => {
        context("when playing", async () => {
          it("should not play", async () => {
            let PAPER = await gameInstance.PAPER();
            try {
              await gameInstance.play(PAPER, {from: accounts[0]});
            } catch (error) {
              assert(
                error.reason === "You have not joined to the game.",
                `unexpected error message: ${error.reason}`
              );
              return;
            }
            assert.fail('should have thrown before');
          });
        });

        context("when finishing the game", async () => {
          it("should not finish", async () => {
            try {
              await gameInstance.finishGame({from: accounts[2]});
            } catch (error) {
              assert(
                error.reason === "You have not joined to the game.",
                `unexpected error message: ${error.reason}`
              );
              return;
            }
            assert.fail('should have thrown before');
          });
        });
      });
    });
  });
});