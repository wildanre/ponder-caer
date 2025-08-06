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
        process.env.ETHERLINK_TESTNET_RPC_URL
    },
  },
  contracts: {
    isHealthy: {
      chain: "etherlink",
      abi: isHealthyAbi as any,
      address: "0x7234365A362e33C93C8E9eeAd107266368C57f0d",
      startBlock: 20856651,
    },

    lendingPoolDeployer: {
      chain: "etherlink",
      abi: lendingPoolDeployerAbi as any,
      address: "0x15b469dA6a57f8E67EE3fdA0CCd3699e159DeeE9",
      startBlock: 20856651,
    },

    factory: {
      chain: "etherlink",
      abi: lendingPoolFactoryAbi as any,
      address: "0x86CA4a34eB2C11F7406220E402cc689bb811C0CD",
      startBlock: 20856651,
    },

    pool: {
      chain: "etherlink",
      abi: lendingPoolAbi as any,
      address: "0xb4F8A55030a9e2b3B52d6267223915846eB2d3EC",
      startBlock: 20856651,
    },

    position: {
      chain: "etherlink",
      abi: positionAbi as any,
      address: "0x8A1c8f849f0C109bAE01A3d57264d453D23d6329",
      startBlock: 20856651,
    },
  },
});
