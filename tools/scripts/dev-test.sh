#!/bin/bash

# Omni Insta - Comprehensive Development Testing Script
# This script runs all tests, linting, and quality checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
TEST_RESULTS=()

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_section() {
    echo -e "\n${PURPLE}═══════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════${NC}\n"
}

# Function to record test result
record_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        print_status "$test_name"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        print_error "$test_name"
        [ -n "$details" ] && echo -e "    ${RED}$details${NC}"
    fi
    
    TEST_RESULTS+=("$status: $test_name")
}

# Function to run command and capture result
run_test() {
    local test_name="$1"
    local command="$2"
    local directory="${3:-$PROJECT_ROOT}"
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    
    cd "$directory"
    
    if output=$(eval "$command" 2>&1); then
        record_test "$test_name" "PASS"
        return 0
    else
        record_test "$test_name" "FAIL" "Command failed: $command"
        echo -e "${RED}Output:${NC}\n$output"
        return 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_section "Prerequisites Check"
    
    # Check if dependencies are installed
    if [ ! -d "frontend/node_modules" ]; then
        print_warning "Frontend dependencies not found. Installing..."
        cd "$PROJECT_ROOT/frontend"
        npm install
        print_status "Frontend dependencies installed"
        cd "$PROJECT_ROOT"
    fi
    
    if [ ! -d "functions/node_modules" ]; then
        print_warning "Backend dependencies not found. Installing..."
        cd "$PROJECT_ROOT/functions"
        npm install
        print_status "Backend dependencies installed"
        cd "$PROJECT_ROOT"
    fi
    
    record_test "Dependencies check" "PASS"
}

# Frontend tests
run_frontend_tests() {
    print_section "Frontend Tests"
    
    cd "$PROJECT_ROOT/frontend"
    
    # TypeScript compilation check
    run_test "Frontend TypeScript compilation" "npm run type-check" "$PROJECT_ROOT/frontend"
    
    # ESLint check
    run_test "Frontend ESLint" "npm run lint" "$PROJECT_ROOT/frontend"
    
    # Unit tests
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        run_test "Frontend unit tests" "npm run test" "$PROJECT_ROOT/frontend"
    else
        record_test "Frontend unit tests" "SKIP" "No test script found"
    fi
    
    # Test coverage (if available)
    if [ -f "package.json" ] && grep -q '"test:coverage"' package.json; then
        run_test "Frontend test coverage" "npm run test:coverage" "$PROJECT_ROOT/frontend"
    else
        record_test "Frontend test coverage" "SKIP" "No coverage script found"
    fi
    
    # Build test
    run_test "Frontend build" "npm run build" "$PROJECT_ROOT/frontend"
    
    cd "$PROJECT_ROOT"
}

# Backend tests
run_backend_tests() {
    print_section "Backend Tests"
    
    cd "$PROJECT_ROOT/functions"
    
    # TypeScript compilation
    run_test "Backend TypeScript compilation" "npm run build" "$PROJECT_ROOT/functions"
    
    # ESLint check
    run_test "Backend ESLint" "npm run lint" "$PROJECT_ROOT/functions"
    
    # Unit tests
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        run_test "Backend unit tests" "npm run test" "$PROJECT_ROOT/functions"
    else
        record_test "Backend unit tests" "SKIP" "No test script found"
    fi
    
    # Test coverage (if available)
    if [ -f "package.json" ] && grep -q '"test:coverage"' package.json; then
        run_test "Backend test coverage" "npm run test:coverage" "$PROJECT_ROOT/functions"
    else
        record_test "Backend test coverage" "SKIP" "No coverage script found"
    fi
    
    cd "$PROJECT_ROOT"
}

# Security tests
run_security_tests() {
    print_section "Security Tests"
    
    # Check for common security issues
    echo -e "${YELLOW}Checking for security vulnerabilities...${NC}"
    
    # Frontend security audit
    cd "$PROJECT_ROOT/frontend"
    if run_test "Frontend security audit" "npm audit --audit-level=high" "$PROJECT_ROOT/frontend"; then
        true
    else
        print_warning "Frontend security issues found. Consider running 'npm audit fix'"
    fi
    
    # Backend security audit
    cd "$PROJECT_ROOT/functions"
    if run_test "Backend security audit" "npm audit --audit-level=high" "$PROJECT_ROOT/functions"; then
        true
    else
        print_warning "Backend security issues found. Consider running 'npm audit fix'"
    fi
    
    # Check for exposed secrets (basic check)
    cd "$PROJECT_ROOT"
    if ! grep -r "sk_live\|pk_live\|AKIA\|password\|secret" --include="*.js" --include="*.ts" --include="*.vue" . >/dev/null 2>&1; then
        record_test "Secret exposure check" "PASS"
    else
        record_test "Secret exposure check" "FAIL" "Potential secrets found in code"
    fi
}

