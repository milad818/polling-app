#!/usr/bin/env bash
# validate.sh — run all backend quality checks in sequence.
#
# Equivalent to the frontend's  npm run validate
# Steps:
#   1. spotless:check — fail if any Java file is not formatted
#   2. checkstyle:check — fail on style violations
#   3. test           — run the full unit test suite
#
# To auto-fix formatting first, run:  ./mvnw spotless:apply

set -e

echo ""
echo "═══════════════════════════════════════"
echo "  Backend validation"
echo "  spotless:check  →  checkstyle:check  →  test"
echo "═══════════════════════════════════════"
echo ""

./mvnw spotless:check checkstyle:check test

echo ""
echo "✔  All checks passed."
