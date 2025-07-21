export const isHealthyAbi = [

    { inputs: [], name: "InsufficientCollateral", type: "error" },
    {
      inputs: [
        { internalType: "address", name: "borrowToken", type: "address" },
        { internalType: "address", name: "factory", type: "address" },
        { internalType: "address", name: "addressPositions", type: "address" },
        { internalType: "uint256", name: "ltv", type: "uint256" },
        { internalType: "uint256", name: "totalBorrowAssets", type: "uint256" },
        { internalType: "uint256", name: "totalBorrowShares", type: "uint256" },
        { internalType: "uint256", name: "userBorrowShares", type: "uint256" },
      ],
      name: "_isHealthy",
      outputs: [],
      stateMutability: "view",
      type: "function",
    },
  ] as const;
