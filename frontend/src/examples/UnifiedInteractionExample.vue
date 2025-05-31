<!--
統合インタラクションシステム使用例
新しい統合システムの使用方法デモンストレーション
-->

<template>
  <v-container ref="containerElement" class="interaction-demo pa-4">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-4">🎮 統合インタラクションシステム デモ</h2>
        
        <!-- システム状態表示 -->
        <v-card class="mb-4">
          <v-card-title>システム状態</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-chip :color="systemStatus.color" class="mb-2">
                  {{ systemStatus.text }}
                </v-chip>
                <div class="text-caption">システム状態</div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="text-h6">{{ currentGesture || 'なし' }}</div>
                <div class="text-caption">現在のジェスチャー</div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="text-h6">{{ spatialInfo }}</div>
                <div class="text-caption">空間位置</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- インタラクション領域 -->
        <v-card 
          ref="interactionArea"
          class="interaction-area mb-4"
          height="300"
          @touchstart.prevent
          @touchmove.prevent
          @touchend.prevent
        >
          <v-card-title>インタラクション領域</v-card-title>
          <v-card-text class="d-flex align-center justify-center">
            <div class="text-center">
              <v-icon size="64" color="primary">mdi-gesture</v-icon>
              <div class="mt-2">この領域でジェスチャーを試してください</div>
              <div class="text-caption mt-1">
                タップ、スワイプ、ピンチ、長押し、ダブルタップ
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 空間変換コントロール -->
        <v-card class="mb-4">
          <v-card-title>空間変換コントロール</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-slider
                  v-model="position.x"
                  label="X位置"
                  min="-100"
                  max="100"
                  @input="updateSpatialTransform"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-slider
                  v-model="position.y"
                  label="Y位置"
                  min="-100"
                  max="100"
                  @input="updateSpatialTransform"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-slider
                  v-model="scale"
                  label="スケール"
                  min="0.5"
                  max="2"
                  step="0.1"
                  @input="updateSpatialTransform"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- ジェスチャー履歴 -->
        <v-card>
          <v-card-title>
            ジェスチャー履歴
            <v-spacer />
            <v-btn 
              size="small" 
              color="primary" 
              @click="clearHistory"
            >
              履歴クリア
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="(gesture, index) in gestureHistory"
                :key="index"
                :title="gesture.type"
                :subtitle="`${gesture.timestamp} - ${gesture.details}`"
              >
                <template #prepend>
                  <v-icon :color="getGestureColor(gesture.type)">
                    {{ getGestureIcon(gesture.type) }}
                  </v-icon>
                </template>
              </v-list-item>
              <v-list-item v-if="gestureHistory.length === 0">
                <v-list-item-title class="text-grey">
                  ジェスチャーを実行すると履歴が表示されます
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  getUnifiedInteractionSystem, 
  GestureType, 
  GestureEvent 
} from '@/utils/unifiedInteractionSystem'

// Template refs
const containerElement = ref<HTMLElement>()
const interactionArea = ref<HTMLElement>()

// システム状態
const isSystemInitialized = ref(false)
const currentGesture = ref<GestureType | null>(null)
const gestureHistory = ref<Array<{
  type: GestureType
  timestamp: string
  details: string
}>>([])

// 空間変換状態
const position = ref({ x: 0, y: 0 })
const scale = ref(1)

// 統合インタラクションシステムインスタンス
let interactionSystem: ReturnType<typeof getUnifiedInteractionSystem> | null = null

// Computed
const systemStatus = computed(() => {
  if (isSystemInitialized.value) {
    return { text: '動作中', color: 'success' }
  } else {
    return { text: '初期化中', color: 'warning' }
  }
})

const spatialInfo = computed(() => {
  return `(${position.value.x}, ${position.value.y}) × ${scale.value}`
})

