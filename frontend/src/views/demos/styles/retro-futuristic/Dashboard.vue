<template>
  <div class="retro-dashboard">
    <!-- Background Effects -->
    <div class="cyber-bg">
      <div class="grid-lines"></div>
      <div class="noise-overlay"></div>
      <div class="scan-effect"></div>
    </div>

    <!-- Header -->
    <header class="dashboard-header">
      <div class="logo-section">
        <div class="logo-glitch">OMNIY</div>
        <div class="logo-subtitle">CONTROL DECK v2.084</div>
      </div>
      <div class="user-section">
        <div class="user-info">
          <span class="user-label">OPERATOR:</span>
          <span class="user-name">CYBER_USER_001</span>
        </div>
        <div class="time-display">{{ currentTime }}</div>
      </div>
    </header>

    <!-- Main Dashboard -->
    <main class="dashboard-main">
      <!-- Metrics Grid -->
      <section class="metrics-section">
        <div class="section-header">
          <h2 class="neon-title">SYSTEM METRICS</h2>
          <div class="pulse-indicator"></div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card" v-for="metric in metrics" :key="metric.id">
            <div class="metric-frame">
              <div class="metric-value">
                <span class="value-number">{{ metric.value }}</span>
                <span class="value-unit">{{ metric.unit }}</span>
              </div>
              <h3 class="metric-label">{{ metric.label }}</h3>
              <div class="metric-graph">
                <svg viewBox="0 0 100 40">
                  <polyline
                    :points="metric.sparkline"
                    fill="none"
                    :stroke="metric.color"
                    stroke-width="2"
                  />
                  <polyline
                    :points="metric.sparkline"
                    fill="none"
                    :stroke="metric.color"
                    stroke-width="2"
                    opacity="0.3"
                    filter="blur(3px)"
                  />
                </svg>
              </div>
              <div
                class="metric-glow"
                :style="`background: ${metric.color}`"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3D Charts -->
      <section class="charts-section">
        <div class="chart-container">
          <h3 class="chart-title">ENGAGEMENT MATRIX</h3>
          <div class="chart-3d">
            <div class="chart-bars">
              <div
                class="bar"
                v-for="(bar, index) in chartData"
                :key="index"
                :style="`height: ${bar.value}%; animation-delay: ${index * 0.1}s`"
              >
                <div class="bar-face front"></div>
                <div class="bar-face back"></div>
                <div class="bar-face left"></div>
                <div class="bar-face right"></div>
                <div class="bar-face top"></div>
                <span class="bar-label">{{ bar.label }}</span>
              </div>
            </div>
            <div class="chart-grid-3d"></div>
          </div>
        </div>

        <div class="chart-container">
          <h3 class="chart-title">ACTIVITY HEATMAP</h3>
          <div class="heatmap">
            <div
              class="heat-cell"
              v-for="(cell, index) in heatmapData"
              :key="index"
              :style="`background: rgba(255, 0, 110, ${cell.intensity}); animation-delay: ${index * 0.05}s`"
            >
              <span class="cell-value">{{ cell.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Activity Feed -->
      <section class="activity-section">
        <div class="section-header">
          <h2 class="neon-title">SYSTEM LOG</h2>
          <div class="log-status">
            <span class="status-dot"></span>
            LIVE
          </div>
        </div>

        <div class="activity-feed">
          <div class="log-entry" v-for="log in systemLogs" :key="log.id">
            <div class="log-time">{{ log.time }}</div>
            <div class="log-type" :class="`type-${log.type}`">
              {{ log.type }}
            </div>
            <div class="log-message">{{ log.message }}</div>
            <div class="log-scanline"></div>
          </div>
        </div>
      </section>

      <!-- Control Panel -->
      <section class="control-section">
        <h2 class="neon-title">COMMAND CENTER</h2>
        <div class="control-grid">
          <button
            class="control-btn"
            v-for="control in controls"
            :key="control.id"
          >
            <div class="btn-icon">{{ control.icon }}</div>
            <span class="btn-label">{{ control.label }}</span>
            <div class="btn-glow"></div>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';

  // Current time display
  const currentTime = ref('');
  let timeInterval: number;

  const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('ja-JP', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Metrics data
  const metrics = ref([
    {
      id: 1,
      label: 'POSTS TODAY',
      value: '127',
      unit: '',
      color: '#ff006e',
      sparkline: '0,35 20,20 40,25 60,15 80,30 100,10',
    },
    {
      id: 2,
      label: 'ENGAGEMENT',
      value: '89.4',
      unit: '%',
      color: '#8338ec',
      sparkline: '0,30 20,25 40,35 60,20 80,40 100,35',
    },
    {
      id: 3,
      label: 'FOLLOWERS',
      value: '45.2',
      unit: 'K',
      color: '#3a86ff',
      sparkline: '0,10 20,15 40,20 60,25 80,30 100,40',
    },
    {
      id: 4,
      label: 'REACH',
      value: '2.8',
      unit: 'M',
      color: '#ffbe0b',
      sparkline: '0,20 20,30 40,25 60,35 80,28 100,38',
    },
  ]);

  // Chart data
  const chartData = ref([
    { label: 'MON', value: 75 },
    { label: 'TUE', value: 82 },
    { label: 'WED', value: 68 },
    { label: 'THU', value: 90 },
    { label: 'FRI', value: 85 },
    { label: 'SAT', value: 95 },
    { label: 'SUN', value: 78 },
  ]);

  // Heatmap data
  const heatmapData = ref(
    Array.from({ length: 24 }, (_, i) => ({
      value: Math.floor(Math.random() * 100),
      intensity: Math.random(),
    }))
  );

  // System logs
  const systemLogs = ref([
    {
      id: 1,
      time: '23:45:12',
      type: 'SUCCESS',
      message: 'Post scheduled for @cyber_account',
    },
    {
      id: 2,
      time: '23:44:58',
      type: 'INFO',
      message: 'AI optimization complete',
    },
    {
      id: 3,
      time: '23:44:32',
      type: 'WARNING',
      message: 'API rate limit: 80% used',
    },
    {
      id: 4,
      time: '23:43:15',
      type: 'SUCCESS',
      message: 'Batch processing completed',
    },
    {
      id: 5,
      time: '23:42:47',
      type: 'INFO',
      message: 'System sync in progress',
    },
  ]);

  // Control buttons
  const controls = ref([
    { id: 1, icon: '⚡', label: 'QUICK POST' },
    { id: 2, icon: '📊', label: 'ANALYTICS' },
    { id: 3, icon: '🔄', label: 'SYNC NOW' },
    { id: 4, icon: '🎯', label: 'OPTIMIZE' },
  ]);

  onMounted(() => {
    updateTime();
    timeInterval = setInterval(updateTime, 1000);
  });

  onUnmounted(() => {
    clearInterval(timeInterval);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  /* Base */
  .retro-dashboard {
    position: relative;
    min-height: 100vh;
    background: #0a0a0f;
    color: #fff;
    font-family: 'Share Tech Mono', monospace;
    overflow: hidden;
  }

  /* Background Effects */
  .cyber-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
  }

  .grid-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(138, 43, 226, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(138, 43, 226, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: grid-scroll 20s linear infinite;
  }

  .noise-overlay {
    position: absolute;
    inset: 0;
    opacity: 0.05;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E");
    mix-blend-mode: overlay;
  }

  .scan-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, #ff006e, transparent);
    animation: scan-down 8s linear infinite;
  }

  /* Header */
  .dashboard-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    border-bottom: 1px solid rgba(138, 43, 226, 0.3);
    background: rgba(10, 10, 15, 0.8);
    backdrop-filter: blur(10px);
    z-index: 10;
  }

  .logo-section {
    display: flex;
    flex-direction: column;
  }

  .logo-glitch {
    font-family: 'Orbitron', monospace;
    font-size: 2.5rem;
    font-weight: 900;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px #ff006e;
    animation: glitch-text 4s infinite;
  }

  .logo-subtitle {
    font-size: 0.8rem;
    color: #3a86ff;
    letter-spacing: 0.2em;
    margin-top: 0.2rem;
  }

  .user-section {
    text-align: right;
  }

  .user-info {
    margin-bottom: 0.5rem;
  }

  .user-label {
    color: #8338ec;
    font-size: 0.8rem;
    margin-right: 0.5rem;
  }

  .user-name {
    color: #3a86ff;
    font-weight: 700;
  }

  .time-display {
    font-size: 1.2rem;
    color: #ffbe0b;
    text-shadow: 0 0 10px currentColor;
    letter-spacing: 0.1em;
  }

  /* Main Dashboard */
  .dashboard-main {
    position: relative;
    padding: 2rem;
    z-index: 1;
  }

  /* Section Headers */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
  }

  .neon-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #ff006e;
    text-shadow: 0 0 20px currentColor;
    position: relative;
  }

  .neon-title::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #ff006e, transparent);
  }

  .pulse-indicator {
    width: 10px;
    height: 10px;
    background: #3a86ff;
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
  }

  /* Metrics Grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .metric-card {
    position: relative;
  }

  .metric-frame {
    position: relative;
    background: rgba(26, 0, 51, 0.6);
    border: 1px solid rgba(138, 43, 226, 0.3);
    padding: 2rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .metric-card:hover .metric-frame {
    transform: translateY(-5px);
    border-color: rgba(255, 0, 110, 0.6);
    box-shadow: 0 10px 30px rgba(255, 0, 110, 0.3);
  }

  .metric-value {
    display: flex;
    align-items: baseline;
    margin-bottom: 0.5rem;
  }

  .value-number {
    font-family: 'Orbitron', monospace;
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: value-pulse 3s ease-in-out infinite;
  }

  .value-unit {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.6);
    margin-left: 0.5rem;
  }

  .metric-label {
    font-size: 0.9rem;
    color: #3a86ff;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
  }

  .metric-graph {
    height: 40px;
  }

  .metric-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    filter: blur(40px);
    z-index: -1;
    transition: opacity 0.3s ease;
  }

  .metric-card:hover .metric-glow {
    opacity: 0.3;
  }

  /* 3D Charts */
  .charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 3rem;
    margin-bottom: 4rem;
  }

  .chart-container {
    position: relative;
  }

  .chart-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.2rem;
    color: #8338ec;
    margin-bottom: 1.5rem;
    text-shadow: 0 0 10px currentColor;
  }

  .chart-3d {
    position: relative;
    height: 300px;
    perspective: 1000px;
  }

  .chart-bars {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) rotateX(-20deg) rotateY(-30deg);
    display: flex;
    gap: 1.5rem;
    transform-style: preserve-3d;
  }

  .bar {
    position: relative;
    width: 40px;
    transform-style: preserve-3d;
    animation: bar-grow 1s ease-out forwards;
  }

  .bar-face {
    position: absolute;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    opacity: 0.8;
  }

  .bar-face.front {
    width: 100%;
    height: 100%;
    transform: translateZ(20px);
  }

  .bar-face.back {
    width: 100%;
    height: 100%;
    transform: translateZ(-20px);
  }

  .bar-face.left {
    width: 40px;
    height: 100%;
    left: -20px;
    transform: rotateY(-90deg);
  }

  .bar-face.right {
    width: 40px;
    height: 100%;
    right: -20px;
    transform: rotateY(90deg);
  }

  .bar-face.top {
    width: 100%;
    height: 40px;
    top: 0;
    transform: rotateX(90deg) translateZ(20px);
    background: #ffbe0b;
  }

  .bar-label {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    color: #3a86ff;
    white-space: nowrap;
  }

  .chart-grid-3d {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    background-image:
      linear-gradient(rgba(138, 43, 226, 0.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(138, 43, 226, 0.2) 1px, transparent 1px);
    background-size: 50px 50px;
    transform: rotateX(-20deg) rotateY(-30deg);
    transform-origin: center bottom;
  }

  /* Heatmap */
  .heatmap {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
    padding: 1rem;
    background: rgba(26, 0, 51, 0.4);
    border: 1px solid rgba(138, 43, 226, 0.3);
  }

  .heat-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    color: #fff;
    border: 1px solid rgba(255, 0, 110, 0.3);
    transition: all 0.3s ease;
    animation: cell-pulse 2s ease-in-out infinite;
  }

  .heat-cell:hover {
    transform: scale(1.1);
    border-color: #ff006e;
    box-shadow: 0 0 20px rgba(255, 0, 110, 0.5);
  }

  .cell-value {
    font-weight: 700;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }

  /* Activity Feed */
  .activity-section {
    margin-bottom: 4rem;
  }

  .log-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #3a86ff;
    font-size: 0.9rem;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #3a86ff;
    border-radius: 50%;
    animation: blink 1s ease-in-out infinite;
  }

  .activity-feed {
    background: rgba(26, 0, 51, 0.4);
    border: 1px solid rgba(138, 43, 226, 0.3);
    padding: 1rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .log-entry {
    display: grid;
    grid-template-columns: 100px 100px 1fr;
    gap: 1rem;
    padding: 0.8rem;
    border-bottom: 1px solid rgba(138, 43, 226, 0.2);
    position: relative;
    transition: all 0.3s ease;
  }

  .log-entry:hover {
    background: rgba(255, 0, 110, 0.1);
    padding-left: 1.5rem;
  }

  .log-time {
    color: #ffbe0b;
    font-size: 0.9rem;
  }

  .log-type {
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
    padding: 0.2rem 0.5rem;
    border: 1px solid currentColor;
  }

  .type-SUCCESS {
    color: #3a86ff;
    background: rgba(58, 134, 255, 0.1);
  }

  .type-INFO {
    color: #8338ec;
    background: rgba(131, 56, 236, 0.1);
  }

  .type-WARNING {
    color: #ffbe0b;
    background: rgba(255, 190, 11, 0.1);
  }

  .log-message {
    color: rgba(255, 255, 255, 0.8);
  }

  .log-scanline {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #ff006e, transparent);
    opacity: 0;
    animation: scan-line 3s linear infinite;
  }

  /* Control Panel */
  .control-section {
    margin-bottom: 4rem;
  }

  .control-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .control-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    background: rgba(26, 0, 51, 0.6);
    border: 2px solid rgba(138, 43, 226, 0.5);
    color: #fff;
    font-family: 'Orbitron', monospace;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .control-btn:hover {
    transform: translateY(-5px) scale(1.05);
    border-color: #ff006e;
    box-shadow: 0 10px 30px rgba(255, 0, 110, 0.4);
  }

  .btn-icon {
    font-size: 2.5rem;
    animation: icon-float 3s ease-in-out infinite;
  }

  .btn-label {
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #3a86ff;
  }

  .btn-glow {
    position: absolute;
    inset: -50%;
    background: radial-gradient(circle, rgba(255, 0, 110, 0.4), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .control-btn:hover .btn-glow {
    opacity: 1;
    animation: rotate 3s linear infinite;
  }

  /* Animations */
  @keyframes grid-scroll {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(50px, 50px);
    }
  }

  @keyframes scan-down {
    0% {
      top: -4px;
    }
    100% {
      top: 100%;
    }
  }

  @keyframes glitch-text {
    0%,
    100% {
      text-shadow: 0 0 30px #ff006e;
    }
    25% {
      text-shadow:
        -2px 0 30px #8338ec,
        2px 0 30px #3a86ff;
    }
    50% {
      text-shadow:
        2px -2px 30px #ff006e,
        -2px 2px 30px #ffbe0b;
    }
    75% {
      text-shadow: 0 0 30px #8338ec;
    }
  }

  @keyframes pulse-dot {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.5);
      opacity: 0.5;
    }
  }

  @keyframes value-pulse {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.2);
    }
  }

  @keyframes bar-grow {
    0% {
      height: 0;
      opacity: 0;
    }
    100% {
      height: var(--height);
      opacity: 1;
    }
  }

  @keyframes cell-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }

  @keyframes scan-line {
    0% {
      top: 0;
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      top: 100%;
      opacity: 0;
    }
  }

  @keyframes icon-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Scrollbar */
  .activity-feed::-webkit-scrollbar {
    width: 8px;
  }

  .activity-feed::-webkit-scrollbar-track {
    background: rgba(26, 0, 51, 0.4);
  }

  .activity-feed::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #ff006e, #8338ec);
    border-radius: 4px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .user-section {
      text-align: center;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }

    .charts-section {
      grid-template-columns: 1fr;
    }

    .log-entry {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .log-type {
      width: fit-content;
    }
  }
</style>
