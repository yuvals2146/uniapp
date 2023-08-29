const chains = require("../../chains.js");
const { queryTheGraphForMintTransactHash } = require("../../queryTheGraph");

const validPosition = {
  id: 482139,
  chain: 1,
};

const unvalidPosition = {
  id: 1000000000,
  chain: 1,
};

const validMintTxHash =
  "0x4c2056c796abd55edbfb65e25687a80f2f357b2726928cb33f61c4511f01373b";

describe("TheGraph - get Tx Hash From Position id", () => {
  test("should retreive valid tx hash for position", async () => {
    const res = await queryTheGraphForMintTransactHash(validPosition);
    expect(res).toEqual(validMintTxHash);
  });

  test("should not retreive tx hash for unvalid position", async () => {
    try {
      await queryTheGraphForMintTransactHash(unvalidPosition);
    } catch (error) {
      // not sure it needed if all types the same: expect(error).toBeInstanceOf(Error);

      expect(error).toHaveProperty(
        "message",
        "theGraph - could not get mint TX for position 1000000000 on chain id 1"
      );
    }
  });
});
