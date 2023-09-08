const discordBot = require("../discordbot.js");
const factory = require("./factories.js");
const { chains } = require("../utils/chains.js");
const {
  mockEtherPositionOne,
  mockArbitPositionOne,
  mockArbitPositionTwo,
} = require("./mocks.js");
const {
  getClientReady,
  sendMsg,
  getRespose,
} = require("./helpers/discordTestClinetHelper");
const sleep = 10000;
const longSleep = 10000;

describe("discordBot", () => {
  beforeAll(async () => {
    await new Promise((r) => setTimeout(r, longSleep));
    expect(getClientReady()).toEqual(true);
    sendMsg(
      "---------------------------------------------------- \n this is an autmated test for discord bot \n----------------------------------------------------"
    );
  });

  afterAll(async () => {
    await factory.removePositionFromDB(mockEtherPositionOne);
    await factory.removePositionFromDB(mockArbitPositionOne);
    sendMsg(
      "---------------------------------------------------- \n end of the autmated test for discord bot \n----------------------------------------------------"
    );
  });
  describe("discord bot - help", () => {
    test("should ask for help form bot", async () => {
      await sendMsg(`<@${process.env.DISCORD_CLIENT_ID}> help`);
      await new Promise((r) => setTimeout(r, sleep));
      expect(await getRespose()).toEqual(
        "I can help you with the following commands: \n- `GetAllActivePositions` \n- `AddPosition` \n- `RemovePosition`"
      );
    });
    test("should not recived help menu for diffrent keyword form bot", async () => {
      await sendMsg(`<@${process.env.DISCORD_CLIENT_ID}> hell`);
      await new Promise((r) => setTimeout(r, sleep));
      expect(await getRespose()).toEqual(
        "I don't understand this command, try to use `help` to find posible commands"
      );
    });
  });

  describe("discord bot - AddPosition", () => {
    test("should add ethereum position to db", async () => {
      await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockEtherPositionOne.chain].name
        } ${mockEtherPositionOne.id}`
      );

      await new Promise((r) => setTimeout(r, sleep));
      const addPositionRes = await getRespose();
      expect(addPositionRes).toEqual(
        `Position ${mockEtherPositionOne.id} on chain ${
          chains[mockEtherPositionOne.chain].name
        } was added successfully`
      );
    });

    test("should add arbitrum position to db", async () => {
      await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionOne.chain].name
        } ${mockArbitPositionOne.id} ${mockArbitPositionOne.txHash}`
      );
      await new Promise((r) => setTimeout(r, sleep));
      const addPositionRes = await getRespose();
      expect(addPositionRes).toEqual(
        `Position ${mockArbitPositionOne.id} on chain ${
          chains[mockArbitPositionOne.chain].name
        } was added successfully`
      );
    });

    test("should not add arbitrum position to db without txhash", async () => {
      await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionTwo.chain].name
        } ${mockArbitPositionTwo.id}`
      );
      await new Promise((r) => setTimeout(r, sleep));
      const addPositionRes = await getRespose();
      expect(addPositionRes).toEqual(
        `No inital data found for position 2 on chain arbitrum`
      );
    });

    test("should not add position to db for none valid chain", async () => {
      await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition sababirum ${mockArbitPositionOne.id} 0xa123`
      );
      await new Promise((r) => setTimeout(r, sleep));
      const addPositionRes = await getRespose();
      expect(addPositionRes).toEqual(
        "Chain id not supported, must be ethereum or arbitrum"
      );
    });

    test("should not add position to db for if alredy exist", async () => {
      await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionOne.chain].name
        } ${mockArbitPositionOne.id} ${mockArbitPositionOne.txHash}`
      );

      await new Promise((r) => setTimeout(r, sleep));
      const addPositionRes = await getRespose();
      expect(addPositionRes).toEqual(
        `could not save postition ${mockArbitPositionOne.id} on ${
          chains[mockArbitPositionOne.chain].name
        }, position already exist`
      );
    });

    test("should not add position to db for none valid id", async () => {
      await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockEtherPositionOne.chain].name
        } 100000000`
      );
      await new Promise((r) => setTimeout(r, sleep));
      const addPositionRes = await getRespose();
      expect(addPositionRes).toEqual(
        "No inital data found for position 100000000 on chain ethereum"
      );
    });

    test("should not add arbitrum position to db for none valid Txhash", async () => {
      await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionOne.chain].name
        } ${mockArbitPositionOne.id} 0x123`
      );
      await new Promise((r) => setTimeout(r, sleep));
      const addPositionRes = await getRespose();
      expect(addPositionRes).toEqual("TX hash is not valid");
    });
  });

  describe("discord bot - GetAllActivePositions", () => {
    test("should get all active positions", async () => {
      await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> GetAllActivePositions`
      );

      await new Promise((r) => setTimeout(r, 10000));

      const getAllActivePositionsRes = await getRespose();
      expect(getAllActivePositionsRes).toEqual(
        `Positions: \n- id: \`${mockEtherPositionOne.id}\` , chain: \`${
          chains[mockEtherPositionOne.chain].name
        }\` \n- id: \`${mockArbitPositionOne.id}\` , chain: \`${
          chains[mockArbitPositionOne.chain].name
        }\``
      );
    });
  });

  describe("discord bot - RemovePosition", () => {
    test("should remove ethereum position from db", async () => {
      await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> RemovePosition ${
          chains[mockEtherPositionOne.chain].name
        } ${mockEtherPositionOne.id}`
      );
      await new Promise((r) => setTimeout(r, sleep));
      const removePositionRes = await getRespose();
      expect(removePositionRes).toEqual(
        `Position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chain].name
        } removed successfully`
      );
    });

    test("should remove arbitrum position from db", async () => {
      await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> RemovePosition ${
          chains[mockArbitPositionOne.chain].name
        } ${mockArbitPositionOne.id}`
      );
      await new Promise((r) => setTimeout(r, sleep));
      const removePositionRes = await getRespose();
      expect(removePositionRes).toEqual(
        `Position ${mockArbitPositionOne.id} on ${
          chains[mockArbitPositionOne.chain].name
        } removed successfully`
      );
    });
  });
});