# Configuration tests
run_config_tests() {
    print_section "Configuration Tests"
    
    # Check Firebase configuration
    if [ -f "firebase.json" ]; then
        record_test "Firebase configuration exists" "PASS"
    else
        record_test "Firebase configuration exists" "FAIL" "firebase.json not found"
    fi
    
    # Check Firestore rules
    if [ -f "firestore.rules" ]; then
        record_test "Firestore rules exist" "PASS"
    else
        record_test "Firestore rules exist" "FAIL" "firestore.rules not found"
    fi
    
    # Check environment examples
    if [ -f "frontend/.env.local.example" ]; then
        record_test "Frontend env example exists" "PASS"
    else
        record_test "Frontend env example exists" "FAIL" "frontend/.env.local.example not found"
    fi
    
    if [ -f "functions/.env.local.example" ]; then
        record_test "Backend env example exists" "PASS"
    else
        record_test "Backend env example exists" "FAIL" "functions/.env.local.example not found"
    fi
    
    # Check package.json validity
    if jq . frontend/package.json >/dev/null 2>&1; then
        record_test "Frontend package.json valid" "PASS"
    else
        record_test "Frontend package.json valid" "FAIL" "Invalid JSON in frontend/package.json"
    fi
    
    if jq . functions/package.json >/dev/null 2>&1; then
        record_test "Backend package.json valid" "PASS"
    else
        record_test "Backend package.json valid" "FAIL" "Invalid JSON in functions/package.json"
    fi
}

# Integration tests (if Firebase emulators are available)
run_integration_tests() {
    print_section "Integration Tests"
    
    # Check if Firebase emulators are available
    if command -v firebase &> /dev/null; then
        # Check if we can start emulators (quick test)
        echo -e "${YELLOW}Testing Firebase emulator startup...${NC}"
        if timeout 30s firebase emulators:exec --only=firestore "echo 'Emulator test passed'" >/dev/null 2>&1; then
            record_test "Firebase emulators" "PASS"
        else
            record_test "Firebase emulators" "FAIL" "Could not start Firebase emulators"
        fi
    else
        record_test "Firebase emulators" "SKIP" "Firebase CLI not installed"
    fi
    
    # API endpoint tests (if running)
    if curl -s http://localhost:5001 >/dev/null 2>&1; then
        record_test "Functions endpoint reachable" "PASS"
    else
        record_test "Functions endpoint reachable" "SKIP" "Functions not running locally"
    fi
}

# E2E tests (if Cypress is available)
run_e2e_tests() {
    print_section "End-to-End Tests"
    
    cd "$PROJECT_ROOT/frontend"
    
    # Check if Cypress is configured
    if [ -f "cypress.config.ts" ] && [ -d "cypress" ]; then
        # Run headless Cypress tests
        if command -v cypress &> /dev/null || [ -f "node_modules/.bin/cypress" ]; then
            run_test "E2E tests (Cypress)" "npm run test:e2e:headless || npx cypress run" "$PROJECT_ROOT/frontend"
        else
            record_test "E2E tests (Cypress)" "SKIP" "Cypress not available"
        fi
    else
        record_test "E2E tests (Cypress)" "SKIP" "Cypress not configured"
    fi
    
    cd "$PROJECT_ROOT"
}

# Performance tests
run_performance_tests() {
    print_section "Performance Tests"
    
    cd "$PROJECT_ROOT/frontend"
    
    # Bundle size analysis
    if [ -f "dist" ] && command -v du &> /dev/null; then
        bundle_size=$(du -sh dist 2>/dev/null | cut -f1 || echo "unknown")
        if [[ $bundle_size =~ ^[0-9]+[KM]$ ]] && [[ ! $bundle_size =~ ^[5-9][0-9][0-9]M$ ]]; then
            record_test "Bundle size check ($bundle_size)" "PASS"
        else
            record_test "Bundle size check ($bundle_size)" "WARN" "Bundle might be large"
        fi
    else
        record_test "Bundle size check" "SKIP" "No build output found"
    fi
    
    cd "$PROJECT_ROOT"
}

