<template>
  <section class="hero-section" ref="heroRef">
    <div class="hero-container">
      <div class="hero-content">
        <!-- スロット: タイトル部分 -->
        <slot name="title">
          <div class="typography-system" :class="{ 'revealed': titleRevealed }">
            <div class="subtitle">
              <span class="subtitle-line">{{ subtitlePrefix }}</span>
              <span class="subtitle-accent">{{ subtitleMain }}</span>
            </div>
            
            <h1 class="hero-headline">
              <span 
                v-for="(word, index) in headlineWords" 
                :key="index"
                class="headline-word"
                :class="{ 'highlight': word.highlight }"
              >
                {{ word.text }}
              </span>
            </h1>
            
            <p class="hero-description">
              {{ description }}
            </p>
          </div>
        </slot>

        <!-- スロット: メトリクス -->
        <slot name="metrics">
          <div class="metrics-system" :class="{ 'revealed': metricsRevealed }">
            <div 
              v-for="(metric, index) in metrics" 
              :key="index"
              class="metric-item"
              @mouseenter="onMetricHover(index)"
              @mouseleave="onMetricLeave(index)"
              :class="{ 'active': metric.active }"
            >
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
            </div>
          </div>
        </slot>

        <!-- スロット: アクションボタン -->
        <slot name="actions">
          <div class="actions-system" :class="{ 'revealed': actionsRevealed }">
            <button 
              class="demo-btn primary"
              @click="$emit('primary-action')"
            >
              <span class="btn-text">{{ primaryButtonText }}</span>
            </button>
            
            <button 
              v-if="secondaryButtonText"
              class="demo-btn secondary"
              @click="$emit('secondary-action')"
            >
              <span class="btn-text">{{ secondaryButtonText }}</span>
            </button>
          </div>
        </slot>
      </div>

      <!-- スロット: サイドコンテンツ（ダッシュボードプレビューなど） -->
      <div class="hero-side">
        <slot name="side-content">
          <div class="demo-preview" :class="{ 'revealed': previewRevealed }">
            <div class="preview-placeholder">
              <v-icon icon="mdi-cellphone" size="64" />
              <div class="text-h6 mt-2">プレビュー</div>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

interface HeadlineWord {
  text: string
  highlight?: boolean
}

interface Metric {
  value: string
  label: string
  active?: boolean
}

interface Props {
  subtitlePrefix?: string
  subtitleMain?: string
  headlineWords: HeadlineWord[]
  description: string
  metrics?: Metric[]
  primaryButtonText?: string
  secondaryButtonText?: string
  revealDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  subtitlePrefix: 'REVOLUTIONARY',
  subtitleMain: 'INSTAGRAM AUTOMATION',
  metrics: () => [
    { value: '10K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '500%', label: 'Growth' }
  ],
  primaryButtonText: 'Get Started',
  secondaryButtonText: 'Watch Demo',
  revealDelay: 400
})

defineEmits<{
  'primary-action': []
  'secondary-action': []
}>()

const heroRef = ref<HTMLElement | null>(null)
const titleRevealed = ref(false)
const metricsRevealed = ref(false)
const actionsRevealed = ref(false)
const previewRevealed = ref(false)

const onMetricHover = (index: number) => {
  if (props.metrics[index]) {
    props.metrics[index].active = true
  }
}

const onMetricLeave = (index: number) => {
  if (props.metrics[index]) {
    props.metrics[index].active = false
  }
}

const initiateRevealSequence = async () => {
  await nextTick()
  
  setTimeout(() => { titleRevealed.value = true }, props.revealDelay)
  setTimeout(() => { metricsRevealed.value = true }, props.revealDelay + 400)
  setTimeout(() => { actionsRevealed.value = true }, props.revealDelay + 800)
  setTimeout(() => { previewRevealed.value = true }, props.revealDelay + 1200)
}

onMounted(() => {
  initiateRevealSequence()
})
</script>

<style scoped>
.hero-section {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  padding-top: 120px;
  padding-bottom: 4rem;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}

.hero-content {
  position: relative;
}

.typography-system {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin-bottom: 4rem;
}

.typography-system.revealed {
  opacity: 1;
  transform: translateY(0);
}

.subtitle {
  margin-bottom: 2rem;
}

.subtitle-line {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  margin-bottom: 0.5rem;
}

.subtitle-accent {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.hero-headline {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 300;
  line-height: 1.1;
  margin-bottom: 2rem;
}

.headline-word {
  display: block;
  margin-bottom: 0.2rem;
  transition: all 0.3s ease;
}

.headline-word.highlight {
  font-weight: 400;
}

.hero-description {
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 600px;
  margin-bottom: 3rem;
}

.metrics-system {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.metrics-system.revealed {
  opacity: 1;
  transform: translateY(0);
}

.metric-item {
  text-align: center;
  padding: 1.5rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.metric-item:hover,
.metric-item.active {
  transform: translateY(-5px);
}

.metric-value {
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.metric-label {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.actions-system {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.actions-system.revealed {
  opacity: 1;
  transform: translateY(0);
}

.demo-btn {
  position: relative;
  padding: 1.2rem 2.5rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  min-width: 180px;
  font-weight: 600;
  font-size: 1rem;
}

.demo-btn:hover {
  transform: translateY(-2px);
}

.btn-text {
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;
}

.hero-side {
  position: relative;
}

.demo-preview {
  opacity: 0;
  transform: translateY(50px) rotateX(10deg);
  transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  perspective: 1000px;
}

.demo-preview.revealed {
  opacity: 1;
  transform: translateY(0) rotateX(0deg);
}

.preview-placeholder {
  padding: 4rem 2rem;
  border-radius: 20px;
  text-align: center;
  border: 2px dashed;
  opacity: 0.5;
}

/* レスポンシブ */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 4rem;
  }
}

@media (max-width: 768px) {
  .hero-container {
    padding: 0 2rem;
    gap: 3rem;
  }
  
  .metrics-system {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .actions-system {
    flex-direction: column;
    align-items: center;
  }
  
  .demo-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>