#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class PonderRpcRotator {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.rpcUrls = [
      "https://rpc.ankr.com/etherlink_testnet",
      "https://node.ghostnet.etherlink.com"
    ];
    this.currentRpcIndex = 0;
    this.rotationInterval = 90 * 1000; // 90 seconds in ms
    this.ponderProcess = null;
    this.rotationCount = 0;
    
    // Bind methods
    this.rotate = this.rotate.bind(this);
    this.cleanup = this.cleanup.bind(this);
    
    // Setup cleanup handlers
    process.on('SIGINT', this.cleanup);
    process.on('SIGTERM', this.cleanup);
    process.on('exit', this.cleanup);
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}]${colors.reset} ${message}`);
  }

  getCurrentRpc() {
    return this.rpcUrls[this.currentRpcIndex];
  }

  getBackupRpc() {
    return this.rpcUrls[(this.currentRpcIndex + 1) % this.rpcUrls.length];
  }

  updateEnvFile() {
    try {
      let envContent = fs.readFileSync(this.envPath, 'utf8');
      
      const currentRpc = this.getCurrentRpc();
      const backupRpc = this.getBackupRpc();
      
      // Update RPC URLs
      envContent = envContent.replace(
        /ETHERLINK_TESTNET_RPC_URL="[^"]*"/,
        `ETHERLINK_TESTNET_RPC_URL="${currentRpc}"`
      );
      
      envContent = envContent.replace(
        /ETHERLINK_TESTNET_RPC_URL_BACKUP="[^"]*"/,
        `ETHERLINK_TESTNET_RPC_URL_BACKUP="${backupRpc}"`
      );
      
      fs.writeFileSync(this.envPath, envContent);
      
      this.log(`🔄 RPC rotated to: ${currentRpc.split('/').pop()}`, 'success');
      this.log(`📡 Backup set to: ${backupRpc.split('/').pop()}`, 'info');
      
      return true;
    } catch (error) {
      this.log(`❌ Failed to update .env: ${error.message}`, 'error');
      return false;
    }
  }

  async stopPonder() {
    return new Promise((resolve) => {
      if (this.ponderProcess) {
        this.log('🛑 Stopping Ponder...', 'warning');
        
        this.ponderProcess.kill('SIGTERM');
        
        setTimeout(() => {
          if (this.ponderProcess && !this.ponderProcess.killed) {
            this.log('⚠️ Force killing Ponder...', 'warning');
            this.ponderProcess.kill('SIGKILL');
          }
          this.ponderProcess = null;
          resolve();
        }, 3000);
      } else {
        resolve();
      }
    });
  }

  async startPonder() {
    return new Promise((resolve, reject) => {
      this.log('🚀 Starting Ponder...', 'info');
      
      this.ponderProcess = spawn('pnpm', ['dev'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      let startupTimer;
      let hasStarted = false;

      this.ponderProcess.stdout.on('data', (data) => {
        const output = data.toString();
        
        // Check for successful startup indicators
        if (output.includes('GraphQL API ready') || 
            output.includes('Server ready') ||
            output.includes('Listening on')) {
          if (!hasStarted) {
            hasStarted = true;
            clearTimeout(startupTimer);
            this.log('✅ Ponder started successfully', 'success');
            resolve();
          }
        }
        
        // Log important output
        if (output.includes('error') || output.includes('Error')) {
          this.log(`Ponder: ${output.trim()}`, 'error');
        }
      });

      this.ponderProcess.stderr.on('data', (data) => {
        const output = data.toString();
        this.log(`Ponder Error: ${output.trim()}`, 'error');
      });

      this.ponderProcess.on('exit', (code) => {
        this.log(`Ponder exited with code ${code}`, code === 0 ? 'info' : 'error');
        this.ponderProcess = null;
        
        if (!hasStarted) {
          reject(new Error(`Ponder failed to start (exit code: ${code})`));
        }
      });

      // Timeout for startup
      startupTimer = setTimeout(() => {
        if (!hasStarted) {
          this.log('⏰ Ponder startup timeout, assuming success...', 'warning');
          hasStarted = true;
          resolve();
        }
      }, 15000); // 15 second timeout
    });
  }

  async rotate() {
    try {
      this.rotationCount++;
      this.log(`🔄 Starting rotation #${this.rotationCount}...`, 'info');
      
      // Stop current Ponder
      await this.stopPonder();
      
      // Rotate RPC
      this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcUrls.length;
      
      if (!this.updateEnvFile()) {
        throw new Error('Failed to update .env file');
      }
      
      // Wait a bit before restarting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start Ponder with new RPC
      await this.startPonder();
      
      this.log(`✅ Rotation #${this.rotationCount} completed`, 'success');
      this.log(`📊 Next rotation in ${this.rotationInterval / 1000} seconds`, 'info');
      
    } catch (error) {
      this.log(`❌ Rotation #${this.rotationCount} failed: ${error.message}`, 'error');
      
      // Try to recover
      this.log('🔄 Attempting recovery...', 'warning');
      try {
        await this.startPonder();
        this.log('✅ Recovery successful', 'success');
      } catch (recoveryError) {
        this.log(`❌ Recovery failed: ${recoveryError.message}`, 'error');
        process.exit(1);
      }
    }
  }

  async start() {
    this.log('🌟 Ponder RPC Auto-Rotator Started', 'success');
    this.log(`📡 RPC URLs: ${this.rpcUrls.join(', ')}`, 'info');
    this.log(`⏰ Rotation interval: ${this.rotationInterval / 1000} seconds`, 'info');
    this.log('🔄 Press Ctrl+C to stop', 'info');
    
    // Update .env with initial RPC
    this.updateEnvFile();
    
    // Start initial Ponder
    try {
      await this.startPonder();
    } catch (error) {
      this.log(`❌ Failed to start initial Ponder: ${error.message}`, 'error');
      process.exit(1);
    }
    
    // Start rotation timer
    setInterval(this.rotate, this.rotationInterval);
    
    this.log('🔄 Auto-rotation started', 'success');
  }

  async cleanup() {
    this.log('🧹 Cleaning up...', 'warning');
    await this.stopPonder();
    this.log('👋 Goodbye!', 'info');
    process.exit(0);
  }
}

// Start the rotator if this script is run directly
if (require.main === module) {
  const rotator = new PonderRpcRotator();
  rotator.start().catch(error => {
    console.error('Failed to start rotator:', error);
    process.exit(1);
  });
}

module.exports = PonderRpcRotator;
