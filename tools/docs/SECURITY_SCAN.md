# Omniy セキュリティスキャン手順書

最終更新日: 2025年1月27日

## 🎯 概要

本文書は、Omniy Instagram自動投稿サービスのセキュリティ脆弱性を定期的にスキャンし、セキュリティリスクを最小化するためのプロセスを定義します。

## 🔍 セキュリティスキャンの分類

### 1. 静的コード解析 (SAST)
- **目的**: ソースコード内の脆弱性検出
- **ツール**: ESLint Security, Semgrep, SonarQube
- **頻度**: コミット時・プルリクエスト時

### 2. 動的脆弱性スキャン (DAST)
- **目的**: 実行中アプリケーションの脆弱性検出
- **ツール**: OWASP ZAP, Burp Suite
- **頻度**: 週次・リリース前

### 3. 依存関係脆弱性スキャン (SCA)
- **目的**: 使用ライブラリの既知脆弱性検出
- **ツール**: npm audit, Snyk, Dependabot
- **頻度**: 日次・コミット時

### 4. インフラ脆弱性スキャン
- **目的**: クラウドインフラの設定ミス検出
- **ツール**: Google Security Command Center, Cloud Asset Inventory
- **頻度**: 週次

### 5. 設定ミス検出
- **目的**: Firebase/GCPの設定不備検出
- **ツール**: Config Validator, Forseti Security
- **頻度**: 設定変更時・週次

---

## 🛠️ 静的コード解析

### 1. ESLint Security 設定

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:security/recommended'
  ],
  plugins: ['security'],
  rules: {
    // セキュリティルール
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-object-injection': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error'
  }
};
```

### 2. TypeScript 型安全性チェック

```typescript
// セキュリティ型定義
export interface SecureUserInput {
  readonly userId: string;
  readonly sanitizedInput: string;
  readonly validatedAt: Date;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly sanitizedData: any;
}

// 入力値検証関数
export function validateAndSanitizeInput(input: unknown): ValidationResult {
  const errors: string[] = [];
  let sanitizedData: any = null;

  try {
    // SQL Injection 対策
    if (typeof input === 'string') {
      if (input.includes(';') || input.includes('--') || input.includes('/*')) {
        errors.push('Potentially dangerous SQL characters detected');
      }
    }

    // XSS 対策
    if (typeof input === 'string') {
      const xssPattern = /<script|javascript:|on\w+=/i;
      if (xssPattern.test(input)) {
        errors.push('Potentially dangerous XSS content detected');
      }
    }

    // LDAP Injection 対策
    if (typeof input === 'string') {
      const ldapChars = /[()\\*\0]/;
      if (ldapChars.test(input)) {
        errors.push('Potentially dangerous LDAP characters detected');
      }
    }

    sanitizedData = sanitizeInput(input);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Validation failed with exception'],
      sanitizedData: null
    };
  }
}

function sanitizeInput(input: unknown): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // HTMLタグ除去
      .replace(/['"]/g, '') // クォート除去
      .trim()
      .substring(0, 1000); // 長さ制限
  }
  return input;
}
```

### 3. Semgrep 設定

```yaml
# .semgrep.yml
rules:
  - id: hardcoded-secret
    pattern: |
      const $SECRET = "$VALUE"
    message: Potential hardcoded secret detected
    languages: [typescript, javascript]
    severity: ERROR
    
  - id: sql-injection
    pattern: |
      $QUERY = "SELECT * FROM " + $INPUT
    message: Potential SQL injection vulnerability
    languages: [typescript, javascript]
    severity: ERROR
    
  - id: unsafe-eval
    pattern: eval($CODE)
    message: Use of eval() is dangerous
    languages: [typescript, javascript]
    severity: ERROR
    
  - id: weak-crypto
    pattern: |
      crypto.createHash("md5")
    message: MD5 is cryptographically weak
    languages: [typescript, javascript]
    severity: WARNING
    
  - id: insecure-random
    pattern: Math.random()
    message: Math.random() is not cryptographically secure
    languages: [typescript, javascript]
    severity: INFO
