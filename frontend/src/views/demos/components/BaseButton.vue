<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :style="buttonStyles"
    :disabled="disabled || loading"
    :type="type"
    :tabindex="disabled ? -1 : 0"
    :role="role"
    :aria-label="ariaLabel"
    :aria-pressed="pressed"
    :aria-expanded="expanded"
    v-bind="$attrs"
    @click="handleClick"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
  >
    <!-- Loading Spinner -->
    <div v-if="loading" class="btn-loading">
      <div class="loading-spinner"></div>
    </div>

    <!-- Icon Start -->
    <span v-if="$slots.prepend || prependIcon" class="btn-prepend">
      <slot name="prepend">
        <i v-if="prependIcon" :class="prependIcon"></i>
      </slot>
    </span>

    <!-- Content -->
    <span class="btn-content" :class="{ 'btn-content--hidden': loading }">
      <slot></slot>
    </span>

    <!-- Icon End -->
    <span v-if="$slots.append || appendIcon" class="btn-append">
      <slot name="append">
        <i v-if="appendIcon" :class="appendIcon"></i>
      </slot>
    </span>

    <!-- Ripple Effect -->
    <span v-if="ripple && !disabled" class="btn-ripple" ref="rippleRef"></span>
  </component>
</template>

<script setup lang="ts">
  import { computed, ref, type PropType } from 'vue';

  export interface ButtonVariant {
    modern?: boolean;
    cyberpunk?: boolean;
    glassmorphism?: boolean;
    neumorphism?: boolean;
    minimalist?: boolean;
    stylish?: boolean;
    retro?: boolean;
  }

  const props = defineProps({
    // Basic props
    tag: {
      type: String,
      default: 'button',
    },
    type: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button',
    },
    variant: {
      type: String as PropType<keyof ButtonVariant>,
      default: 'modern',
    },

    // Size and style
    size: {
      type: String as PropType<'xs' | 'sm' | 'md' | 'lg' | 'xl'>,
      default: 'md',
    },
    color: {
      type: String as PropType<
        'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
      >,
      default: 'primary',
    },
    style: {
      type: String as PropType<
        'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'
      >,
      default: 'filled',
    },

    // Visual features
    rounded: {
      type: [Boolean, String],
      default: true,
    },
    block: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: Boolean,
      default: false,
    },
    fab: {
      type: Boolean,
      default: false,
    },

    // Icons
    prependIcon: {
      type: String,
      default: '',
    },
    appendIcon: {
      type: String,
      default: '',
    },

    // States
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },

    // Interactive
    ripple: {
      type: Boolean,
      default: true,
    },

    // Accessibility
    role: {
      type: String,
      default: 'button',
    },
    ariaLabel: {
      type: String,
      default: '',
    },
    pressed: {
      type: Boolean,
      default: undefined,
    },
    expanded: {
      type: Boolean,
      default: undefined,
    },
  });

  const emit = defineEmits(['click', 'focus', 'blur']);

  const rippleRef = ref<HTMLElement>();

  const buttonClasses = computed(() => {
    return [
      'base-btn',
      `base-btn--${props.variant}`,
      `base-btn--${props.size}`,
      `base-btn--${props.color}`,
      `base-btn--${props.style}`,
      {
        'base-btn--block': props.block,
        'base-btn--icon': props.icon,
        'base-btn--fab': props.fab,
        'base-btn--disabled': props.disabled,
        'base-btn--loading': props.loading,
        'base-btn--active': props.active,
        'base-btn--rounded': props.rounded,
      },
    ];
  });

  const buttonStyles = computed(() => {
    const styles: Record<string, string> = {};
    return styles;
  });

  const handleClick = (event: MouseEvent) => {
    if (props.disabled || props.loading) return;

    // Create ripple effect
    if (props.ripple && rippleRef.value) {
      createRipple(event);
    }

    emit('click', event);
  };

  const createRipple = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-circle';
    ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
  `;

    if (rippleRef.value) {
      rippleRef.value.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    }
  };
</script>

<style scoped>
  /* Base Button Styles */
  .base-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: var(--btn-padding, 0.75rem 1.5rem);
    border: var(--btn-border, none);
    border-radius: var(--btn-border-radius, 8px);
    background: var(--btn-background, #2196f3);
    color: var(--btn-color, #ffffff);
    font-family: inherit;
    font-size: var(--btn-font-size, 0.875rem);
    font-weight: var(--btn-font-weight, 500);
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    outline: none;
    white-space: nowrap;
  }

  .base-btn:focus-visible {
    box-shadow: 0 0 0 2px var(--btn-focus-color, rgba(33, 150, 243, 0.5));
  }

  .base-btn:hover:not(.base-btn--disabled):not(.base-btn--loading) {
    background: var(--btn-background-hover);
    transform: var(--btn-transform-hover, translateY(-1px));
  }

  .base-btn:active:not(.base-btn--disabled):not(.base-btn--loading) {
    transform: var(--btn-transform-active, translateY(0));
  }

  /* Size Variants */
  .base-btn--xs {
    --btn-padding: 0.375rem 0.75rem;
    --btn-font-size: 0.75rem;
    --btn-border-radius: 4px;
  }

  .base-btn--sm {
    --btn-padding: 0.5rem 1rem;
    --btn-font-size: 0.8125rem;
    --btn-border-radius: 6px;
  }

  .base-btn--md {
    --btn-padding: 0.75rem 1.5rem;
    --btn-font-size: 0.875rem;
    --btn-border-radius: 8px;
  }

  .base-btn--lg {
    --btn-padding: 1rem 2rem;
    --btn-font-size: 1rem;
    --btn-border-radius: 10px;
  }

  .base-btn--xl {
    --btn-padding: 1.25rem 2.5rem;
    --btn-font-size: 1.125rem;
    --btn-border-radius: 12px;
  }

  /* Block Button */
  .base-btn--block {
    width: 100%;
  }

  /* Icon Button */
  .base-btn--icon {
    --btn-padding: 0.75rem;
    min-width: auto;
    aspect-ratio: 1;
  }

  .base-btn--icon.base-btn--xs {
    --btn-padding: 0.375rem;
  }
  .base-btn--icon.base-btn--sm {
    --btn-padding: 0.5rem;
  }
  .base-btn--icon.base-btn--md {
    --btn-padding: 0.75rem;
  }
  .base-btn--icon.base-btn--lg {
    --btn-padding: 1rem;
  }
  .base-btn--icon.base-btn--xl {
    --btn-padding: 1.25rem;
  }

  /* FAB Button */
  .base-btn--fab {
    --btn-border-radius: 50%;
    --btn-padding: 1rem;
    width: 56px;
    height: 56px;
  }

  /* Disabled State */
  .base-btn--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Loading State */
  .base-btn--loading {
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Content */
  .btn-content {
    transition: opacity 0.2s ease;
  }

  .btn-content--hidden {
    opacity: 0;
  }

  .btn-prepend,
  .btn-append {
    display: flex;
    align-items: center;
  }

  /* Loading Spinner */
  .btn-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .loading-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  /* Ripple Effect */
  .btn-ripple {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }

  .ripple-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple 0.6s ease-out;
  }

  /* Color Variants */
  .base-btn--primary {
    --btn-background: #2196f3;
    --btn-background-hover: #1976d2;
    --btn-color: #ffffff;
  }

  .base-btn--secondary {
    --btn-background: #6c757d;
    --btn-background-hover: #5a6268;
    --btn-color: #ffffff;
  }

  .base-btn--success {
    --btn-background: #4caf50;
    --btn-background-hover: #45a049;
    --btn-color: #ffffff;
  }

  .base-btn--warning {
    --btn-background: #ff9800;
    --btn-background-hover: #f57c00;
    --btn-color: #ffffff;
  }

  .base-btn--error {
    --btn-background: #f44336;
    --btn-background-hover: #d32f2f;
    --btn-color: #ffffff;
  }

  .base-btn--info {
    --btn-background: #00bcd4;
    --btn-background-hover: #0097a7;
    --btn-color: #ffffff;
  }

  /* Style Variants */
  .base-btn--outlined {
    --btn-background: transparent;
    --btn-border: 2px solid currentColor;
    --btn-color: var(--btn-outline-color, #2196f3);
  }

  .base-btn--outlined:hover:not(.base-btn--disabled) {
    --btn-background: var(--btn-outline-color, #2196f3);
    --btn-color: #ffffff;
  }

  .base-btn--text {
    --btn-background: transparent;
    --btn-color: var(--btn-text-color, #2196f3);
    --btn-padding: 0.75rem 1rem;
  }

  .base-btn--text:hover:not(.base-btn--disabled) {
    --btn-background: rgba(33, 150, 243, 0.1);
  }

  .base-btn--tonal {
    --btn-background: rgba(33, 150, 243, 0.12);
    --btn-color: var(--btn-tonal-color, #2196f3);
  }

  .base-btn--tonal:hover:not(.base-btn--disabled) {
    --btn-background: rgba(33, 150, 243, 0.2);
  }

  /* Theme Variants */

  /* Modern Style */
  .base-btn--modern {
    --btn-border-radius: 8px;
    --btn-font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .base-btn--modern:hover:not(.base-btn--disabled) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Cyberpunk Style */
  .base-btn--cyberpunk {
    --btn-background: transparent;
    --btn-border: 2px solid #00ffff;
    --btn-color: #00ffff;
    --btn-border-radius: 0;
    --btn-font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
  }

  .base-btn--cyberpunk::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
  }

  .base-btn--cyberpunk:hover::before {
    left: 100%;
  }

  .base-btn--cyberpunk:hover:not(.base-btn--disabled) {
    --btn-background: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  }

  /* Glassmorphism Style */
  .base-btn--glassmorphism {
    --btn-background: rgba(255, 255, 255, 0.2);
    --btn-border: 1px solid rgba(255, 255, 255, 0.3);
    --btn-color: rgba(0, 0, 0, 0.8);
    --btn-border-radius: 12px;
    backdrop-filter: blur(10px) saturate(180%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .base-btn--glassmorphism:hover:not(.base-btn--disabled) {
    --btn-background: rgba(255, 255, 255, 0.3);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  /* Neumorphism Style */
  .base-btn--neumorphism {
    --btn-background: #e6e6e6;
    --btn-color: #333;
    --btn-border-radius: 20px;
    --btn-border: none;
    box-shadow:
      8px 8px 16px #bebebe,
      -8px -8px 16px #ffffff;
  }

  .base-btn--neumorphism:hover:not(.base-btn--disabled) {
    box-shadow:
      12px 12px 24px #bebebe,
      -12px -12px 24px #ffffff;
  }

  .base-btn--neumorphism:active:not(.base-btn--disabled) {
    box-shadow:
      inset 8px 8px 16px #bebebe,
      inset -8px -8px 16px #ffffff;
  }

  /* Minimalist Style */
  .base-btn--minimalist {
    --btn-background: #ffffff;
    --btn-border: 1px solid #e0e0e0;
    --btn-color: #333;
    --btn-border-radius: 0;
    box-shadow: none;
  }

  .base-btn--minimalist:hover:not(.base-btn--disabled) {
    --btn-background: #f5f5f5;
    --btn-border: 1px solid #ccc;
  }

  /* Stylish Style */
  .base-btn--stylish {
    --btn-border-radius: 24px;
    --btn-font-weight: 600;
    background: linear-gradient(
      135deg,
      var(--btn-gradient-start, #667eea) 0%,
      var(--btn-gradient-end, #764ba2) 100%
    );
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  }

  .base-btn--stylish:hover:not(.base-btn--disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  /* Retro Style */
  .base-btn--retro {
    --btn-background: linear-gradient(145deg, #ff006e, #8338ec);
    --btn-border: 2px solid #ff006e;
    --btn-color: #ffffff;
    --btn-border-radius: 0;
    --btn-font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    position: relative;
    overflow: hidden;
  }

  .base-btn--retro::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  .base-btn--retro:hover::before {
    transform: translateX(100%);
  }

  /* Animations */
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* Dark Mode Support */
  @media (prefers-color-scheme: dark) {
    .base-btn--minimalist {
      --btn-background: #1e1e1e;
      --btn-border: 1px solid #333;
      --btn-color: #ffffff;
    }

    .base-btn--glassmorphism {
      --btn-background: rgba(0, 0, 0, 0.2);
      --btn-border: 1px solid rgba(255, 255, 255, 0.1);
      --btn-color: rgba(255, 255, 255, 0.9);
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .base-btn {
      border: 2px solid currentColor;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .base-btn {
      transition: none;
    }

    .base-btn--cyberpunk::before,
    .base-btn--retro::before {
      display: none;
    }

    .loading-spinner {
      animation: none;
    }

    .ripple-circle {
      animation: none;
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .base-btn {
      --btn-padding: 0.5rem 1rem;
      --btn-font-size: 0.8125rem;
    }

    .base-btn--fab {
      width: 48px;
      height: 48px;
      --btn-padding: 0.75rem;
    }
  }
</style>
