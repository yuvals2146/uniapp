if (process.env.DISCORD_TEST_CHANNEL_ID == "1148883506643083276") {
  throw new Error(
    "Please use process.env.DISCORD_TEST_CHANNEL_ID",
    process.env.DISCORD_TEST_CHANNEL_ID
  );
}
