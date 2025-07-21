import { Hono } from "hono";
import { serializeBigInt } from '../index';

export const tokenRoutes = new Hono();

// GET /tokens - Get token information (static data for now)
tokenRoutes.get("/tokens", async (c) => {
  try {
    // Since we don't have a tokens table, we'll provide basic token info
    // In a real app, this would come from a tokens database or external API
    const commonTokens = [
      {
        address: "0x0000000000000000000000000000000000000000",
        symbol: "ETH",
        name: "Ethereum",
        decimals: 18,
        isNative: true
      },
      {
        address: "0xA0b86a33E6441c22E712cEF8A7f7C26b6fb60ee5",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        isNative: false
      },
      {
        address: "0x912CE59144191C1204E64559FE8253a0e49E6548", 
        symbol: "ARB",
        name: "Arbitrum",
        decimals: 18,
        isNative: false
      }
    ];

    return c.json({
      success: true,
      data: commonTokens,
      count: commonTokens.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch tokens",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /tokens/:tokenAddress - Get specific token information
tokenRoutes.get("/tokens/:tokenAddress", async (c) => {
  try {
    const tokenAddress = c.req.param("tokenAddress").toLowerCase();
    
    // Mock token data - in real app would fetch from blockchain or database
    const tokenInfo = {
      address: tokenAddress,
      symbol: "UNKNOWN",
      name: "Unknown Token",
      decimals: 18,
      isNative: tokenAddress === "0x0000000000000000000000000000000000000000"
    };

    // Override with known token info if available
    if (tokenAddress === "0xa0b86a33e6441c22e712cef8a7f7c26b6fb60ee5") {
      tokenInfo.symbol = "USDC";
      tokenInfo.name = "USD Coin";
      tokenInfo.decimals = 6;
    } else if (tokenAddress === "0x912ce59144191c1204e64559fe8253a0e49e6548") {
      tokenInfo.symbol = "ARB";
      tokenInfo.name = "Arbitrum";
      tokenInfo.decimals = 18;
    } else if (tokenAddress === "0x0000000000000000000000000000000000000000") {
      tokenInfo.symbol = "ETH";
      tokenInfo.name = "Ethereum";
      tokenInfo.decimals = 18;
      tokenInfo.isNative = true;
    }

    return c.json({
      success: true,
      data: tokenInfo
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch token",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /tokens/metadata - Get multiple token metadata
tokenRoutes.post("/tokens/metadata", async (c) => {
  try {
    const body = await c.req.json();
    const { addresses } = body;

    if (!addresses || !Array.isArray(addresses)) {
      return c.json({
        success: false,
        error: "Token addresses array is required"
      }, 400);
    }

    const tokenMetadata: { [key: string]: any } = {};

    addresses.forEach((address: string) => {
      const lowerAddr = address.toLowerCase();
      
      // Default token info
      let tokenInfo = {
        address: lowerAddr,
        symbol: "UNKNOWN",
        name: "Unknown Token",
        decimals: 18,
        isNative: false
      };

      // Override with known token info
      if (lowerAddr === "0xa0b86a33e6441c22e712cef8a7f7c26b6fb60ee5") {
        tokenInfo = {
          address: lowerAddr,
          symbol: "USDC",
          name: "USD Coin",
          decimals: 6,
          isNative: false
        };
      } else if (lowerAddr === "0x912ce59144191c1204e64559fe8253a0e49e6548") {
        tokenInfo = {
          address: lowerAddr,
          symbol: "ARB",
          name: "Arbitrum",
          decimals: 18,
          isNative: false
        };
      } else if (lowerAddr === "0x0000000000000000000000000000000000000000") {
        tokenInfo = {
          address: lowerAddr,
          symbol: "ETH",
          name: "Ethereum",
          decimals: 18,
          isNative: true
        };
      }

      tokenMetadata[lowerAddr] = tokenInfo;
    });

    return c.json({
      success: true,
      data: tokenMetadata
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch token metadata",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /tokens/prices - Get token prices (mock data)
tokenRoutes.post("/tokens/prices", async (c) => {
  try {
    const body = await c.req.json();
    const { addresses, currency = 'USD' } = body;

    if (!addresses || !Array.isArray(addresses)) {
      return c.json({
        success: false,
        error: "Token addresses array is required"
      }, 400);
    }

    const mockPrices: { [key: string]: any } = {};

    addresses.forEach((address: string) => {
      const lowerAddr = address.toLowerCase();
      
      // Mock price data
      let price = 0;
      let change24h = 0;
      
      if (lowerAddr === "0xa0b86a33e6441c22e712cef8a7f7c26b6fb60ee5") {
        // USDC
        price = 1.00;
        change24h = 0.05;
      } else if (lowerAddr === "0x912ce59144191c1204e64559fe8253a0e49e6548") {
        // ARB
        price = 0.75;
        change24h = -2.34;
      } else if (lowerAddr === "0x0000000000000000000000000000000000000000") {
        // ETH
        price = 3200.50;
        change24h = 4.25;
      }

      mockPrices[lowerAddr] = {
        address: lowerAddr,
        price,
        currency,
        change24h,
        lastUpdated: Math.floor(Date.now() / 1000)
      };
    });

    return c.json({
      success: true,
      data: mockPrices,
      currency
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch token prices",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /tokens/trending - Get trending tokens (mock data)
tokenRoutes.get("/tokens/trending", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "10");
    
    const trendingTokens = [
      {
        address: "0x912ce59144191c1204e64559fe8253a0e49e6548",
        symbol: "ARB",
        name: "Arbitrum",
        price: 0.75,
        change24h: 15.5,
        volume24h: 1250000,
        rank: 1
      },
      {
        address: "0x0000000000000000000000000000000000000000",
        symbol: "ETH",
        name: "Ethereum",
        price: 3200.50,
        change24h: 4.25,
        volume24h: 15000000,
        rank: 2
      },
      {
        address: "0xa0b86a33e6441c22e712cef8a7f7c26b6fb60ee5",
        symbol: "USDC",
        name: "USD Coin",
        price: 1.00,
        change24h: 0.05,
        volume24h: 8500000,
        rank: 3
      }
    ].slice(0, limit);

    return c.json({
      success: true,
      data: trendingTokens,
      count: trendingTokens.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch trending tokens",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});
