export class RpcManager {
  private rpcUrls: string[];
  private currentRpcIndex: number = 0;
  private blockCounter: number = 0;
  private readonly BLOCKS_PER_SWITCH = 90;
  private lastSwitchBlock: bigint = 0n;

  constructor() {
    this.rpcUrls = [
      process.env.ETHERLINK_TESTNET_RPC_URL!,
      process.env.ETHERLINK_TESTNET_RPC_URL_BACKUP!
    ].filter(Boolean);
    
    if (this.rpcUrls.length === 0) {
      throw new Error("No RPC URLs configured");
    }
    
    console.log(`🚀 RPC Manager initialized with ${this.rpcUrls.length} endpoints`);
    console.log(`📡 Primary: ${this.rpcUrls[0]}`);
    console.log(`📡 Backup: ${this.rpcUrls[1] || 'None'}`);
  }

  getCurrentRpcUrl(): string {
    return this.rpcUrls[this.currentRpcIndex] ?? this.rpcUrls[0] ?? "";
  }

  shouldSwitchRpc(blockNumber: bigint): boolean {
    // Calculate blocks since last switch
    const blocksSinceSwitch = Number(blockNumber - this.lastSwitchBlock);
    
    if (blocksSinceSwitch >= this.BLOCKS_PER_SWITCH) {
      this.lastSwitchBlock = blockNumber;
      this.switchToNextRpc();
      console.log(`🔄 RPC switched to: ${this.getCurrentRpcUrl().split('/').pop()} at block ${blockNumber}`);
      console.log(`📊 Next switch in ${this.BLOCKS_PER_SWITCH} blocks`);
      return true;
    }
    
    return false;
  }

  private switchToNextRpc(): void {
    this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcUrls.length;
  }

  getRpcInfo(): { current: string; backup: string; blocksUntilSwitch: number; currentIndex: number } {
    const backupIndex = (this.currentRpcIndex + 1) % this.rpcUrls.length;
    return {
      current: this.getCurrentRpcUrl(),
      backup: this.rpcUrls[backupIndex] ?? this.rpcUrls[0] ?? "",
      blocksUntilSwitch: this.BLOCKS_PER_SWITCH - this.blockCounter,
      currentIndex: this.currentRpcIndex
    };
  }

  // Force switch RPC (useful for error handling)
  forceSwitch(): string {
    this.switchToNextRpc();
    this.blockCounter = 0;
    console.log(`⚠️ Force switched to RPC: ${this.getCurrentRpcUrl()}`);
    return this.getCurrentRpcUrl();
  }

  // Get detailed statistics
  getStats(): { 
    currentIndex: number; 
    totalUrls: number; 
    blocksProcessed: number; 
    nextSwitchIn: number;
    lastSwitchBlock: string;
    urls: string[];
  } {
    return {
      currentIndex: this.currentRpcIndex,
      totalUrls: this.rpcUrls.length,
      blocksProcessed: this.blockCounter,
      nextSwitchIn: this.BLOCKS_PER_SWITCH - this.blockCounter,
      lastSwitchBlock: this.lastSwitchBlock.toString(),
      urls: this.rpcUrls
    };
  }

  // Log current status
  logStatus(blockNumber: bigint): void {
    const blocksSinceSwitch = Number(blockNumber - this.lastSwitchBlock);
    const blocksUntilSwitch = this.BLOCKS_PER_SWITCH - blocksSinceSwitch;
    
    if (Number(blockNumber) % 10 === 0) {
      console.log(`📊 Block ${blockNumber} | RPC: ${this.getCurrentRpcUrl().split('/').pop()} | Switch in: ${Math.max(0, blocksUntilSwitch)} blocks`);
    }
  }
}

// Export singleton instance
export const rpcManager = new RpcManager();