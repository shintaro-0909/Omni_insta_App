<template>
  <div class="cyberpunk-dashboard">
    <div class="scanlines"></div>
    <div class="grid-overlay"></div>
    
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title">
          <span class="glitch-text" data-text="NEURAL">NEURAL</span>
          <span class="neon-text">COMMAND CENTER</span>
        </h1>
        <div class="status-indicator">
          <div class="status-dot online"></div>
          <span class="status-text">NEURAL LINK ACTIVE</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="system-time">
          <span class="time-label">SYSTEM TIME:</span>
          <span class="time-value">{{ currentTime }}</span>
        </div>
        <div class="user-profile">
          <div class="avatar-hologram">
            <div class="avatar-inner">NEO</div>
          </div>
          <div class="user-info">
            <span class="username">root@matrix</span>
            <span class="user-role">ARCHITECT</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Grid -->
    <div class="dashboard-grid">
      
      <!-- Terminal Console -->
      <div class="widget terminal-widget">
        <div class="widget-header">
          <h3 class="widget-title">NEURAL TERMINAL</h3>
          <div class="terminal-controls">
            <span class="control-btn minimize"></span>
            <span class="control-btn maximize"></span>
            <span class="control-btn close"></span>
          </div>
        </div>
        <div class="terminal-content">
          <div class="terminal-lines">
            <div class="terminal-line" v-for="(log, index) in terminalLogs" :key="index">
              <span class="timestamp">{{ log.timestamp }}</span>
              <span :class="['log-level', log.level]">{{ log.level }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
          <div class="terminal-input">
            <span class="prompt">root@neural:~$</span>
            <input 
              type="text" 
              class="command-input"
              v-model="currentCommand"
              @keyup.enter="executeCommand"
              placeholder="Enter command..."
            >
            <span class="cursor"></span>
          </div>
        </div>
      </div>

      <!-- System Metrics -->
      <div class="widget metrics-widget">
        <div class="widget-header">
          <h3 class="widget-title">SYSTEM METRICS</h3>
          <div class="refresh-indicator"></div>
        </div>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon cpu"></div>
            <div class="metric-info">
              <span class="metric-label">CPU USAGE</span>
              <span class="metric-value neon-cyan">{{ systemMetrics.cpu }}%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: systemMetrics.cpu + '%' }"></div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon memory"></div>
            <div class="metric-info">
              <span class="metric-label">NEURAL MEMORY</span>
              <span class="metric-value neon-magenta">{{ systemMetrics.memory }}%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: systemMetrics.memory + '%' }"></div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon network"></div>
            <div class="metric-info">
              <span class="metric-label">BANDWIDTH</span>
              <span class="metric-value neon-green">{{ systemMetrics.network }}%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: systemMetrics.network + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Holographic Chart -->
      <div class="widget chart-widget">
        <div class="widget-header">
          <h3 class="widget-title">ENGAGEMENT MATRIX</h3>
          <div class="chart-controls">
            <button class="chart-btn" :class="{ active: chartPeriod === '24h' }" @click="chartPeriod = '24h'">24H</button>
            <button class="chart-btn" :class="{ active: chartPeriod === '7d' }" @click="chartPeriod = '7d'">7D</button>
            <button class="chart-btn" :class="{ active: chartPeriod === '30d' }" @click="chartPeriod = '30d'">30D</button>
          </div>
        </div>
        <div class="holographic-chart">
          <svg class="chart-svg" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#00ffff;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path
              class="chart-line"
              :d="chartPath"
              fill="none"
              stroke="#00ffff"
              stroke-width="2"
            />
            <path
              class="chart-area"
              :d="chartAreaPath"
              fill="url(#chartGradient)"
              opacity="0.3"
            />
            <g class="chart-points">
              <circle
                v-for="(point, index) in chartData"
                :key="index"
                :cx="point.x"
                :cy="point.y"
                r="3"
                fill="#00ffff"
                class="chart-point"
              />
            </g>
          </svg>
          <div class="chart-overlay">
            <div class="chart-stats">
              <div class="stat-item">
                <span class="stat-value neon-cyan">{{ formatNumber(totalEngagement) }}</span>
                <span class="stat-label">TOTAL ENGAGEMENTS</span>
              </div>
              <div class="stat-item">
                <span class="stat-value neon-magenta">+{{ growthRate }}%</span>
                <span class="stat-label">GROWTH RATE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Connections -->
      <div class="widget connections-widget">
        <div class="widget-header">
          <h3 class="widget-title">ACTIVE NEURAL LINKS</h3>
          <span class="connection-count">{{ activeConnections.length }}</span>
        </div>
        <div class="connections-list">
          <div 
            class="connection-item"
            v-for="connection in activeConnections"
            :key="connection.id"
          >
            <div class="connection-avatar">
              <img :src="connection.avatar" :alt="connection.name">
              <div class="status-indicator online"></div>
            </div>
            <div class="connection-info">
              <span class="connection-name">{{ connection.name }}</span>
              <span class="connection-handle">@{{ connection.handle }}</span>
            </div>
            <div class="connection-stats">
              <div class="connection-metric">
                <span class="metric-value">{{ connection.followers }}</span>
                <span class="metric-label">FOLLOWERS</span>
              </div>
              <div class="connection-metric">
                <span class="metric-value">{{ connection.posts }}</span>
                <span class="metric-label">POSTS</span>
              </div>
            </div>
            <div class="connection-actions">
              <button class="action-btn monitor">MONITOR</button>
              <button class="action-btn disconnect">DISCONNECT</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert System -->
      <div class="widget alerts-widget">
        <div class="widget-header">
          <h3 class="widget-title">SYSTEM ALERTS</h3>
          <div class="alert-indicator blinking"></div>
        </div>
        <div class="alerts-list">
          <div 
            class="alert-item"
            v-for="alert in systemAlerts"
            :key="alert.id"
            :class="['alert-' + alert.type]"
          >
            <div class="alert-icon">
              <div class="alert-symbol">{{ getAlertSymbol(alert.type) }}</div>
            </div>
            <div class="alert-content">
              <span class="alert-title">{{ alert.title }}</span>
              <span class="alert-description">{{ alert.description }}</span>
              <span class="alert-time">{{ alert.timestamp }}</span>
            </div>
            <button class="alert-dismiss" @click="dismissAlert(alert.id)">×</button>
          </div>
        </div>
      </div>

      <!-- Quick Actions */
      <div class="widget actions-widget">
        <div class="widget-header">
          <h3 class="widget-title">QUICK ACTIONS</h3>
        </div>
        <div class="actions-grid">
          <button class="action-card" @click="executeAction('schedule')">
            <div class="action-icon schedule"></div>
            <span class="action-label">SCHEDULE POST</span>
            <div class="action-glow"></div>
          </button>
          
          <button class="action-card" @click="executeAction('analyze')">
            <div class="action-icon analyze"></div>
            <span class="action-label">ANALYZE METRICS</span>
            <div class="action-glow"></div>
          </button>
          
          <button class="action-card" @click="executeAction('optimize')">
            <div class="action-icon optimize"></div>
            <span class="action-label">OPTIMIZE AI</span>
            <div class="action-glow"></div>
          </button>
          
          <button class="action-card" @click="executeAction('backup')">
            <div class="action-icon backup"></div>
            <span class="action-label">BACKUP DATA</span>
            <div class="action-glow"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Reactive data
