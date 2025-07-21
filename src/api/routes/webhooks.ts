import { Hono } from "hono";
import { serializeBigInt } from '../index';

export const webhookRoutes = new Hono();

// POST /webhooks/transaction - Handle transaction notifications from frontend
webhookRoutes.post("/webhooks/transaction", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      txHash, 
      type, 
      userAddress, 
      poolAddress, 
      amount, 
      status = 'pending'
    } = body;

    // Validate required fields
    if (!txHash || !type || !userAddress) {
      return c.json({
        success: false,
        error: "Missing required fields: txHash, type, userAddress"
      }, 400);
    }

    // In a real application, you might:
    // 1. Store the pending transaction in a database
    // 2. Set up monitoring for the transaction
    // 3. Update user interface with pending status
    // 4. Trigger notifications
    
    console.log("📝 Transaction webhook received:", {
      txHash,
      type,
      userAddress,
      poolAddress,
      amount,
      status,
      timestamp: Date.now()
    });

    // For now, just acknowledge the webhook
    const webhook = {
      id: `webhook_${Date.now()}`,
      txHash,
      type,
      userAddress,
      poolAddress,
      amount: amount ? Number(amount) : null,
      status,
      receivedAt: Math.floor(Date.now() / 1000),
      processed: true
    };

    return c.json({
      success: true,
      data: serializeBigInt(webhook),
      message: "Transaction webhook processed successfully"
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to process transaction webhook",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /webhooks/price-alert - Handle price alert notifications
webhookRoutes.post("/webhooks/price-alert", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      userAddress, 
      tokenAddress, 
      alertType, // 'above', 'below'
      targetPrice, 
      currentPrice, 
      alertId 
    } = body;

    if (!userAddress || !tokenAddress || !alertType || !targetPrice || !currentPrice) {
      return c.json({
        success: false,
        error: "Missing required fields"
      }, 400);
    }

    console.log("💰 Price alert webhook received:", {
      userAddress,
      tokenAddress,
      alertType,
      targetPrice,
      currentPrice,
      alertId,
      timestamp: Date.now()
    });

    const alert = {
      id: alertId || `alert_${Date.now()}`,
      userAddress,
      tokenAddress,
      alertType,
      targetPrice: Number(targetPrice),
      currentPrice: Number(currentPrice),
      triggeredAt: Math.floor(Date.now() / 1000),
      processed: true
    };

    return c.json({
      success: true,
      data: serializeBigInt(alert),
      message: "Price alert webhook processed successfully"
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to process price alert webhook",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /webhooks/liquidation-warning - Handle liquidation warning notifications
webhookRoutes.post("/webhooks/liquidation-warning", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      userAddress, 
      positionId, 
      healthScore, 
      warningLevel, // 'warning', 'critical'
      collateralValue,
      debtValue
    } = body;

    if (!userAddress || !positionId || !healthScore || !warningLevel) {
      return c.json({
        success: false,
        error: "Missing required fields"
      }, 400);
    }

    console.log("⚠️ Liquidation warning webhook received:", {
      userAddress,
      positionId,
      healthScore,
      warningLevel,
      collateralValue,
      debtValue,
      timestamp: Date.now()
    });

    const warning = {
      id: `warning_${Date.now()}`,
      userAddress,
      positionId,
      healthScore: Number(healthScore),
      warningLevel,
      collateralValue: collateralValue ? Number(collateralValue) : null,
      debtValue: debtValue ? Number(debtValue) : null,
      triggeredAt: Math.floor(Date.now() / 1000),
      processed: true
    };

    return c.json({
      success: true,
      data: serializeBigInt(warning),
      message: "Liquidation warning webhook processed successfully"
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to process liquidation warning webhook",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /webhooks/user-preference - Handle user preference updates
webhookRoutes.post("/webhooks/user-preference", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      userAddress, 
      preferences = {}, 
      action = 'update' // 'update', 'reset'
    } = body;

    if (!userAddress) {
      return c.json({
        success: false,
        error: "Missing required field: userAddress"
      }, 400);
    }

    console.log("⚙️ User preference webhook received:", {
      userAddress,
      preferences,
      action,
      timestamp: Date.now()
    });

    // In a real application, you would:
    // 1. Validate the preference structure
    // 2. Store preferences in database
    // 3. Update user's notification settings
    // 4. Apply new settings to monitoring systems

    const preferenceUpdate = {
      id: `pref_${Date.now()}`,
      userAddress,
      preferences,
      action,
      updatedAt: Math.floor(Date.now() / 1000),
      processed: true
    };

    return c.json({
      success: true,
      data: serializeBigInt(preferenceUpdate),
      message: "User preference webhook processed successfully"
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to process user preference webhook",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /webhooks/status - Get webhook system status
webhookRoutes.get("/webhooks/status", async (c) => {
  try {
    const status = {
      webhookServer: "operational",
      lastProcessed: Math.floor(Date.now() / 1000),
      supportedWebhooks: [
        "transaction",
        "price-alert", 
        "liquidation-warning",
        "user-preference"
      ],
      uptime: process.uptime(),
      version: "1.0.0"
    };

    return c.json({
      success: true,
      data: status
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to get webhook status",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /webhooks/test - Test webhook endpoint
webhookRoutes.post("/webhooks/test", async (c) => {
  try {
    const body = await c.req.json();
    const { type = 'test', payload = {} } = body;

    console.log("🧪 Test webhook received:", {
      type,
      payload,
      timestamp: Date.now()
    });

    const testResult = {
      id: `test_${Date.now()}`,
      type,
      payload,
      receivedAt: Math.floor(Date.now() / 1000),
      processed: true,
      success: true
    };

    return c.json({
      success: true,
      data: testResult,
      message: "Test webhook processed successfully"
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to process test webhook",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});