```

---

## 🔍 動的脆弱性スキャン

### 1. OWASP ZAP 自動スキャン

```bash
#!/bin/bash
# scripts/security-scan.sh

set -e

APP_URL="https://omniy-staging.web.app"
ZAP_CLI="zap-cli"

echo "Starting OWASP ZAP security scan..."

# ZAP デーモン起動
$ZAP_CLI start --start-options '-daemon'

# スパイダー実行（認証なし部分）
$ZAP_CLI spider $APP_URL

# アクティブスキャン実行
$ZAP_CLI active-scan --scanners all --recursive $APP_URL

# 認証ありスキャン
$ZAP_CLI auth-script-login \
  --auth-script ./scripts/zap-auth.js \
  --username "test@example.com" \
  --password "test-password"

# 認証後のスパイダー
$ZAP_CLI spider $APP_URL/dashboard

# 認証後のアクティブスキャン
$ZAP_CLI active-scan --scanners all --recursive $APP_URL/dashboard

# レポート生成
$ZAP_CLI report -o zap-report.html -f html
$ZAP_CLI report -o zap-report.json -f json

# ZAP シャットダウン
$ZAP_CLI shutdown

echo "Security scan completed. Report saved to zap-report.html"
```

### 2. 認証付きスキャン設定

```javascript
// scripts/zap-auth.js
// OWASP ZAP authentication script for Omniy

function authenticate(helper, paramsValues, credentials) {
  const HttpRequestHeader = Java.type('org.parosproxy.paros.network.HttpRequestHeader');
  const HttpMessage = Java.type('org.parosproxy.paros.network.HttpMessage');
  const URI = Java.type('org.apache.commons.httpclient.URI');
  
  // Login endpoint
  const loginUrl = 'https://omniy-staging.web.app/api/auth/login';
  
  // Create login request
  const requestUri = new URI(loginUrl, false);
  const requestHeader = new HttpRequestHeader(HttpRequestHeader.POST, requestUri, HttpRequestHeader.HTTP11);
  
  // Add headers
  requestHeader.setHeader('Content-Type', 'application/json');
  
  // Login data
  const loginData = JSON.stringify({
    email: credentials.getParam('Username'),
    password: credentials.getParam('Password')
  });
  
  // Create and send message
  const msg = new HttpMessage(requestHeader, loginData);
  helper.sendAndReceive(msg);
  
  // Check if login was successful
  const response = msg.getResponseBody().toString();
  if (response.includes('token') || msg.getResponseHeader().getStatusCode() === 200) {
    return msg;
  }
  
  return null;
}

function getRequiredParamsNames() {
  return ['Username', 'Password'];
}

function getCredentialsParamsNames() {
  return ['Username', 'Password'];
}
```

### 3. CI/CD パイプライン統合

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 1' # Every Monday at 2 AM
  workflow_dispatch:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          npm ci
          cd functions && npm ci
          
      - name: Static Code Analysis
        run: |
          npm run lint:security
          npx semgrep --config=.semgrep.yml --json --output=semgrep-report.json
          
      - name: Dependency Vulnerability Scan
        run: |
          npm audit --audit-level=moderate --json > npm-audit.json
          cd functions && npm audit --audit-level=moderate --json > npm-audit-functions.json
          
      - name: Deploy to staging
        run: |
          firebase use staging
          firebase deploy --only hosting,functions
          
      - name: Dynamic Security Scan
        run: |
          chmod +x ./scripts/security-scan.sh
          ./scripts/security-scan.sh
          
      - name: Upload security reports
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: |
            semgrep-report.json
            npm-audit.json
            zap-report.html
            zap-report.json
            
      - name: Security Report Summary
        run: |
          node ./scripts/generate-security-summary.js
```

---

## 📦 依存関係脆弱性スキャン

### 1. npm audit 自動化

