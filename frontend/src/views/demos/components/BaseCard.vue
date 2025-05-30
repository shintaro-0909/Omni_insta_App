<template>
  <component 
    :is="tag"
    :class="cardClasses"
    :style="cardStyles"
    v-bind="$attrs"
    @click="handleClick"
    @keydown="handleKeydown"
    :tabindex="interactive ? 0 : -1"
    :role="role"
    :aria-label="ariaLabel"
  >
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
    
    <!-- Loading Overlay -->
    <div v-if="loading" class="card-loading">
      <div class="loading-spinner"></div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

export interface CardVariant {
  modern?: boolean
  cyberpunk?: boolean
  glassmorphism?: boolean
  neumorphism?: boolean
  minimalist?: boolean
  stylish?: boolean
  retro?: boolean
}

const props = defineProps({
  // Layout props
  tag: {
    type: String,
    default: 'div'
  },
  variant: {
    type: String as PropType<keyof CardVariant>,
    default: 'modern'
  },
  size: {
    type: String as PropType<'sm' | 'md' | 'lg' | 'xl'>,
    default: 'md'
  },
  
  // Visual props
  elevation: {
    type: [Number, String],
    default: 2
  },
  rounded: {
    type: [Boolean, String],
    default: true
  },
  gradient: {
    type: Boolean,
    default: false
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  
  // State props
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  interactive: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  },
  
  // Color props
  color: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: ''
  },
  
  // Accessibility props
  role: {
    type: String,
    default: ''
  },
  ariaLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click', 'focus', 'blur'])

const cardClasses = computed(() => {
  return [
    'base-card',
    `base-card--${props.variant}`,
    `base-card--${props.size}`,
    {
      'base-card--hoverable': props.hoverable,
      'base-card--interactive': props.interactive,
      'base-card--disabled': props.disabled,
      'base-card--selected': props.selected,
      'base-card--loading': props.loading,
      'base-card--gradient': props.gradient,
      [`base-card--elevation-${props.elevation}`]: props.elevation,
      [`base-card--rounded`]: props.rounded,
      [`base-card--color-${props.color}`]: props.color
    }
  ]
})

const cardStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  if (props.backgroundColor) {
    styles.backgroundColor = props.backgroundColor
  }
  
  return styles
})

const handleClick = (event: Event) => {
  if (props.disabled || props.loading) return
  emit('click', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.loading) return
  
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('click', event)
  }
}
</script>