// Methods
const initializeInteractionSystem = () => {
  try {
    // 統合インタラクションシステムの初期化
    interactionSystem = getUnifiedInteractionSystem({
      enableSpatialNavigation: true,
      enablePredictiveUI: false,
      enableHapticFeedback: true,
      enableMultiTouch: true,
      debugMode: true
    })

    // DOM要素への接続
    if (interactionArea.value) {
      interactionSystem.attachToElement(interactionArea.value)
    }

    // カスタムジェスチャーハンドラーの登録
    setupGestureHandlers()

    isSystemInitialized.value = true
    console.log('✅ 統合インタラクションシステム初期化完了')
  } catch (error) {
    console.error('❌ システム初期化エラー:', error)
  }
}

const setupGestureHandlers = () => {
  if (!interactionSystem) return

  // 全ジェスチャータイプのハンドラー登録
  const gestureTypes: GestureType[] = [
    'tap', 'doubletap', 'longpress',
    'swipe-left', 'swipe-right', 'swipe-up', 'swipe-down',
    'pinch-in', 'pinch-out', 'rotate',
    'drag', 'flick', 'pan',
    'edge-swipe', 'multi-finger-tap'
  ]

  gestureTypes.forEach(type => {
    interactionSystem?.registerGestureHandler(type, (event: GestureEvent) => {
      handleGesture(type, event)
    })
  })
}

const handleGesture = (type: GestureType, event: GestureEvent) => {
  currentGesture.value = type
  
  // ジェスチャー履歴に追加
  const timestamp = new Date().toLocaleTimeString()
  const details = `速度: (${event.velocity.x.toFixed(1)}, ${event.velocity.y.toFixed(1)}), 距離: ${event.distance.toFixed(1)}px`
  
  gestureHistory.value.unshift({
    type,
    timestamp,
    details
  })

  // 履歴を最大10件に制限
  if (gestureHistory.value.length > 10) {
    gestureHistory.value = gestureHistory.value.slice(0, 10)
  }

  // 1秒後にcurrentGestureをクリア
  setTimeout(() => {
    currentGesture.value = null
  }, 1000)
}

const updateSpatialTransform = () => {
  if (interactionSystem) {
    interactionSystem.updateSpatialTransform(
      [position.value.x, position.value.y, 0],  // position
      [0, 0, 0],                               // rotation
      [scale.value, scale.value, scale.value]   // scale
    )
  }
}

const clearHistory = () => {
  gestureHistory.value = []
}

const getGestureIcon = (type: GestureType): string => {
  const iconMap: Record<GestureType, string> = {
    'tap': 'mdi-gesture-tap',
    'doubletap': 'mdi-gesture-double-tap',
    'longpress': 'mdi-gesture-tap-hold',
    'swipe-left': 'mdi-gesture-swipe-left',
    'swipe-right': 'mdi-gesture-swipe-right',
    'swipe-up': 'mdi-gesture-swipe-up',
    'swipe-down': 'mdi-gesture-swipe-down',
    'pinch-in': 'mdi-gesture-pinch',
    'pinch-out': 'mdi-gesture-spread',
    'rotate': 'mdi-rotate-3d-variant',
    'drag': 'mdi-drag',
    'flick': 'mdi-gesture-swipe',
    'pan': 'mdi-pan',
    'edge-swipe': 'mdi-gesture-swipe-horizontal',
    'multi-finger-tap': 'mdi-gesture-two-tap'
  }
  return iconMap[type] || 'mdi-gesture'
}

const getGestureColor = (type: GestureType): string => {
  if (type.includes('swipe')) return 'blue'
  if (type.includes('pinch')) return 'green'
  if (type.includes('tap')) return 'orange'
  if (type.includes('drag') || type.includes('pan')) return 'purple'
  return 'grey'
}

// Lifecycle
onMounted(() => {
  initializeInteractionSystem()
})

onUnmounted(() => {
  // システムのクリーンアップ
  if (interactionSystem) {
    interactionSystem.destroy()
  }
})
</script>

<style scoped>
.interaction-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.interaction-area {
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  cursor: pointer;
  user-select: none;
  touch-action: none;
}

.interaction-area:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.v-list-item {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.v-list-item:last-child {
  border-bottom: none;
}
</style>