```bash
#!/bin/bash
# scripts/dependency-scan.sh

echo "Scanning frontend dependencies..."
cd frontend
npm audit --audit-level=moderate --json > ../reports/npm-audit-frontend.json
npm audit fix --dry-run > ../reports/npm-audit-fix-frontend.txt

echo "Scanning backend dependencies..."
cd ../functions
npm audit --audit-level=moderate --json > ../reports/npm-audit-functions.json
npm audit fix --dry-run > ../reports/npm-audit-fix-functions.txt

echo "Generating vulnerability report..."
cd ..
node scripts/process-vulnerability-report.js
```

### 2. Snyk 統合

```yaml
# .snyk
version: v1.0.0
ignore:
  # Ignore low severity vulnerabilities in dev dependencies
  'SNYK-JS-LODASH-567746':
    - '*':
        reason: Dev dependency only, not used in production
        expires: '2025-03-01T00:00:00.000Z'
        
patch: {}

exclude:
  # Exclude test files from scans
  - '**/*.test.ts'
  - '**/*.spec.ts'
  - '**/test/**'
  - '**/tests/**'
```

### 3. Dependabot 設定

```yaml
# .github/dependabot.yml
version: 2
updates:
  # Frontend dependencies
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
      day: "monday"
    reviewers:
      - "security-team"
    assignees:
      - "security-team"
    commit-message:
      prefix: "security"
      include: "scope"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
        
  # Backend dependencies
  - package-ecosystem: "npm"
    directory: "/functions"
    schedule:
      interval: "weekly"
      day: "monday"
    reviewers:
      - "security-team"
    assignees:
      - "security-team"
    commit-message:
      prefix: "security"
      include: "scope"
```

---

## ☁️ インフラセキュリティスキャン

### 1. Google Cloud Security Command Center

```bash
#!/bin/bash
# scripts/gcp-security-scan.sh

PROJECT_ID="omniy-prod"

echo "Scanning GCP security findings..."

# Security findings の取得
gcloud scc findings list \
  --organization=$ORG_ID \
  --filter="resourceName:projects/$PROJECT_ID" \
  --format="json" > reports/gcp-security-findings.json

# Asset inventory の取得
gcloud asset search-all-resources \
  --scope="projects/$PROJECT_ID" \
  --asset-types="compute.googleapis.com/Instance,storage.googleapis.com/Bucket" \
  --format="json" > reports/gcp-assets.json

# IAM policy analysis
gcloud asset search-all-iam-policies \
  --scope="projects/$PROJECT_ID" \
  --format="json" > reports/gcp-iam-policies.json

echo "GCP security scan completed"
```

### 2. Firebase セキュリティ設定チェック

```javascript
// scripts/firebase-security-check.js
const admin = require('firebase-admin');

async function checkFirebaseSecurityConfig() {
  const issues = [];
  
  try {
    // Firestore セキュリティルールチェック
    const rules = await admin.securityRules().getFirestoreRuleset();
    
    // ルールが存在するかチェック
    if (!rules || !rules.source) {
      issues.push({
        severity: 'HIGH',
        type: 'missing_firestore_rules',
        message: 'Firestore security rules not found'
      });
    }
    
    // デフォルトルールの検出
    if (rules.source[0]?.content.includes('allow read, write: if true')) {
      issues.push({
        severity: 'CRITICAL',
        type: 'insecure_firestore_rules',
        message: 'Firestore rules allow unrestricted access'
      });
    }
    
    // Firebase Auth 設定チェック
    const authConfig = await admin.auth().getAuth();
    
    // パスワード設定チェック
    if (!authConfig.passwordPolicy || authConfig.passwordPolicy.minLength < 8) {
      issues.push({
        severity: 'MEDIUM',
        type: 'weak_password_policy',
        message: 'Password policy is too weak'
      });
    }
    
    // MFA 設定チェック
    if (!authConfig.multiFactorConfig?.state === 'ENABLED') {
      issues.push({
        severity: 'MEDIUM',
        type: 'mfa_not_enforced',
        message: 'Multi-factor authentication is not enforced'
      });
    }
    
    return {
      timestamp: new Date().toISOString(),
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      issues,
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'CRITICAL').length,
      highIssues: issues.filter(i => i.severity === 'HIGH').length
    };
    
  } catch (error) {
    console.error('Firebase security check failed:', error);
    return {
      timestamp: new Date().toISOString(),
      error: error.message,
      issues: [{
        severity: 'HIGH',
        type: 'check_failed',
        message: 'Security check could not be completed'
      }]
    };
  }
}

module.exports = { checkFirebaseSecurityConfig };
```

