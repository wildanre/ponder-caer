import { createConfig, factory } from "ponder";

import { lendingPoolFactoryAbi } from "./abis/lendingPoolFactoryAbi";
import { lendingPoolAbi } from "./abis/lendingPoolAbi";
import { isHealthyAbi } from "./abis/isHealthyAbi";
import { lendingPoolDeployerAbi } from "./abis/lendingPoolDeployerAbi";
import { positionAbi } from "./abis/positionAbi";

export default createConfig({
  chains: {
    arbitrum: {
      id: 421614,
      rpc:
        process.env.ARB_SEPOLIA_RPC_URL ||
        "https://sepolia-rollup.arbitrum.io/rpc",
    },
  },
  contracts: {
    isHealthy: {
      chain: "arbitrum",
      abi: isHealthyAbi as any,
      address: "0x3e8915376e2afE25915BA66b45AC5df54df61F19",
      startBlock: 174058000,
    },

    lendingPoolDeployer: {
      chain: "arbitrum",
      abi: lendingPoolDeployerAbi as any,
      address: "0x722Ca412b27f38157e94AC5332A6D90f5aB7c5EF",
      startBlock: 174058000,
    },

    factory: {
      chain: "arbitrum",
      abi: lendingPoolFactoryAbi as any,
      address: "0xB1fa9e45fBd6668d287FcAfE7ed9f37F7F24a8Ed",
      startBlock: 174058000,
    },

    pool: {
      chain: "arbitrum",
      abi: lendingPoolAbi as any,
      address: "0x0a97cC170B77362Fd29edC650D0BFf009B7b30eD",
      startBlock: 174058000,
    },

    position: {
      chain: "arbitrum",
      abi: positionAbi as any,
      address: "0x616ea99db493b2200b62f13a15675954C0647C8e",
      startBlock: 174058000,
    },
  },
});
