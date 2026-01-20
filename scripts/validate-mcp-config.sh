#!/bin/bash
# MCP Configuration Validation Script
# This script validates the MCP configuration file and tests connectivity to MCP servers

set -e

echo "🔍 MCP Configuration Validation"
echo "================================"
echo ""

CONFIG_FILE=".copilot/mcp-config.json"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$REPO_ROOT"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Error: MCP configuration file not found at $CONFIG_FILE"
    exit 1
fi

echo "✓ Configuration file exists: $CONFIG_FILE"
echo ""

# Validate JSON syntax
echo "📋 Validating JSON syntax..."
if jq empty "$CONFIG_FILE" 2>/dev/null; then
    echo "✓ JSON syntax is valid"
else
    echo "❌ Error: Invalid JSON syntax in $CONFIG_FILE"
    exit 1
fi
echo ""

# Validate structure
echo "📋 Validating MCP configuration structure..."
if jq -e '.mcpServers' "$CONFIG_FILE" > /dev/null 2>&1; then
    echo "✓ Valid MCP configuration structure (has 'mcpServers' key)"
else
    echo "❌ Error: Invalid MCP configuration structure (missing 'mcpServers' key)"
    exit 1
fi
echo ""

# List configured servers
echo "📦 Configured MCP Servers:"
echo "-------------------------"
jq -r '.mcpServers | to_entries | .[] | "  • \(.key): \(if .value.url then "HTTP (\(.value.url))" elif .value.command then "Command (\(.value.command))" else "Unknown" end)"' "$CONFIG_FILE"
echo ""

# Test HTTP servers connectivity (optional, requires network)
echo "🌐 Testing HTTP Server Connectivity (optional):"
echo "-----------------------------------------------"

# Test GitHub MCP
echo -n "  • GitHub MCP: "
if curl -s -I --max-time 5 "https://api.githubcopilot.com/mcp/" > /dev/null 2>&1; then
    echo "✓ Reachable"
else
    echo "⚠ Not reachable (network or auth required)"
fi

# Test Qualtrics MCP (note: will fail without auth, but we can check if endpoint exists)
echo -n "  • Qualtrics MCP: "
QUALTRICS_URL=$(jq -r '.mcpServers["qualtrics-surveys"].url' "$CONFIG_FILE")
if [ "$QUALTRICS_URL" != "null" ]; then
    # Replace template with actual hostname if available
    if [[ "$QUALTRICS_URL" == *"<your-qualtrics-host>"* ]]; then
        echo "⚠ Placeholder URL detected - needs customization"
    else
        if curl -s -I --max-time 5 "$QUALTRICS_URL" > /dev/null 2>&1; then
            echo "✓ Reachable (auth required for full access)"
        else
            echo "⚠ Not reachable (network, hostname, or auth required)"
        fi
    fi
else
    echo "❌ Configuration missing"
fi

echo ""

# Check for required tools
echo "🔧 Checking Required Tools:"
echo "--------------------------"

check_tool() {
    if command -v "$1" > /dev/null 2>&1; then
        echo "  ✓ $1 is installed"
        return 0
    else
        echo "  ⚠ $1 is not installed (required for some MCP servers)"
        return 1
    fi
}

check_tool "node"
check_tool "npm"
check_tool "npx"
check_tool "jq"

echo ""

# Check for environment variables
echo "🔐 Checking Environment Variables:"
echo "----------------------------------"

check_env_var() {
    if [ -n "${!1}" ]; then
        echo "  ✓ $1 is set"
        return 0
    else
        echo "  ⚠ $1 is not set (required for $2)"
        return 1
    fi
}

# These are optional - not everyone will have them set locally
echo "  (Note: These are optional and may not be set in all environments)"
check_env_var "QUALTRICS_OAUTH_TOKEN" "Qualtrics MCP" || true
check_env_var "GOOGLE_SERVICE_ACCOUNT_EMAIL" "Google Cloud MCP" || true
check_env_var "GOOGLE_PRIVATE_KEY" "Google Cloud MCP" || true
check_env_var "GA_PROPERTY_ID" "Google Cloud MCP" || true

echo ""

echo "✅ MCP Configuration Validation Complete"
echo ""
echo "📚 For more information, see:"
echo "   • MCP_SERVERS.md - Complete documentation"
echo "   • .copilot/README.md - Configuration overview"
echo "   • https://modelcontextprotocol.io/ - MCP specification"
echo ""
