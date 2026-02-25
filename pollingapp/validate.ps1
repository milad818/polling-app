#!/usr/bin/env pwsh
# validate.ps1 — run all backend quality checks in sequence.
#
# Equivalent to the frontend's  npm run validate
# Steps:
#   1. spotless:check — fail if any Java file is not formatted
#   2. checkstyle:check — fail on style violations
#   3. test           — run the full unit test suite
#
# To auto-fix formatting first, run:  ./mvnw spotless:apply

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Backend validation" -ForegroundColor Cyan
Write-Host "  spotless:check  →  checkstyle:check  →  test" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

./mvnw spotless:check checkstyle:check test

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✔  All checks passed." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✘  Validation failed — see output above." -ForegroundColor Red
    exit 1
}