const currentTime = ref('')
const currentCommand = ref('')
const chartPeriod = ref('24h')
const systemMetrics = ref({
  cpu: 67,
  memory: 84,
  network: 92
})

const terminalLogs = ref([
  { timestamp: '14:23:12', level: 'INFO', message: 'Neural link established with @instagram_user_001' },
  { timestamp: '14:23:45', level: 'SUCCESS', message: 'Post scheduled successfully for 18:00 JST' },
  { timestamp: '14:24:01', level: 'WARNING', message: 'High CPU usage detected in AI processing module' },
  { timestamp: '14:24:18', level: 'INFO', message: 'Engagement metrics updated - 15% increase detected' },
  { timestamp: '14:24:32', level: 'ERROR', message: 'Connection timeout for @inactive_account_007' }
])

const activeConnections = ref([
  {
    id: 1,
    name: 'Tech Influencer',
    handle: 'tech_ninja',
    avatar: 'https://picsum.photos/40/40?random=1',
    followers: '125K',
    posts: '47'
  },
  {
    id: 2,
    name: 'Fashion Brand',
    handle: 'neo_fashion',
    avatar: 'https://picsum.photos/40/40?random=2',
    followers: '89K',
    posts: '32'
  },
  {
    id: 3,
    name: 'Lifestyle Blog',
    handle: 'cyber_life',
    avatar: 'https://picsum.photos/40/40?random=3',
    followers: '203K',
    posts: '78'
  }
])

