#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class EnvRpcRotator {
  constructor() {
    this.envPath = path.join(__dirname, '../.env');
    this.rpcUrls = [
      "https://rpc.ankr.com/etherlink_testnet",
      "https://node.ghostnet.etherlink.com"
    ];
    this.currentIndex = 0;
    this.rotationInterval = 90 * 1000; // 90 seconds (assuming 1 block per second)
  }

  getCurrentRpc() {
    return this.rpcUrls[this.currentIndex];
  }

  getBackupRpc() {
    return this.rpcUrls[(this.currentIndex + 1) % this.rpcUrls.length];
  }

  rotateRpc() {
    this.currentIndex = (this.currentIndex + 1) % this.rpcUrls.length;
    this.updateEnvFile();
    console.log(`🔄 RPC rotated to: ${this.getCurrentRpc()}`);
    console.log(`📡 Backup RPC: ${this.getBackupRpc()}`);
  }

  updateEnvFile() {
    try {
      let envContent = fs.readFileSync(this.envPath, 'utf8');
      
      // Update primary RPC
      envContent = envContent.replace(
        /ETHERLINK_TESTNET_RPC_URL="[^"]*"/,
        `ETHERLINK_TESTNET_RPC_URL="${this.getCurrentRpc()}"`
      );
      
      // Update backup RPC
      envContent = envContent.replace(
        /ETHERLINK_TESTNET_RPC_URL_BACKUP="[^"]*"/,
        `ETHERLINK_TESTNET_RPC_URL_BACKUP="${this.getBackupRpc()}"`
      );
      
      fs.writeFileSync(this.envPath, envContent);
      console.log('✅ .env file updated');
    } catch (error) {
      console.error('❌ Failed to update .env file:', error);
    }
  }

  start() {
    console.log('🚀 Starting RPC rotation service...');
    console.log(`📡 Primary: ${this.getCurrentRpc()}`);
    console.log(`📡 Backup: ${this.getBackupRpc()}`);
    console.log(`⏰ Rotation interval: ${this.rotationInterval / 1000} seconds`);
    
    // Initial env update
    this.updateEnvFile();
    
    // Start rotation
    setInterval(() => {
      this.rotateRpc();
    }, this.rotationInterval);
  }
}

// Start the rotator if this script is run directly
if (require.main === module) {
  const rotator = new EnvRpcRotator();
  rotator.start();
}

module.exports = EnvRpcRotator;
