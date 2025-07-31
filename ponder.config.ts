import { createConfig, factory } from "ponder";
import { config } from "dotenv";

// Load environment variables
config();

import { lendingPoolFactoryAbi } from "./abis/lendingPoolFactoryAbi";
import { lendingPoolAbi } from "./abis/lendingPoolAbi";
import { isHealthyAbi } from "./abis/isHealthyAbi";
import { lendingPoolDeployerAbi } from "./abis/lendingPoolDeployerAbi";
import { positionAbi } from "./abis/positionAbi";

export default createConfig({
  chains: {
    etherlink: {
      id: 128123,
      rpc:
        process.env.ETHERLINK_TESTNET_RPC_URL ||
        "https://node.ghostnet.etherlink.com",
    },
  },
  contracts: {
    isHealthy: {
      chain: "etherlink",
      abi: isHealthyAbi as any,
      address: "0x7234365A362e33C93C8E9eeAd107266368C57f0d",
      startBlock: 20786093,
    },

    lendingPoolDeployer: {
      chain: "etherlink",
      abi: lendingPoolDeployerAbi as any,
      address: "0xFaE7aC9665bd0F22A3b01C8C4F22B83581Ea4Ba9",
      startBlock: 20786093,
    },

    factory: {
      chain: "etherlink",
      abi: lendingPoolFactoryAbi as any,
      address: "0x6361193Eb93685c0218AD2c698809c99CF6d7e38",
      startBlock: 20786093,
    },

    pool: {
      chain: "etherlink",
      abi: lendingPoolAbi as any,
      address: "0xcE05d498fED4B72620b8D42954002bdEbe65Fb0e",
      startBlock: 20786093,
    },

    position: {
      chain: "etherlink",
      abi: positionAbi as any,
      address: "0x4aF0b3462411a18934318e7F17E905C77F078b5b",
      startBlock: 20786093,
    },
  },
});
