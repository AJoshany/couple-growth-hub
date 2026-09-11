#!/bin/sh
# TEMPORARY end-to-end check for the stale-couple session bug.
set -e

TEST_EMAIL=$(cat /tmp/verify_email.txt)
BASE=http://127.0.0.1:3100
CJ=/tmp/verify_cookies.txt
rm -f "$CJ"

pnpm exec next dev --hostname 0.0.0.0 --port 3100 > /tmp/dev.log 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null' EXIT

echo "== waiting for dev server =="
i=0
while [ $i -lt 90 ]; do
  if curl -sf -o /dev/null "$BASE/api/auth/csrf"; then echo "ready after ${i}s"; break; fi
  i=$((i + 1))
  sleep 1
done
if [ $i -ge 90 ]; then echo "SERVER NEVER BECAME READY"; tail -40 /tmp/dev.log; exit 1; fi

CSRF=$(curl -s -c "$CJ" "$BASE/api/auth/csrf" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).csrfToken))')
echo "csrf ok: ${#CSRF} chars (stored cookie jar: $(grep -c authjs "$CJ" || true))"

echo "== signing in =="
curl -s -o /dev/null -b "$CJ" -c "$CJ" -X POST "$BASE/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "email=$TEST_EMAIL" \
  --data-urlencode "password=verify-password-123" \
  --data-urlencode "callbackUrl=$BASE/dashboard"

echo "== session right after sign-in =="
curl -s -b "$CJ" -c "$CJ" "$BASE/api/auth/session" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const s=JSON.parse(d||"null");console.log("coupleId =",s&&s.user?s.user.coupleId:"<no session>")})'

echo "== simulating createCouple's DB change (attach couple) =="
TEST_EMAIL="$TEST_EMAIL" node scripts/tmp-verify-session.mjs addCouple

echo "== RSC render of /dashboard with the SAME (stale) cookie =="
curl -s -b "$CJ" "$BASE/dashboard" > /tmp/dash.html
if grep -q "Verify Couple" /tmp/dash.html; then
  echo "PASS: dashboard shows the new couple without re-login"
else
  echo "FAIL: dashboard did not show the couple"
  if grep -q "Welcome to Couple Growth" /tmp/dash.html; then
    echo "  -> rendered the no-couple state (session still stale)"
  fi
fi

echo "== /setup with the SAME cookie (should redirect to /dashboard) =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/setup")
echo "GET /setup -> $CODE (307/308 means it recognised the couple)"

echo "== server errors (if any) =="
grep -iE "error|unhandled" /tmp/dev.log | grep -v "ExperimentalWarning" | head -10 || true
echo "== done =="
