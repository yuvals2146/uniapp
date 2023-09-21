const discordBot = require("../discordBot/discordbot.js");
const factory = require("./factories.js");
const { chains } = require("../utils/chains.js");
const {
  getClientReady,
  sendMsg,
  getReplayToMessage,
  getAlertMessage,
} = require("./helpers/discordTestClinetHelper");
const {
  mockEtherPositionOne,
  mockEtherPositionWithDataOne,
  mockArbitPositionOne,
  mockArbitPositionTwo,
} = require("./mocks.js");

const { alertsTypes } = require("../utils/alertsTypes.js");
const { loadAllPositions } = require("../db/loadPositionDataDB.js");

const longSleep = () => new Promise((r) => setTimeout(r, 10000));
const sleep = () => new Promise((r) => setTimeout(r, 5000));

describe("discordBot", () => {
  beforeAll(async () => {
    await longSleep();
    const clientIsReady = await getClientReady();
    expect(clientIsReady).toEqual(true);
    sendMsg(
      `---------------------------------------------------- \n this is an autmated test for discord bot on ***${
        process.env.ENV === "ci-test" ? "CI" : "local"
      }*** \n----------------------------------------------------`
    );
  });

  afterAll(async () => {
    await factory.removePositionFromDB(mockEtherPositionOne);
    await factory.removePositionFromDB(mockArbitPositionOne);
    sendMsg(
      `---------------------------------------------------- \n end of the autmated test for discord bot on ${
        process.env.ENV === "ci-test" ? "CI" : "local"
      } \n----------------------------------------------------`
    );
  });
  describe("discord bot - help", () => {
    test("should ask for help form bot", async () => {
      const msgId = await sendMsg(`<@${process.env.DISCORD_CLIENT_ID}> help`);
      await sleep();
      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        "I can help you with the following commands: \n- `GetAllActivePositions` \n- `GetActiveAlerts` \n- `AddPosition` \n- `RemovePosition` \n- `MuteAlerts` \n- `UnmuteAlerts`"
      );
    });
    test("should not recived help menu for diffrent keyword form bot", async () => {
      const msgId = await sendMsg(`<@${process.env.DISCORD_CLIENT_ID}> hell`);
      await sleep();
      const response = await getReplayToMessage(msgId);

      expect(response).toEqual(
        "I don't understand this command, try to use `help` to find posible commands"
      );
    });
  });

  describe("discord bot - AddPosition", () => {
    test("should add ethereum position to db", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockEtherPositionOne.chain].name
        } ${mockEtherPositionOne.id}`
      );

      await sleep();
      const addPositionRes = await getReplayToMessage(msgId);
      expect(addPositionRes).toEqual(
        `Position ${mockEtherPositionOne.id} on chain ${
          chains[mockEtherPositionOne.chain].name
        } was added successfully`
      );
    });

    test("should add arbitrum position to db", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionOne.chain].name
        } ${mockArbitPositionOne.id} ${mockArbitPositionOne.txHash}`
      );
      await sleep();
      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockArbitPositionOne.id} on chain ${
          chains[mockArbitPositionOne.chain].name
        } was added successfully`
      );
    });

    test("should not add arbitrum position to db without txhash", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionTwo.chain].name
        } ${mockArbitPositionTwo.id}`
      );
      await sleep();
      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `No inital data found for position 2 on chain arbitrum`
      );
    });

    test("should not add position to db for none valid chain", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition sababirum ${mockArbitPositionOne.id} 0xa123`
      );
      await sleep();
      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        "Chain id not supported, must be ethereum or arbitrum"
      );
    });

    test("should not add position to db for if alredy exist", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionOne.chain].name
        } ${mockArbitPositionOne.id} ${mockArbitPositionOne.txHash}`
      );

      await sleep();
      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `could not save postition ${mockArbitPositionOne.id} on ${
          chains[mockArbitPositionOne.chain].name
        }, position already exist`
      );
    });

    test("should not add position to db for none valid id", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockEtherPositionOne.chain].name
        } 100000000`
      );
      await sleep();
      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        "No inital data found for position 100000000 on chain ethereum"
      );
    });

    test("should not add arbitrum position to db for none valid Txhash", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionOne.chain].name
        } ${mockArbitPositionOne.id} 0x123`
      );
      await sleep();
      const response = await getReplayToMessage(msgId);
      expect(response).toEqual("TX hash is not valid");
    });
  });

  describe("discord bot - GetAllActivePositions", () => {
    test("should get all active positions", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> GetAllActivePositions`
      );

      await sleep();

      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `Positions: \n- id: \`${mockEtherPositionOne.id}\` , chain: \`${
          chains[mockEtherPositionOne.chain].name
        }\` \n- id: \`${mockArbitPositionOne.id}\` , chain: \`${
          chains[mockArbitPositionOne.chain].name
        }\``
      );
    });
  });

  describe("discord bot - GetActiveAlerts", () => {
    test("should get all active alerts for position", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> GetActiveAlerts ${
          chains[mockEtherPositionOne.chain].name
        } ${mockEtherPositionOne.id}`
      );
      await sleep();

      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `Active alerts for position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chain].name
        }:\n- OutOfBounds: ✅\n- OldPosition: ✅\n- PNL: ✅\n- IMPLoss: ✅`
      );

      await factory.setAlertActiveForTest(
        mockEtherPositionOne,
        alertsTypes.OUT_OF_BOUNDS,
        false
      );

      await sleep();

      const msgId2 = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> GetActiveAlerts ${
          chains[mockEtherPositionOne.chain].name
        } ${mockEtherPositionOne.id}`
      );

      await sleep();

      const response2 = await getReplayToMessage(msgId2);

      expect(response2).toEqual(
        `Active alerts for position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chain].name
        }:\n- OutOfBounds: 🚨\n- OldPosition: ✅\n- PNL: ✅\n- IMPLoss: ✅`
      );
    });
  });

  describe("discord bot - RemovePosition", () => {
    test("should remove ethereum position from db", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> RemovePosition ${
          chains[mockEtherPositionOne.chain].name
        } ${mockEtherPositionOne.id}`
      );
      await sleep();
      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chain].name
        } removed successfully`
      );
    });

    test("should remove arbitrum position from db", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> RemovePosition ${
          chains[mockArbitPositionOne.chain].name
        } ${mockArbitPositionOne.id}`
      );
      await sleep();
      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockArbitPositionOne.id} on ${
          chains[mockArbitPositionOne.chain].name
        } removed successfully`
      );
    });
  });

  describe("discord bot - MuteAlerts", () => {
    beforeAll(async () => {
      await factory.addPositionIntoDB(mockEtherPositionWithDataOne);
    });

    afterAll(async () => {
      await factory.removePositionFromDB(mockEtherPositionOne);
    });
    test("should Mute Active Alert", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> MuteAlerts ${
          chains[mockEtherPositionOne.chain].name
        } ${mockEtherPositionOne.id}`
      );
      await sleep();

      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chain].name
        } was muted successfully`
      );
    });

    test("should not Mute unavilable Active Alert id", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> MuteAlerts ${
          chains[mockEtherPositionOne.chain].name
        } 100000000`
      );
      await sleep();

      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `Failed to mute position 100000000 on ${
          chains[mockEtherPositionOne.chain].name
        }, could not find Position 100000000`
      );
    });
  });

  describe("discord bot - UnMuteAlerts", () => {
    beforeAll(async () => {
      await factory.addPositionIntoDB(mockEtherPositionWithDataOne);
    });

    afterAll(async () => {
      await factory.removePositionFromDB(mockEtherPositionOne);
    });

    test("should Unmute Active Alert", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> UnmuteAlerts ${
          chains[mockEtherPositionOne.chain].name
        } ${mockEtherPositionOne.id}`
      );
      await sleep();

      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chain].name
        } was unmuted successfully`
      );
    });

    test("should not Unmute unavilable Active Alert id", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> UnmuteAlerts ${
          chains[mockEtherPositionOne.chain].name
        } 100000000`
      );
      await sleep();

      const response = await getReplayToMessage(msgId);
      expect(response).toEqual(
        `Failed to unmute position 100000000 on ${
          chains[mockEtherPositionOne.chain].name
        }, could not find Position 100000000`
      );
    });
  });

  describe("discord bot - checkForAlerts and notify", () => {
    beforeAll(async () => {
      await factory.addPositionIntoDB(mockEtherPositionWithDataOne);
    });

    afterAll(async () => {
      await factory.removePositionFromDB(mockEtherPositionOne);
    });

    test("should notify for active out of bounds alert", async () => {
      await factory.setAlertActiveForTest(
        mockEtherPositionOne,
        alertsTypes.OUT_OF_BOUNDS,
        true
      );

      await longSleep();

      const res = await getAlertMessage();
      expect(res).toEqual(
        `@everyone\n      🚨  POSITION \`${mockEtherPositionOne.id}\` **out of bounds** 🚨`
      );
    });

    test("should notify for active old position alert", async () => {
      await factory.setAlertActiveForTest(
        mockEtherPositionOne,
        alertsTypes.OLD_POSITION,
        true
      );

      await longSleep();

      const res = await getAlertMessage();
      expect(res).toEqual(
        `@everyone\n      🚨  POSITION \`${mockEtherPositionOne.id}\` **old position** 🚨`
      );
    });

    test("should notify for active PNL alert", async () => {
      await factory.setAlertActiveForTest(
        mockEtherPositionOne,
        alertsTypes.PNL,
        true
      );
      await longSleep();
      const res = await getAlertMessage();
      expect(res).toEqual(
        `@everyone\n      🚨  POSITION \`${mockEtherPositionOne.id}\` **permanent loss** 🚨`
      );
    });

    test("should notify for active impermanent loss alert", async () => {
      await factory.setAlertActiveForTest(
        mockEtherPositionOne,
        alertsTypes.IMP_LOSS,
        true
      );
      await longSleep();
      const res = await getAlertMessage();
      expect(res).toEqual(
        `@everyone\n      🚨  POSITION \`${mockEtherPositionOne.id}\` **impermanent loss** 🚨`
      );
    });
  });
});
