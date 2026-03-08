#!/bin/bash
curl -s -X POST http://localhost:8000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"hello","session_id":"test1","language":"en"}'
