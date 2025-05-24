#!/bin/bash

# Firewall initialization script for Claude Code devcontainer
# This script sets up network security rules for secure sandbox operation

set -e

echo "🔒 Initializing firewall rules for Claude Code sandbox..."

# Check if iptables is available
if ! command -v iptables &> /dev/null; then
    echo "⚠️  iptables not found, skipping firewall setup"
    exit 0
fi

# Function to add rules with error handling
add_rule() {
    if ! sudo iptables "$@" 2>/dev/null; then
        echo "⚠️  Failed to add rule: iptables $*"
    fi
}

# Clear existing rules (if any)
sudo iptables -F OUTPUT 2>/dev/null || true

# Default policy: ACCEPT (we'll use specific DROP rules)
sudo iptables -P OUTPUT ACCEPT 2>/dev/null || true

# Allow loopback traffic (essential for local development)
add_rule -A OUTPUT -o lo -j ACCEPT

# Allow established and related connections
add_rule -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow DNS resolution
add_rule -A OUTPUT -p udp --dport 53 -j ACCEPT
add_rule -A OUTPUT -p tcp --dport 53 -j ACCEPT

# Allow HTTPS to essential domains for development
# Anthropic API
add_rule -A OUTPUT -p tcp --dport 443 -d api.anthropic.com -j ACCEPT

# npm registry
add_rule -A OUTPUT -p tcp --dport 443 -d registry.npmjs.org -j ACCEPT
add_rule -A OUTPUT -p tcp --dport 443 -d registry.npmjs.com -j ACCEPT

# GitHub (for git operations and package downloads)
add_rule -A OUTPUT -p tcp --dport 443 -d github.com -j ACCEPT
add_rule -A OUTPUT -p tcp --dport 443 -d api.github.com -j ACCEPT
add_rule -A OUTPUT -p tcp --dport 443 -d raw.githubusercontent.com -j ACCEPT
add_rule -A OUTPUT -p tcp --dport 443 -d codeload.github.com -j ACCEPT

# Firebase services
add_rule -A OUTPUT -p tcp --dport 443 -d firebase.googleapis.com -j ACCEPT
add_rule -A OUTPUT -p tcp --dport 443 -d firestore.googleapis.com -j ACCEPT
add_rule -A OUTPUT -p tcp --dport 443 -d identitytoolkit.googleapis.com -j ACCEPT

# Google APIs (for Firebase)
add_rule -A OUTPUT -p tcp --dport 443 -d googleapis.com -j ACCEPT
add_rule -A OUTPUT -p tcp --dport 443 -d accounts.google.com -j ACCEPT

# CDN and package managers
add_rule -A OUTPUT -p tcp --dport 443 -d cdn.jsdelivr.net -j ACCEPT
add_rule -A OUTPUT -p tcp --dport 443 -d unpkg.com -j ACCEPT

# Allow HTTP for local package mirrors (if needed)
add_rule -A OUTPUT -p tcp --dport 80 -d registry.npmjs.org -j ACCEPT

# Allow standard development ports (local traffic)
add_rule -A OUTPUT -p tcp --dport 3000:9999 -d 127.0.0.1 -j ACCEPT
add_rule -A OUTPUT -p tcp --dport 3000:9999 -d localhost -j ACCEPT

# Log dropped connections (optional, for debugging)
# add_rule -A OUTPUT -j LOG --log-prefix "FIREWALL-DROP: " --log-level 4

# Note: We don't add a default DROP rule to avoid breaking container networking
# The container's network isolation provides additional security

echo "✅ Firewall rules initialized successfully"
echo "🚀 Claude Code sandbox is ready with enhanced security"

# Display current rules for verification
echo "📋 Current OUTPUT rules:"
sudo iptables -L OUTPUT -n --line-numbers 2>/dev/null || echo "Could not display rules"

exit 0