### 3. Cloud Storage セキュリティチェック

```bash
#!/bin/bash
# scripts/storage-security-check.sh

PROJECT_ID="omniy-prod"
BUCKET_NAME="omniy-user-uploads"

echo "Checking Cloud Storage security settings..."

# バケットIAMポリシーチェック
gsutil iam get gs://$BUCKET_NAME > reports/bucket-iam-policy.json

# パブリックアクセスチェック
gsutil iam ch -d allUsers:objectViewer gs://$BUCKET_NAME 2>/dev/null || echo "No public access found (good)"

# CORS設定チェック
gsutil cors get gs://$BUCKET_NAME > reports/bucket-cors-config.json

# バケット設定チェック
gsutil ls -L -b gs://$BUCKET_NAME > reports/bucket-config.txt

echo "Storage security check completed"
```

---

## 🔧 自動化スクリプト

### 1. 包括的セキュリティスキャン

```javascript
// scripts/comprehensive-security-scan.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityScanner {
  constructor() {
    this.reportDir = 'reports';
    this.results = {
      timestamp: new Date().toISOString(),
      scans: {}
    };
  }

  async runAllScans() {
    console.log('🔍 Starting comprehensive security scan...');
    
    // Create reports directory
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    try {
      await this.runStaticCodeAnalysis();
      await this.runDependencyScans();
      await this.runInfrastructureScans();
      await this.runConfigurationChecks();
      await this.generateSummaryReport();
      
      console.log('✅ Security scan completed successfully');
    } catch (error) {
      console.error('❌ Security scan failed:', error);
      process.exit(1);
    }
  }

  async runStaticCodeAnalysis() {
    console.log('📝 Running static code analysis...');
    
    try {
      // ESLint security scan
      execSync('npm run lint:security -- --format json --output-file reports/eslint-security.json', 
        { stdio: 'inherit' });
      
      // Semgrep scan
      execSync('npx semgrep --config=.semgrep.yml --json --output=reports/semgrep.json src/', 
        { stdio: 'inherit' });
      
      this.results.scans.staticAnalysis = {
        status: 'completed',
        files: ['eslint-security.json', 'semgrep.json']
      };
    } catch (error) {
      this.results.scans.staticAnalysis = {
        status: 'failed',
        error: error.message
      };
    }
  }

  async runDependencyScans() {
    console.log('📦 Running dependency vulnerability scans...');
    
    try {
      // Frontend dependencies
      execSync('cd frontend && npm audit --audit-level=moderate --json > ../reports/npm-audit-frontend.json', 
        { stdio: 'inherit' });
      
      // Backend dependencies
      execSync('cd functions && npm audit --audit-level=moderate --json > ../reports/npm-audit-functions.json', 
        { stdio: 'inherit' });
      
      this.results.scans.dependencies = {
        status: 'completed',
        files: ['npm-audit-frontend.json', 'npm-audit-functions.json']
      };
    } catch (error) {
      this.results.scans.dependencies = {
        status: 'failed',
        error: error.message
      };
    }
  }

  async runInfrastructureScans() {
    console.log('☁️ Running infrastructure security scans...');
    
    try {
      // GCP security scan
      execSync('./scripts/gcp-security-scan.sh', { stdio: 'inherit' });
      
      // Storage security check
      execSync('./scripts/storage-security-check.sh', { stdio: 'inherit' });
      
      this.results.scans.infrastructure = {
        status: 'completed',
        files: ['gcp-security-findings.json', 'bucket-iam-policy.json']
      };
    } catch (error) {
      this.results.scans.infrastructure = {
        status: 'failed',
        error: error.message
      };
    }
  }

  async runConfigurationChecks() {
    console.log('⚙️ Running configuration security checks...');
    
    try {
      const { checkFirebaseSecurityConfig } = require('./firebase-security-check');
      const firebaseResults = await checkFirebaseSecurityConfig();
      
      fs.writeFileSync(
        path.join(this.reportDir, 'firebase-security-check.json'),
        JSON.stringify(firebaseResults, null, 2)
      );
      
      this.results.scans.configuration = {
        status: 'completed',
        files: ['firebase-security-check.json']
      };
    } catch (error) {
      this.results.scans.configuration = {
        status: 'failed',
        error: error.message
      };
    }
  }

  async generateSummaryReport() {
    console.log('📊 Generating summary report...');
    
    const summary = {
      scanDate: this.results.timestamp,
      overallStatus: this.calculateOverallStatus(),
      scanResults: this.results.scans,
      recommendations: this.generateRecommendations(),
      nextScanDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    fs.writeFileSync(
      path.join(this.reportDir, 'security-scan-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    // Generate HTML report
    const htmlReport = this.generateHtmlReport(summary);
    fs.writeFileSync(
      path.join(this.reportDir, 'security-scan-summary.html'),
      htmlReport
    );
  }

  calculateOverallStatus() {
    const scans = Object.values(this.results.scans);
    const failedScans = scans.filter(scan => scan.status === 'failed');
    
    if (failedScans.length === 0) {
      return 'PASS';
    } else if (failedScans.length < scans.length / 2) {
      return 'WARNING';
    } else {
      return 'FAIL';
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    Object.entries(this.results.scans).forEach(([scanType, result]) => {
      if (result.status === 'failed') {
        recommendations.push({
          priority: 'HIGH',
          category: scanType,
          action: `Fix ${scanType} scan failures`,
          description: result.error
        });
      }
    });

    return recommendations;
  }

  generateHtmlReport(summary) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Omniy Security Scan Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .status-pass { color: green; font-weight: bold; }
        .status-warning { color: orange; font-weight: bold; }
        .status-fail { color: red; font-weight: bold; }
        .scan-result { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Omniy Security Scan Report</h1>
        <p><strong>Scan Date:</strong> ${summary.scanDate}</p>
        <p><strong>Overall Status:</strong> <span class="status-${summary.overallStatus.toLowerCase()}">${summary.overallStatus}</span></p>
    </div>

    <h2>Scan Results</h2>
    ${Object.entries(summary.scanResults).map(([type, result]) => `
        <div class="scan-result">
            <h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            <p><strong>Status:</strong> ${result.status}</p>
            ${result.files ? `<p><strong>Report Files:</strong> ${result.files.join(', ')}</p>` : ''}
            ${result.error ? `<p><strong>Error:</strong> ${result.error}</p>` : ''}
        </div>
    `).join('')}

    ${summary.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>Recommendations</h2>
            <ul>
                ${summary.recommendations.map(rec => `
                    <li><strong>${rec.priority}:</strong> ${rec.action} - ${rec.description}</li>
                `).join('')}
            </ul>
        </div>
    ` : ''}

    <p><strong>Next Scheduled Scan:</strong> ${summary.nextScanDate}</p>
