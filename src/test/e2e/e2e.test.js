require("dotenv").config({ path: `${__dirname}/../../.env.test` });

const mockArbitrumPosition = {
  chain: "Arbitrum",
  id: 1,
};

const mockEthereumPosition = {
  chain: "Ethereum",
  id: 2,
};

describe("e2e", () => {
  test("should create bla bla bla", async () => {
    //dataRoutine([mockEthereumPosition]);

    expect(1).toEqual(1);
  });
});

/*
 start the app 

add mock Arbitrum position [all alerts should be flagged]

add mock Ethereum position [all alerts should be flagged]

make sure in both position all notifications are being sent

now verify no notification is being send now

remove positions

add another Arbitrum mock position [none of the alert should be flagged]

add another Ethereum mock position [none of the alert should be flagged]

now verify no notification is being send now

*/
