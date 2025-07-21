export const lendingPoolDeployerAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [], name: "OnlyFactoryCanCall", type: "error" },
  { inputs: [], name: "OnlyOwnerCanCall", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "_collateralToken", type: "address" },
      { internalType: "address", name: "_borrowToken", type: "address" },
      { internalType: "uint256", name: "_ltv", type: "uint256" },
    ],
    name: "deployLendingPool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_factory", type: "address" }],
    name: "setFactory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