<style scoped>
/* Base Card Styles */
.base-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--card-border-radius, 8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: var(--card-background, #ffffff);
  border: var(--card-border, none);
  box-shadow: var(--card-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
}

.base-card:focus-visible {
  outline: 2px solid var(--card-focus-color, #2196f3);
  outline-offset: 2px;
}

.base-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-card--interactive {
  cursor: pointer;
}

.base-card--hoverable:hover:not(.base-card--disabled):not(.base-card--loading) {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover, 0 8px 25px rgba(0, 0, 0, 0.15));
}

.base-card--selected {
  box-shadow: 0 0 0 2px var(--card-selected-color, #2196f3);
}

/* Size Variants */
.base-card--sm {
  --card-padding: 0.75rem;
  --card-border-radius: 6px;
}

.base-card--md {
  --card-padding: 1rem;
  --card-border-radius: 8px;
}

.base-card--lg {
  --card-padding: 1.5rem;
  --card-border-radius: 12px;
}

.base-card--xl {
  --card-padding: 2rem;
  --card-border-radius: 16px;
}

/* Elevation Variants */
.base-card--elevation-0 {
  --card-shadow: none;
  --card-shadow-hover: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.base-card--elevation-1 {
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  --card-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.base-card--elevation-2 {
  --card-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  --card-shadow-hover: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.base-card--elevation-3 {
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --card-shadow-hover: 0 12px 30px rgba(0, 0, 0, 0.2);
}

/* Content Areas */
.card-header {
  padding: var(--card-padding);
  border-bottom: var(--card-header-border, 1px solid rgba(0, 0, 0, 0.06));
}

.card-content {
  flex: 1;
  padding: var(--card-padding);
}

.card-footer {
  padding: var(--card-padding);
  border-top: var(--card-footer-border, 1px solid rgba(0, 0, 0, 0.06));
}

.card-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color, #2196f3);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Style Variants */

/* Modern Style */
.base-card--modern {
  --card-background: #ffffff;
  --card-border-radius: 12px;
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --card-shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.12);
  --card-header-border: 1px solid #f0f0f0;
  --card-footer-border: 1px solid #f0f0f0;
}

.base-card--modern.base-card--gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Cyberpunk Style */
.base-card--cyberpunk {
  --card-background: rgba(0, 0, 0, 0.85);
  --card-border: 1px solid #00ffff;
  --card-border-radius: 4px;
  --card-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  --card-shadow-hover: 0 0 30px rgba(0, 255, 255, 0.5);
  --card-header-border: 1px solid #00ffff;
  --card-footer-border: 1px solid #00ffff;
  color: #00ffff;
  position: relative;
}

.base-card--cyberpunk::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(0, 255, 255, 0.1) 50%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.base-card--cyberpunk:hover::before {
  opacity: 1;
}

/* Glassmorphism Style */
.base-card--glassmorphism {
  --card-background: rgba(255, 255, 255, 0.1);
  --card-border: 1px solid rgba(255, 255, 255, 0.2);
  --card-border-radius: 16px;
  --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  --card-shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(20px) saturate(180%);
  color: rgba(0, 0, 0, 0.8);
}

/* Neumorphism Style */
.base-card--neumorphism {
  --card-background: #e6e6e6;
  --card-border-radius: 20px;
  --card-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;
  --card-shadow-hover: 25px 25px 75px #bebebe, -25px -25px 75px #ffffff;
  border: none;
}

.base-card--neumorphism.base-card--selected {
  box-shadow: inset 20px 20px 60px #bebebe, inset -20px -20px 60px #ffffff;
}

/* Minimalist Style */
.base-card--minimalist {
  --card-background: #ffffff;
  --card-border: 1px solid #e0e0e0;
  --card-border-radius: 0;
  --card-shadow: none;
  --card-shadow-hover: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Stylish Style */
.base-card--stylish {
  --card-background: #ffffff;
  --card-border-radius: 24px;
  --card-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
  --card-shadow-hover: 0 12px 50px rgba(0, 0, 0, 0.1);
  border: none;
}

/* Retro Style */
.base-card--retro {
  --card-background: linear-gradient(145deg, #2a0845, #1a0330);
  --card-border: 2px solid #ff006e;
  --card-border-radius: 8px;
  --card-shadow: 0 0 30px rgba(255, 0, 110, 0.3);
  --card-shadow-hover: 0 0 40px rgba(255, 0, 110, 0.5);
  color: #ffffff;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .base-card--modern {
    --card-background: #1e1e1e;
    --card-header-border: 1px solid #333;
    --card-footer-border: 1px solid #333;
    color: #ffffff;
  }

  .base-card--minimalist {
    --card-background: #1e1e1e;
    --card-border: 1px solid #333;
    color: #ffffff;
  }

  .base-card--stylish {
    --card-background: #1e1e1e;
    color: #ffffff;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .base-card {
    --card-padding: 0.75rem;
  }

  .base-card--neumorphism {
    --card-shadow: 10px 10px 30px #bebebe, -10px -10px 30px #ffffff;
    --card-shadow-hover: 15px 15px 40px #bebebe, -15px -15px 40px #ffffff;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .base-card {
    border: 2px solid currentColor;
  }

  .base-card--glassmorphism {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: none;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-card {
    transition: none;
  }

  .base-card--cyberpunk::before {
    display: none;
  }

  .loading-spinner {
    animation: none;
  }
}
</style>