# Quality metrics
run_quality_tests() {
    print_section "Code Quality Tests"
    
    # Check for TODO/FIXME comments
    todo_count=$(grep -r "TODO\|FIXME\|XXX" --include="*.js" --include="*.ts" --include="*.vue" . | wc -l || echo "0")
    if [ "$todo_count" -lt 10 ]; then
        record_test "TODO/FIXME count ($todo_count)" "PASS"
    else
        record_test "TODO/FIXME count ($todo_count)" "WARN" "Many TODO/FIXME comments found"
    fi
    
    # Check for console.log statements (should be minimal in production code)
    console_count=$(grep -r "console\.log" --include="*.js" --include="*.ts" --include="*.vue" ./frontend/src ./functions/src 2>/dev/null | wc -l || echo "0")
    if [ "$console_count" -lt 5 ]; then
        record_test "Console.log usage ($console_count)" "PASS"
    else
        record_test "Console.log usage ($console_count)" "WARN" "Many console.log statements found"
    fi
    
    # Check for proper error handling patterns
    error_handling=$(grep -r "try.*catch\|\.catch(" --include="*.js" --include="*.ts" --include="*.vue" ./frontend/src ./functions/src 2>/dev/null | wc -l || echo "0")
    if [ "$error_handling" -gt 5 ]; then
        record_test "Error handling patterns ($error_handling)" "PASS"
    else
        record_test "Error handling patterns ($error_handling)" "WARN" "Limited error handling found"
    fi
}

# Generate test report
generate_report() {
    print_section "Test Summary Report"
    
    echo -e "${CYAN}📊 Test Results Summary:${NC}"
    echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│ Total Tests:     ${TOTAL_TESTS}                      │${NC}"
    echo -e "${CYAN}│ Passed:          ${GREEN}${PASSED_TESTS}${CYAN}                      │${NC}"
    echo -e "${CYAN}│ Failed:          ${RED}${FAILED_TESTS}${CYAN}                      │${NC}"
    echo -e "${CYAN}│ Success Rate:    $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%                    │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────┘${NC}\n"
    
    if [ $FAILED_TESTS -gt 0 ]; then
        echo -e "${RED}❌ Failed Tests:${NC}"
        for result in "${TEST_RESULTS[@]}"; do
            if [[ $result == FAIL:* ]]; then
                echo -e "  ${RED}•${NC} ${result#FAIL: }"
            fi
        done
        echo ""
    fi
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed! Your code is ready for deployment.${NC}"
        return 0
    else
        echo -e "${RED}⚠ Some tests failed. Please review and fix the issues above.${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🧪 Omni Insta - Comprehensive Test Suite${NC}"
    echo -e "${BLUE}===========================================${NC}\n"
    
    echo -e "${BLUE}Starting comprehensive testing...${NC}"
    echo -e "${YELLOW}This may take several minutes depending on your system.${NC}\n"
    
    start_time=$(date +%s)
    
    # Run all test suites
    check_prerequisites
    run_frontend_tests
    run_backend_tests
    run_security_tests
    run_config_tests
    run_integration_tests
    run_e2e_tests
    run_performance_tests
    run_quality_tests
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    echo -e "\n${BLUE}⏱ Testing completed in ${duration} seconds${NC}\n"
    
    # Generate final report
    generate_report
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Run comprehensive tests for Omni Insta development"
        echo ""
        echo "Options:"
        echo "  --help, -h       Show this help message"
        echo "  --frontend-only  Run only frontend tests"
        echo "  --backend-only   Run only backend tests"
        echo "  --quick          Run only essential tests (lint + build)"
        echo "  --security       Run only security tests"
        echo "  --e2e           Run only end-to-end tests"
        echo ""
        exit 0
        ;;
    --frontend-only)
        echo -e "${BLUE}🧪 Running frontend tests only${NC}\n"
        check_prerequisites
        run_frontend_tests
        generate_report
        ;;
    --backend-only)
        echo -e "${BLUE}🧪 Running backend tests only${NC}\n"
        check_prerequisites
        run_backend_tests
        generate_report
        ;;
    --quick)
        echo -e "${BLUE}🧪 Running quick tests only${NC}\n"
        check_prerequisites
        run_test "Frontend lint + build" "npm run lint && npm run type-check && npm run build" "$PROJECT_ROOT/frontend"
        run_test "Backend lint + build" "npm run lint && npm run build" "$PROJECT_ROOT/functions"
        generate_report
        ;;
    --security)
        echo -e "${BLUE}🧪 Running security tests only${NC}\n"
        check_prerequisites
        run_security_tests
        generate_report
        ;;
    --e2e)
        echo -e "${BLUE}🧪 Running E2E tests only${NC}\n"
        check_prerequisites
        run_e2e_tests
        generate_report
        ;;
    *)
        main "$@"
        ;;
esac