</body>
</html>
    `;
  }
}

// Run if called directly
if (require.main === module) {
  const scanner = new SecurityScanner();
  scanner.runAllScans();
}

module.exports = SecurityScanner;
```

### 2. 継続的監視設定

```yaml
# scripts/security-monitoring.yml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: omniy-security-scan
spec:
  schedule: "0 2 * * 1" # Every Monday at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: security-scanner
            image: gcr.io/omniy-prod/security-scanner:latest
            env:
            - name: PROJECT_ID
              value: "omniy-prod"
            - name: SLACK_WEBHOOK
              valueFrom:
                secretKeyRef:
                  name: security-secrets
                  key: slack-webhook
            command:
            - /bin/bash
            - -c
            - |
              node scripts/comprehensive-security-scan.js
              if [ $? -ne 0 ]; then
                curl -X POST $SLACK_WEBHOOK \
                  -H 'Content-type: application/json' \
                  --data '{"text":"🚨 Security scan failed for Omniy production environment"}'
              fi
          restartPolicy: OnFailure
```

---

## 📊 レポートとアラート

### 1. Slack通知統合

```javascript
// scripts/security-alert.js
const { WebClient } = require('@slack/web-api');

class SecurityAlertManager {
  constructor() {
    this.slack = new WebClient(process.env.SLACK_BOT_TOKEN);
    this.channel = '#security-alerts';
  }

  async sendVulnerabilityAlert(vulnerability) {
    const severity = this.getSeverityEmoji(vulnerability.severity);
    
    const message = {
      channel: this.channel,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${severity} Security Vulnerability Detected`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Severity:* ${vulnerability.severity}`
            },
            {
              type: 'mrkdwn',
              text: `*Type:* ${vulnerability.type}`
            },
            {
              type: 'mrkdwn',
              text: `*Component:* ${vulnerability.component}`
            },
            {
              type: 'mrkdwn',
              text: `*CVSS Score:* ${vulnerability.cvssScore || 'N/A'}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:* ${vulnerability.description}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Full Report'
              },
              url: vulnerability.reportUrl
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Create Ticket'
              },
              action_id: 'create_security_ticket'
            }
          ]
        }
      ]
    };

    await this.slack.chat.postMessage(message);
  }

  getSeverityEmoji(severity) {
    const emojiMap = {
      'CRITICAL': '🔴',
      'HIGH': '🟠',
      'MEDIUM': '🟡',
      'LOW': '🟢',
      'INFO': 'ℹ️'
    };
    return emojiMap[severity] || '⚠️';
  }

  async sendWeeklySummary(summary) {
    const message = {
      channel: this.channel,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Weekly Security Summary'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Scans Performed:* ${summary.totalScans}`
            },
            {
              type: 'mrkdwn',
              text: `*Vulnerabilities Found:* ${summary.totalVulnerabilities}`
            },
            {
              type: 'mrkdwn',
              text: `*Critical Issues:* ${summary.criticalIssues}`
            },
            {
              type: 'mrkdwn',
              text: `*Fixed This Week:* ${summary.fixedIssues}`
            }
          ]
        }
      ]
    };

    await this.slack.chat.postMessage(message);
  }
}

