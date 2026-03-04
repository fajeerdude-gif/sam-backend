#!/usr/bin/env bash
TEMPLATE=".env.example"
OUT=".env"

if [ ! -f "$TEMPLATE" ]; then
  echo "Template $TEMPLATE not found." >&2
  exit 1
fi

if [ -f "$OUT" ]; then
  echo "$OUT already exists. Aborting to avoid overwriting."
  exit 0
fi

sed 's/<YOUR_MONGODB_URI_HERE>//g; s/<YOUR_JWT_SECRET_HERE>//g' "$TEMPLATE" > "$OUT"
echo "Created $OUT from $TEMPLATE. Edit $OUT and fill in real values."