const systemAlerts = ref([
  {
    id: 1,
    type: 'critical',
    title: 'SYSTEM OVERLOAD',
    description: 'Neural processing units exceeding safe parameters',
    timestamp: '2 minutes ago'
  },
  {
    id: 2,
    type: 'warning',
    title: 'API RATE LIMIT',
    description: 'Instagram API rate limit approaching (85% used)',
    timestamp: '5 minutes ago'
  },
  {
    id: 3,
    type: 'info',
    title: 'BACKUP COMPLETE',
    description: 'Daily neural network backup completed successfully',
    timestamp: '1 hour ago'
  }
])

// Chart data
const chartData = ref([
  { x: 50, y: 150 },
  { x: 100, y: 120 },
  { x: 150, y: 80 },
  { x: 200, y: 110 },
  { x: 250, y: 60 },
  { x: 300, y: 90 },
  { x: 350, y: 40 }
])

// Computed properties
const chartPath = computed(() => {
  return chartData.value.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')
})

const chartAreaPath = computed(() => {
  const path = chartPath.value
  const firstPoint = chartData.value[0]
  const lastPoint = chartData.value[chartData.value.length - 1]
  return `${path} L ${lastPoint.x} 200 L ${firstPoint.x} 200 Z`
})

const totalEngagement = computed(() => 1247892)
const growthRate = computed(() => 23.7)

// Methods
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour12: false,
    timeZone: 'Asia/Tokyo'
  })
}

const executeCommand = () => {
  if (!currentCommand.value.trim()) return
  
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  const newLog = {
    id: Date.now(),
    timestamp,
    level: 'COMMAND',
    message: `$ ${currentCommand.value}`
  }
  
  terminalLogs.value.unshift(newLog)
  
  // Enhanced command processing
  const command = currentCommand.value.toLowerCase()
  setTimeout(() => {
    let responseMessage = 'Command executed successfully'
    let responseLevel = 'SUCCESS'
    
    if (command.includes('help')) {
      responseMessage = 'Available commands: status, metrics, clear, reboot, analyze, hack'
    } else if (command.includes('status')) {
      responseMessage = 'All neural networks operational. Matrix connection stable.'
    } else if (command.includes('hack')) {
      responseMessage = 'INITIATING NEURAL HACK PROTOCOL... ACCESS GRANTED'
      responseLevel = 'SUCCESS'
    } else if (command.includes('clear')) {
      terminalLogs.value = []
      return
    } else if (command.includes('error')) {
      responseMessage = 'CRITICAL ERROR: Neural link compromised'
      responseLevel = 'ERROR'
    }
    
    const response = {
      id: Date.now() + 1,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      level: responseLevel,
      message: responseMessage
    }
    
    terminalLogs.value.unshift(response)
    
    // Limit logs to prevent memory issues
    if (terminalLogs.value.length > 50) {
      terminalLogs.value = terminalLogs.value.slice(0, 50)
    }
  }, 500)
  
  currentCommand.value = ''
}

const getAlertSymbol = (type: string) => {
  switch (type) {
    case 'critical': return '⚠'
    case 'warning': return '⚡'
    case 'info': return 'ℹ'
    default: return '●'
  }
}

const dismissAlert = (id: number) => {
  systemAlerts.value = systemAlerts.value.filter(alert => alert.id !== id)
}

