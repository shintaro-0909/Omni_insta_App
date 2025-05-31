<template>
  <v-card class="security-dashboard" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon 
        :color="overallSecurityColor" 
        class="me-2"
        size="24"
      >
        mdi-shield-lock
      </v-icon>
      <span>Enterprise Security</span>
      
      <v-spacer />
      
      <!-- Security Status Indicator -->
      <v-chip
        :color="overallSecurityColor"
        :variant="isSecure ? 'flat' : 'outlined'"
        size="small"
        class="me-2"
      >
        <v-icon start size="16">
          {{ isSecure ? 'mdi-shield-check' : 'mdi-shield-alert' }}
        </v-icon>
        {{ isSecure ? 'SECURE' : 'VULNERABLE' }}
      </v-chip>
      
      <!-- Refresh Button -->
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        @click="refreshStatus"
      >
        <v-icon start>mdi-refresh</v-icon>
        Refresh
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Security Features Status -->
        <v-col cols="12" md="6">
          <div class="security-features">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">Security Features</h4>
            
            <div class="feature-list">
              <div 
                v-for="feature in securityFeatures"
                :key="feature.key"
                class="feature-item mb-3"
              >
                <div class="d-flex align-center">
                  <v-icon 
                    :color="feature.active ? 'success' : 'error'"
                    size="20"
                    class="me-3"
                  >
                    {{ feature.active ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                  </v-icon>
                  
                  <div class="flex-grow-1">
                    <div class="text-body-2 font-weight-bold">{{ feature.name }}</div>
                    <div class="text-caption text-grey">{{ feature.description }}</div>
                  </div>
                  
                  <v-chip
                    :color="feature.active ? 'success' : 'error'"
                    size="x-small"
                    variant="outlined"
                  >
                    {{ feature.active ? 'ACTIVE' : 'INACTIVE' }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Security Metrics -->
        <v-col cols="12" md="6">
          <div class="security-metrics">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">Security Metrics</h4>
            
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">{{ violationCount }}</div>
                <div class="metric-label">CSP Violations</div>
                <v-progress-linear
                  :model-value="violationCount > 0 ? Math.min(violationCount * 10, 100) : 0"
                  :color="violationCount === 0 ? 'success' : violationCount < 5 ? 'warning' : 'error'"
                  height="4"
                  rounded
                />
              </div>
              
              <div class="metric-card">
                <div class="metric-value">
                  {{ csrfTokenAge > 0 ? Math.round(csrfTokenAge / 1000 / 60) : 0 }}m
                </div>
                <div class="metric-label">CSRF Token Age</div>
                <v-progress-linear
                  :model-value="csrfTokenProgress"
                  :color="csrfTokenProgress < 70 ? 'success' : csrfTokenProgress < 90 ? 'warning' : 'error'"
                  height="4"
                  rounded
                />
              </div>
              
              <div class="metric-card">
                <div class="metric-value">{{ securityScore }}</div>
                <div class="metric-label">Security Score</div>
                <v-progress-linear
                  :model-value="securityScore"
                  :color="securityScore > 80 ? 'success' : securityScore > 60 ? 'warning' : 'error'"
                  height="4"
                  rounded
                />
              </div>
            </div>
          </div>
        </v-col>

        <!-- CSRF Token Info -->
        <v-col cols="12" v-if="showCSRFToken">
          <div class="csrf-section">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">CSRF Protection</h4>
            
            <v-card variant="outlined" class="csrf-card">
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon color="success" class="me-2">mdi-key-variant</v-icon>
                  <span class="text-body-2 font-weight-bold">Active CSRF Token</span>
                  
                  <v-spacer />
                  
                  <v-btn
                    color="primary"
                    size="small"
                    variant="outlined"
                    @click="regenerateCSRFToken"
                  >
                    <v-icon start size="16">mdi-refresh</v-icon>
                    Regenerate
                  </v-btn>
                </div>
                
                <div class="token-display">
                  <code class="token-value">{{ maskedCSRFToken }}</code>
                  <v-btn
                    :icon="showFullToken ? 'mdi-eye-off' : 'mdi-eye'"
                    size="x-small"
                    variant="text"
                    @click="showFullToken = !showFullToken"
                  />
                </div>
                
                <div class="token-info mt-2">
                  <div class="text-caption">
                    <strong>Expires:</strong> {{ csrfTokenExpiry }}
                  </div>
                  <div class="text-caption">
                    <strong>Algorithm:</strong> Cryptographically Secure Random
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>

        <!-- Security Violations -->
        <v-col cols="12" v-if="violationCount > 0">
          <div class="violations-section">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">
              Security Violations ({{ violationCount }})
            </h4>
            
            <v-expansion-panels variant="accordion">
              <v-expansion-panel
                v-for="(violation, index) in recentViolations"
                :key="index"
              >
                <v-expansion-panel-title>
                  <div class="d-flex align-center w-100">
                    <v-icon 
                      :color="getViolationSeverity(violation).color"
                      class="me-2"
                    >
                      {{ getViolationSeverity(violation).icon }}
                    </v-icon>
                    
                    <div class="flex-grow-1">
                      <div class="text-body-2 font-weight-bold">
                        {{ violation.directive || violation.type }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ formatTime(violation.timestamp) }}
                      </div>
                    </div>
                    
                    <v-chip
                      :color="getViolationSeverity(violation).color"
                      size="x-small"
                      variant="outlined"
                    >
                      {{ getViolationSeverity(violation).level }}
                    </v-chip>
                  </div>
                </v-expansion-panel-title>
                
                <v-expansion-panel-text>
                  <div class="violation-details">
                    <div class="detail-row" v-if="violation.blockedURI">
                      <strong>Blocked URI:</strong> 
                      <code class="text-caption">{{ violation.blockedURI }}</code>
                    </div>
                    <div class="detail-row" v-if="violation.sourceFile">
                      <strong>Source:</strong> 
                      <code class="text-caption">{{ violation.sourceFile }}:{{ violation.lineNumber }}</code>
                    </div>
                    <div class="detail-row" v-if="violation.originalPolicy">
                      <strong>Policy:</strong>
                      <pre class="policy-text text-caption">{{ violation.originalPolicy }}</pre>
                    </div>
                    <div class="detail-row" v-if="violation.data">
                      <strong>Details:</strong>
                      <pre class="data-text text-caption">{{ JSON.stringify(violation.data, null, 2) }}</pre>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-col>

        <!-- Security Recommendations -->
        <v-col cols="12" v-if="recommendations.length > 0">
          <div class="recommendations-section">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">Security Recommendations</h4>
            
            <div class="recommendations-list">
              <v-alert
                v-for="(rec, index) in recommendations"
                :key="index"
                :color="rec.severity"
                variant="outlined"
                density="compact"
                class="mb-2"
              >
                <template #prepend>
                  <v-icon>{{ rec.icon }}</v-icon>
                </template>
                
                <div>
                  <div class="text-body-2 font-weight-bold">{{ rec.title }}</div>
                  <div class="text-caption">{{ rec.description }}</div>
                </div>
                
                <template #append v-if="rec.action">
                  <v-btn
                    :color="rec.severity"
                    size="small"
                    variant="outlined"
                    @click="rec.action"
                  >
                    {{ rec.actionText }}
                  </v-btn>
                </template>
              </v-alert>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEnterpriseSecurity } from '@/utils/security'

// Composables
const security = useEnterpriseSecurity()

// Local state
const showCSRFToken = ref(false)
const showFullToken = ref(false)
const csrfTokenAge = ref(0)
const updateInterval = ref<NodeJS.Timeout | null>(null)

// Computed properties
const { securityStatus, isSecure, violationCount } = security

const overallSecurityColor = computed(() => {
  if (isSecure.value) return 'success'
  if (violationCount.value < 5) return 'warning'
  return 'error'
})

const securityFeatures = computed(() => [
  {
    key: 'csp',
    name: 'Content Security Policy',
    description: 'Prevents XSS attacks and code injection',
    active: securityStatus.value.cspActive
  },
  {
    key: 'csrf',
    name: 'CSRF Protection',
    description: 'Prevents cross-site request forgery attacks',
    active: securityStatus.value.csrfToken
  },
  {
    key: 'xss',
    name: 'XSS Protection',
    description: 'Input/output sanitization and validation',
    active: securityStatus.value.xssProtection
  },
  {
    key: 'headers',
    name: 'Security Headers',
    description: 'HSTS, X-Frame-Options, X-Content-Type-Options',
    active: true // Assume active since we set them
  },
  {
    key: 'monitoring',
    name: 'Security Monitoring',
    description: 'Real-time threat detection and reporting',
    active: true
  }
])

const securityScore = computed(() => {
  const features = securityFeatures.value
  const activeCount = features.filter(f => f.active).length
  const score = Math.round((activeCount / features.length) * 100)
  
  // Penalty for violations
  const violationPenalty = Math.min(violationCount.value * 5, 30)
  
  return Math.max(0, score - violationPenalty)
})

const csrfTokenProgress = computed(() => {
  if (csrfTokenAge.value === 0) return 0
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours
  return Math.min((csrfTokenAge.value / maxAge) * 100, 100)
})

const maskedCSRFToken = computed(() => {
  const token = security.getCSRFToken()
  if (!token) return 'No token available'
  
  if (showFullToken.value) {
    return token
  }
  
  return token.substring(0, 8) + '••••••••' + token.substring(token.length - 8)
})

const csrfTokenExpiry = computed(() => {
  const stored = sessionStorage.getItem('csrf_token')
  if (!stored) return 'Unknown'
  
  const tokenData = JSON.parse(stored)
  return new Date(tokenData.expiry).toLocaleString()
})

const recentViolations = computed(() => {
  // Get violations from security status (would need to be exposed)
  return securityStatus.value.violations || []
})

const recommendations = computed(() => {
  const recs = []
  
  if (!securityStatus.value.cspActive) {
    recs.push({
      severity: 'error',
      icon: 'mdi-alert-circle',
      title: 'CSP Not Active',
      description: 'Content Security Policy is not properly configured',
      actionText: 'Fix CSP',
      action: () => {
        console.log('Fix CSP clicked')
      }
    })
  }
  
  if (!securityStatus.value.csrfToken) {
    recs.push({
      severity: 'warning',
      icon: 'mdi-shield-alert',
      title: 'CSRF Token Missing',
      description: 'CSRF protection token needs to be regenerated',
      actionText: 'Generate Token',
      action: regenerateCSRFToken
    })
  }
  
  if (violationCount.value > 10) {
    recs.push({
      severity: 'error',
      icon: 'mdi-security',
      title: 'High Violation Count',
      description: 'Multiple security violations detected - review security configuration',
      actionText: 'Review Config',
      action: () => {
        console.log('Review config clicked')
      }
    })
  }
  
  if (csrfTokenProgress.value > 80) {
    recs.push({
      severity: 'warning',
      icon: 'mdi-clock-alert',
      title: 'CSRF Token Expiring',
      description: 'CSRF token will expire soon - consider regenerating',
      actionText: 'Regenerate',
      action: regenerateCSRFToken
    })
  }
  
  return recs
})

// Methods
const refreshStatus = () => {
  security.refreshStatus()
  updateCSRFTokenAge()
}

const regenerateCSRFToken = () => {
  // Force regeneration by clearing current token
  sessionStorage.removeItem('csrf_token')
  security.getCSRFToken() // This will generate a new one
  refreshStatus()
  
  console.log('🔄 CSRF token regenerated')
}

const updateCSRFTokenAge = () => {
  const stored = sessionStorage.getItem('csrf_token')
  if (stored) {
    const tokenData = JSON.parse(stored)
    const created = tokenData.expiry - (24 * 60 * 60 * 1000) // Assuming 24h expiry
    csrfTokenAge.value = Date.now() - created
  } else {
    csrfTokenAge.value = 0
  }
}

const getViolationSeverity = (violation: any) => {
  if (violation.directive?.includes('script-src') || violation.type === 'xss_attempt') {
    return {
      level: 'CRITICAL',
      color: 'error',
      icon: 'mdi-alert-octagon'
    }
  }
  
  if (violation.directive?.includes('style-src') || violation.type === 'csrf_attempt') {
    return {
      level: 'HIGH',
      color: 'warning',
      icon: 'mdi-alert'
    }
  }
  
  return {
    level: 'MEDIUM',
    color: 'info',
    icon: 'mdi-information'
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// Lifecycle
onMounted(() => {
  refreshStatus()
  
  // Update token age every minute
  updateInterval.value = setInterval(updateCSRFTokenAge, 60000)
  
  // Show CSRF token section in development
  if (import.meta.env.DEV) {
    showCSRFToken.value = true
  }
})

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})
</script>

<style scoped>
.security-dashboard {
  font-family: 'Inter', sans-serif;
}

.security-features {
  background: rgba(var(--v-theme-success), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.feature-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.feature-item:last-child {
  border-bottom: none;
}

.security-metrics {
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.metrics-grid {
  display: grid;
  gap: 16px;
}

.metric-card {
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 6px;
  padding: 12px;
  text-align: center;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 8px;
}

.csrf-section {
  background: rgba(var(--v-theme-info), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.csrf-card {
  background: rgba(var(--v-theme-surface), 0.8);
}

.token-display {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px;
  padding: 8px 12px;
  margin: 8px 0;
}

.token-value {
  flex: 1;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  word-break: break-all;
}

.token-info {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.violations-section {
  background: rgba(var(--v-theme-error), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.violation-details {
  padding: 12px 0;
}

.detail-row {
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.policy-text,
.data-text {
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px;
  padding: 8px;
  margin-top: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.75rem;
}

.recommendations-section {
  background: rgba(var(--v-theme-warning), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.recommendations-list {
  max-height: 400px;
  overflow-y: auto;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-value {
    font-size: 1.25rem;
  }
  
  .token-value {
    font-size: 0.75rem;
  }
}
</style>