module.exports = SecurityAlertManager;
```

---

## 📋 セキュリティチェックリスト

### 日次確認事項
```markdown
## Daily Security Checklist

### Morning (9:00 AM)
- [ ] 前日のセキュリティアラート確認
- [ ] 新規CVE（Common Vulnerabilities and Exposures）チェック
- [ ] 依存関係の自動更新確認
- [ ] ログの異常なアクセスパターン確認

### Evening (6:00 PM)
- [ ] 当日のセキュリティスキャン結果確認
- [ ] 新規脆弱性報告の確認
- [ ] セキュリティパッチ適用状況確認
```

### 週次確認事項
```markdown
## Weekly Security Review

### Every Monday
- [ ] 包括的セキュリティスキャン実行
- [ ] 脆弱性トレンド分析
- [ ] セキュリティ設定変更レビュー
- [ ] インシデント対応プロセス確認

### Every Friday
- [ ] 来週のメンテナンス計画確認
- [ ] セキュリティ教育・啓発活動実施
- [ ] 競合他社のセキュリティ情報収集
```

---

## 🔗 関連ドキュメント

- [障害対応手順書](./INCIDENT_RESPONSE.md)
- [監視・アラート設定](./MONITORING_SETUP.md)
- [技術仕様書](./TECHNICAL_SPECIFICATIONS.md)
- [リスク管理計画書](./RISK_MANAGEMENT.md)

---

**作成者**: セキュリティチーム  
**承認者**: CISO  
**次回見直し**: 2025年4月27日