const executeAction = (action: string) => {
  const newLog = {
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    level: 'ACTION',
    message: `Executing ${action.toUpperCase()} protocol...`
  }
  terminalLogs.value.push(newLog)
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// Update metrics periodically
const updateMetrics = () => {
  systemMetrics.value.cpu = Math.floor(Math.random() * 30) + 60
  systemMetrics.value.memory = Math.floor(Math.random() * 20) + 75
  systemMetrics.value.network = Math.floor(Math.random() * 15) + 85
}

let timeInterval: NodeJS.Timeout
let metricsInterval: NodeJS.Timeout

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  metricsInterval = setInterval(updateMetrics, 3000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
  clearInterval(metricsInterval)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Courier+New&display=swap');

/* Base Styles */
.cyberpunk-dashboard {
  min-height: 100vh;
  background: #000;
  color: #00ffff;
  font-family: 'Orbitron', monospace;
  position: relative;
  padding: 1rem;
}

/* Effects */
.scanlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.02) 51%
  );
  background-size: 100% 3px;
  pointer-events: none;
  z-index: 1;
}

.grid-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0 2rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 900;
  margin: 0;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff00;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.system-time {
  text-align: right;
}

.time-label {
  display: block;
  font-size: 0.7rem;
  color: rgba(0, 255, 255, 0.6);
}

.time-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #00ff00;
  font-family: 'Courier New', monospace;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-hologram {
  width: 50px;
  height: 50px;
  border: 2px solid #00ffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 255, 0.1);
  position: relative;
}

.avatar-inner {
  font-weight: 700;
  font-size: 0.8rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 700;
  color: #00ffff;
}

.user-role {
  font-size: 0.8rem;
  color: #ff00ff;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

/* Widget Base */
.widget {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #00ffff;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.widget:hover {
  border-color: #ff00ff;
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.2);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.widget-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #00ffff;
}

/* Terminal Widget */
.terminal-widget {
  grid-column: span 2;
}

.terminal-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff0040;
}

