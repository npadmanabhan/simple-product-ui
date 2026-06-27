#!/bin/sh
set -e

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__env = {
  "API_URL": "${API_URL:-}"
};
EOF

exec nginx -g 'daemon off;'
