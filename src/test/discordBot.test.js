require("../discordBot/discordBot.js");

const factory = require("./factories.js");
const { chains } = require("../utils/chains.js");
const {
  getClientReady,
  sendMsg,
  getReplyToMessage,
  getAlertMessage,
} = require("./helpers/discordTestClientHelper");
const {
  mockEtherPositionOne,
  mockEtherPositionWithDataOne,
  mockArbitPositionOne,
  mockArbitPositionWithDataOne,
  mockArbitPositionTwo,
} = require("./mocks.js");

const { alertsTypes } = require("../utils/alertsTypes.js");

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
    test("Should get help menu from bot", async () => {
      const msgId = await sendMsg(`<@${process.env.DISCORD_CLIENT_ID}> help`);
      await sleep();
      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        "I can help you with the following commands: \n- `GetAllPositions` \n- `GetActiveAlerts` \n- `AddPosition` \n- `ReactivatePosition` \n- `RemovePosition` \n- `DeactivatePosition` \n- `MuteAlerts` \n- `UnmuteAlerts`"
      );
    });
    test("Should not get help menu from bot for diffrent keyword", async () => {
      const msgId = await sendMsg(`<@${process.env.DISCORD_CLIENT_ID}> hell`);
      await sleep();
      const response = await getReplyToMessage(msgId);

      expect(response).toEqual(
        "I don't understand this command, try to use `help` to find posible commands"
      );
    });
  });

  describe("discord bot - AddPosition", () => {
    afterAll(async () => {
      await factory.removePositionFromDB(mockEtherPositionOne);
      await factory.removePositionFromDB(mockArbitPositionOne);
    });

    test("should add ethereum position to db", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockEtherPositionOne.chainId].name
        } ${mockEtherPositionOne.id}`
      );

      await longSleep();

      const addPositionRes = await getReplyToMessage(msgId);
      expect(addPositionRes).toEqual(
        `Position ${mockEtherPositionOne.id} on chain ${
          chains[mockEtherPositionOne.chainId].name
        } was added successfully`
      );
    });

    test("should add arbitrum position to db", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionOne.chainId].name
        } ${mockArbitPositionOne.id} ${mockArbitPositionOne.txHash}`
      );

      await longSleep();

      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockArbitPositionOne.id} on chain ${
          chains[mockArbitPositionOne.chainId].name
        } was added successfully`
      );
    });

    test("should not add arbitrum position to db without txhash", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionTwo.chainId].name
        } ${mockArbitPositionTwo.id}`
      );
      await sleep();
      const response = await getReplyToMessage(msgId);

      expect(response).toEqual(
        `No inital data found for position 2 on chain arbitrum`
      );
    });

    test("should not add position to db for none valid chain", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition sababirum ${mockArbitPositionOne.id} 0xa123`
      );
      await sleep();
      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        "Chain id not supported, must be ethereum or arbitrum"
      );
    });

    test("should not add position to db if already exists", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionOne.chainId].name
        } ${mockArbitPositionOne.id} ${mockArbitPositionOne.txHash}`
      );

      await sleep();
      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `could not save postition ${mockArbitPositionOne.id} on ${
          chains[mockArbitPositionOne.chainId].name
        }, position already exist`
      );
    });

    test("should not add position to db for none valid id", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockEtherPositionOne.chainId].name
        } 100000000`
      );
      await sleep();
      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        "No inital data found for position 100000000 on chain ethereum"
      );
    });

    test("should not add to db arbitrum position with invalid Txhash", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> AddPosition ${
          chains[mockArbitPositionOne.chainId].name
        } ${mockArbitPositionOne.id} 0x123`
      );
      await sleep();
      const response = await getReplyToMessage(msgId);
      expect(response).toEqual("TX hash is not valid");
    });
  });

  describe("discord bot - GetAllPositions", () => {
    beforeAll(async () => {
      await factory.addPositionIntoDB(mockEtherPositionWithDataOne);
      await factory.addPositionIntoDB(mockArbitPositionWithDataOne);
    });

    afterAll(async () => {
      await factory.removePositionFromDB(mockEtherPositionOne);
      await factory.removePositionFromDB(mockArbitPositionOne);
    });

    test("should deactivate ethereum position", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> DeactivatePosition ${
          chains[mockEtherPositionOne.chainId].name
        } ${mockEtherPositionOne.id}`
      );

      await sleep();

      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chainId].name
        } set to active=false.`
      );
    });

    test("should get all positions", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> GetAllPositions`
      );

      await sleep();

      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Positions: \n- id: \`${mockArbitPositionOne.id}\`, chain: \`${
          chains[mockArbitPositionOne.chainId].name
        }\`, Active: \`${mockArbitPositionOne.ActivePosition}\` \n- id: \`${
          mockEtherPositionOne.id
        }\`, chain: \`${
          chains[mockEtherPositionOne.chainId].name
        }\`, Active: \`false\``
      );
    });

    test("should reactivate ethereum position", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> ReactivatePosition ${
          chains[mockEtherPositionOne.chainId].name
        } ${mockEtherPositionOne.id}`
      );

      await sleep();

      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chainId].name
        } set to active=true.`
      );
    });

    test("should get all positions", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> GetAllPositions`
      );

      await sleep();

      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Positions: \n- id: \`${mockArbitPositionOne.id}\`, chain: \`${
          chains[mockArbitPositionOne.chainId].name
        }\`, Active: \`${mockArbitPositionOne.ActivePosition}\` \n- id: \`${
          mockEtherPositionOne.id
        }\`, chain: \`${
          chains[mockEtherPositionOne.chainId].name
        }\`, Active: \`${mockEtherPositionOne.ActivePosition}\``
      );
    });
  });

  describe("discord bot - GetActiveAlerts", () => {
    beforeAll(async () => {
      await factory.addPositionIntoDB(mockEtherPositionWithDataOne);
    });

    afterAll(async () => {
      await factory.removePositionFromDB(mockEtherPositionOne);
    });

    test("should get all active alerts for position", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> GetActiveAlerts ${
          chains[mockEtherPositionOne.chainId].name
        } ${mockEtherPositionOne.id}`
      );

      await sleep();

      const response = await getReplyToMessage(msgId);

      expect(response).toEqual(
        `Active alerts for position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chainId].name
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
          chains[mockEtherPositionOne.chainId].name
        } ${mockEtherPositionOne.id}`
      );

      await sleep();

      const response2 = await getReplyToMessage(msgId2);

      expect(response2).toEqual(
        `Active alerts for position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chainId].name
        }:\n- OutOfBounds: 🚨\n- OldPosition: ✅\n- PNL: ✅\n- IMPLoss: ✅`
      );
    });
  });

  describe("discord bot - RemovePosition", () => {
    beforeAll(async () => {
      await factory.addPositionIntoDB(mockEtherPositionWithDataOne);
      await factory.addPositionIntoDB(mockArbitPositionWithDataOne);
    });

    afterAll(async () => {
      await factory.removePositionFromDB(mockEtherPositionOne);
      await factory.removePositionFromDB(mockArbitPositionOne);
    });

    test("should remove ethereum position from db", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> RemovePosition ${
          chains[mockEtherPositionOne.chainId].name
        } ${mockEtherPositionOne.id}`
      );
      await sleep();
      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chainId].name
        } removed successfully`
      );
    });

    test("should remove arbitrum position from db", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> RemovePosition ${
          chains[mockArbitPositionOne.chainId].name
        } ${mockArbitPositionOne.id}`
      );
      await sleep();
      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockArbitPositionOne.id} on ${
          chains[mockArbitPositionOne.chainId].name
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
          chains[mockEtherPositionOne.chainId].name
        } ${mockEtherPositionOne.id}`
      );
      await sleep();

      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chainId].name
        } was muted successfully`
      );
    });

    test("should not Mute unavilable Active Alert id", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> MuteAlerts ${
          chains[mockEtherPositionOne.chainId].name
        } 100000000`
      );
      await sleep();

      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Failed to mute position 100000000 on ${
          chains[mockEtherPositionOne.chainId].name
        }, position not found 100000000, 1`
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
          chains[mockEtherPositionOne.chainId].name
        } ${mockEtherPositionOne.id}`
      );
      await sleep();

      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Position ${mockEtherPositionOne.id} on ${
          chains[mockEtherPositionOne.chainId].name
        } was unmuted successfully`
      );
    });

    test("should not Unmute unavilable Active Alert id", async () => {
      const msgId = await sendMsg(
        `<@${process.env.DISCORD_CLIENT_ID}> UnmuteAlerts ${
          chains[mockEtherPositionOne.chainId].name
        } 100000000`
      );
      await sleep();

      const response = await getReplyToMessage(msgId);
      expect(response).toEqual(
        `Failed to unmute position 100000000 on ${
          chains[mockEtherPositionOne.chainId].name
        }, position not found 100000000, 1`
      );
    });
  });

  // describe("discord bot - checkForAlerts and notify", () => {
  //   beforeAll(async () => {
  //     await factory.addPositionIntoDB(mockEtherPositionWithDataOne);
  //   });

  //   afterAll(async () => {
  //     await factory.removePositionFromDB(mockEtherPositionOne);
  //   });

  //   test("should notify for active out of bounds alert", async () => {
  //     await factory.setAlertActiveForTest(
  //       mockEtherPositionOne,
  //       alertsTypes.OUT_OF_BOUNDS,
  //       true
  //     );

  //     await longSleep();

  //     const res = await getAlertMessage();
  //     expect(res).toEqual(
  //       `@everyone\n      🚨  POSITION \`${mockEtherPositionOne.id}\` **out of bounds** 🚨`
  //     );
  //   });

  // test("should notify for active old position alert", async () => {
  //   await factory.setAlertActiveForTest(
  //     mockEtherPositionOne,
  //     alertsTypes.OLD_POSITION,
  //     true
  //   );

  //   await longSleep();

  //   const res = await getAlertMessage();
  //   expect(res).toEqual(
  //     `@everyone\n      🚨  POSITION \`${mockEtherPositionOne.id}\` **old position** 🚨`
  //   );
  // });

  // test("should notify for active PNL alert", async () => {
  //   await factory.setAlertActiveForTest(
  //     mockEtherPositionOne,
  //     alertsTypes.PNL,
  //     true
  //   );

  //   await longSleep();

  //   const res = await getAlertMessage();
  //   expect(res).toEqual(
  //     `@everyone\n      🚨  POSITION \`${mockEtherPositionOne.id}\` **permanent loss** 🚨`
  //   );
  // });

  // test("should notify for active impermanent loss alert", async () => {
  //   await factory.setAlertActiveForTest(
  //     mockEtherPositionOne,
  //     alertsTypes.IMP_LOSS,
  //     true
  //   );

  //   await longSleep();

  //   const res = await getAlertMessage();
  //   expect(res).toEqual(
  //     `@everyone\n      🚨  POSITION \`${mockEtherPositionOne.id}\` **impermanent loss** 🚨`
  //   );
  // });
  // });
});
