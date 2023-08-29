if (process.env.NODE_ENV !== "test") {
  throw new Error("Please use the test environment!");
}

module.exports = {
  testEnvironment: "node",
  testTimeout: 20000,
  moduleDirectories: ["node_modules", "<rootDir>/src"],
};