.control-btn.minimize { background: #ffff00; }
.control-btn.maximize { background: #00ff00; }

.terminal-content {
  padding: 1rem;
  font-family: 'Courier New', monospace;
  height: 300px;
  display: flex;
  flex-direction: column;
}

.terminal-lines {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.terminal-line {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.timestamp {
  color: rgba(0, 255, 255, 0.6);
  min-width: 60px;
}

.log-level {
  min-width: 60px;
  font-weight: 700;
}

.log-level.INFO { color: #00ffff; }
.log-level.SUCCESS { color: #00ff00; }
.log-level.WARNING { color: #ffff00; }
.log-level.ERROR { color: #ff0040; }
.log-level.EXEC { color: #ff00ff; }
.log-level.ACTION { color: #ffa500; }

.terminal-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.prompt {
  color: #00ff00;
  font-weight: 700;
}

.command-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #00ffff;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  outline: none;
}

.cursor {
  width: 8px;
  height: 16px;
  background: #00ffff;
  animation: blink 1s infinite;
}

/* Metrics Widget */
.metrics-grid {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.5);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border: 2px solid #00ffff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.metric-icon::before {
  content: '';
  width: 20px;
  height: 20px;
  background: #00ffff;
  border-radius: 2px;
}

.metric-icon.cpu::before { background: #00ffff; }
.metric-icon.memory::before { background: #ff00ff; }
.metric-icon.network::before { background: #00ff00; }

.metric-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.metric-bar {
  width: 100px;
  height: 8px;
  background: rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  transition: width 0.5s ease;
}

/* Chart Widget */
.chart-widget {
  grid-column: span 2;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-btn {
  background: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.25rem 0.75rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-btn:hover,
.chart-btn.active {
  background: rgba(0, 255, 255, 0.1);
  border-color: #ff00ff;
  color: #ff00ff;
}

.holographic-chart {
  position: relative;
  padding: 2rem;
  height: 300px;
}

.chart-svg {
  width: 100%;
  height: 200px;
}

.chart-line {
  filter: drop-shadow(0 0 5px #00ffff);
  animation: glow 2s ease-in-out infinite alternate;
}

.chart-point {
  filter: drop-shadow(0 0 3px #00ffff);
}

.chart-overlay {
  position: absolute;
  top: 2rem;
  right: 2rem;
}

.chart-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

/* Connections Widget */
.connection-count {
  background: #ff00ff;
  color: #000;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.8rem;
}

.connections-list {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.connection-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 255, 255, 0.2);
  margin-bottom: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.connection-item:hover {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
}

.connection-avatar {
  position: relative;
}

.connection-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #00ffff;
}

.connection-avatar .status-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
}

.connection-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.connection-name {
  font-weight: 700;
  color: #00ffff;
}

.connection-handle {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

.connection-stats {
  display: flex;
  gap: 1rem;
}

.connection-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.connection-metric .metric-value {
  font-weight: 700;
  color: #ff00ff;
}

.connection-metric .metric-label {
  font-size: 0.7rem;
  color: rgba(0, 255, 255, 0.6);
}

.connection-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  cursor: pointer;
  font-family: 'Orbitron', monospace;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: #ff00ff;
  color: #ff00ff;
}

.action-btn.disconnect {
  border-color: #ff0040;
  color: #ff0040;
}

.action-btn.disconnect:hover {
  background: rgba(255, 0, 64, 0.1);
  border-color: #ff0040;
}

/* Alerts Widget */
.alert-indicator {
  width: 10px;
  height: 10px;
  background: #ff0040;
  border-radius: 50%;
}

.alert-indicator.blinking {
  animation: blink 1s infinite;
}

.alerts-list {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-left: 4px solid;
  background: rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
  position: relative;
}

.alert-critical {
  border-left-color: #ff0040;
  background: rgba(255, 0, 64, 0.1);
}

.alert-warning {
  border-left-color: #ffff00;
  background: rgba(255, 255, 0, 0.1);
}

.alert-info {
  border-left-color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
}

.alert-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.alert-critical .alert-icon { background: #ff0040; color: #000; }
.alert-warning .alert-icon { background: #ffff00; color: #000; }
.alert-info .alert-icon { background: #00ffff; color: #000; }

.alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.alert-description {
  font-size: 0.9rem;
  color: rgba(0, 255, 255, 0.8);
  margin-bottom: 0.25rem;
}

.alert-time {
  font-size: 0.7rem;
  color: rgba(0, 255, 255, 0.6);
}

.alert-dismiss {
  background: transparent;
  border: none;
  color: rgba(0, 255, 255, 0.6);
  font-size: 1.2rem;
  cursor: pointer;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.alert-dismiss:hover {
  color: #ff0040;
}

/* Actions Widget */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  border-color: #ff00ff;
  color: #ff00ff;
  transform: translateY(-2px);
}

.action-card:hover .action-glow {
  opacity: 1;
}

.action-icon {
  width: 40px;
  height: 40px;
  border: 2px solid currentColor;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.action-icon::before {
  content: '';
  width: 20px;
  height: 20px;
  background: currentColor;
  border-radius: 2px;
}

.action-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  font-family: 'Orbitron', monospace;
}

.action-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255, 0, 255, 0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

/* Neon Effects */
.neon-text {
  text-shadow: 
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 20px currentColor;
}

.neon-cyan {
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
}

.neon-magenta {
  color: #ff00ff;
  text-shadow: 0 0 10px #ff00ff;
}

.neon-green {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
}

/* Glitch Effect */
.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.glitch-text:hover::before {
  animation: glitch-1 0.2s infinite;
  color: #ff00ff;
  opacity: 0.8;
}

.glitch-text:hover::after {
  animation: glitch-2 0.2s infinite;
  color: #00ff00;
  opacity: 0.8;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes glow {
  0% { filter: drop-shadow(0 0 5px #00ffff); }
  100% { filter: drop-shadow(0 0 15px #00ffff); }
}

@keyframes glitch-1 {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes glitch-2 {
  0% { transform: translate(0); }
  20% { transform: translate(2px, -2px); }
  40% { transform: translate(2px, 2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(-2px, 2px); }
  100% { transform: translate(0); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .terminal-widget,
  .chart-widget {
    grid-column: span 1;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-right {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>