const Ppt = artifacts.require("./Ppt.sol");

contract("PPT Token", accounts => {
  
  it("...should have 0PPt.", async () => {
    const pptInstance = await Ppt.deployed();
    const balance = await pptInstance.balanceOf(accounts[1]);

    assert.equal(balance, 0);
  });

  it("...should send 1000PPT.", async () => {
    const pptInstance = await Ppt.deployed();

    // Send 1000PPT
    await pptInstance.transfer(accounts[1], 1000);

    // Get the new balance of the account
    const newBalance = await pptInstance.balanceOf(accounts[1]);

    assert.equal(newBalance, 1000);
  })
});