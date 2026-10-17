#!/usr/bin/env bash
set -Eeuo pipefail
# Install Node.js 22 using NodeSource on Ubuntu.
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
