#!/usr/bin/env pwsh

# Ponder Development Helper Script
# This script helps you switch between local SQLite and cloud database

param(
    [string]$Mode = "local"
)

Write-Host "🔧 Ponder Development Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

switch ($Mode.ToLower()) {
    "local" {
        Write-Host "🗄️ Setting up LOCAL SQLite database..." -ForegroundColor Green
        $env:FORCE_LOCAL_DB = "true"
        $env:DATABASE_URL = ""
        Write-Host "✅ Configuration set for local development" -ForegroundColor Green
        Write-Host "📁 .ponder folder will be created" -ForegroundColor Yellow
    }
    "cloud" {
        Write-Host "☁️ Setting up CLOUD PostgreSQL database..." -ForegroundColor Blue
        $env:FORCE_LOCAL_DB = "false"
        # Load DATABASE_URL from .env.production if exists
        if (Test-Path ".env.production") {
            Get-Content ".env.production" | Where-Object { $_ -match "^DATABASE_URL=" } | ForEach-Object {
                $env:DATABASE_URL = ($_ -split "=", 2)[1]
            }
        }
        Write-Host "✅ Configuration set for cloud development" -ForegroundColor Blue
        Write-Host "☁️ Using cloud database, no .ponder folder needed" -ForegroundColor Yellow
    }
    "hybrid" {
        Write-Host "🔄 Setting up HYBRID mode..." -ForegroundColor Magenta
        $env:FORCE_LOCAL_DB = "true"
        # Keep DATABASE_URL for external connections
        Write-Host "✅ Local cache + Cloud backup enabled" -ForegroundColor Magenta
        Write-Host "📁 .ponder folder will be created for caching" -ForegroundColor Yellow
    }
    default {
        Write-Host "❌ Invalid mode. Use: local, cloud, or hybrid" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Starting Ponder in $Mode mode..." -ForegroundColor Cyan
pnpm ponder dev
