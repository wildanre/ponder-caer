module.exports = {
  apps: [{
    name: 'ponder-caer',
    script: 'node_modules/.bin/ponder',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Restart the app if it crashes 5 times in 1 minute
    max_restarts: 5,
    min_uptime: '10s',
    // Auto restart if memory usage exceeds 1GB
    max_memory_restart: '1G',
    // Health check
    health_check_http: {
      port: 3000,
      path: '/api/health',
      max_restarts: 3,
      interval: 30000
    }
  }]
};
