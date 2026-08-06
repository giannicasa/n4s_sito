#!/bin/zsh
# Avvio ambiente di sviluppo locale n4s (ex progetto Emergent)
# Uso: ./dev.sh
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. MongoDB (container Docker, si riavvia da solo con Docker Desktop)
docker start n4s-mongo >/dev/null 2>&1 || \
  docker run -d --name n4s-mongo --restart unless-stopped -p 27017:27017 -v n4s-mongo-data:/data/db mongo:7

# 2. Backend FastAPI su http://localhost:8001
cd "$DIR/backend"
./venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!

# 3. Frontend React su http://localhost:3000
cd "$DIR/frontend"
BROWSER=none PORT=3000 npx craco start &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM
echo ""
echo "Backend:  http://localhost:8001  (API docs: http://localhost:8001/docs)"
echo "Frontend: http://localhost:3000"
echo "Ctrl+C per fermare tutto (MongoDB resta attivo in Docker)."
wait
