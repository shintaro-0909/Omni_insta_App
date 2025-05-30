<template>
  <nav class="demo-nav" :class="{ 'nav-elevated': scrolled }">
    <div class="nav-container">
      <div class="nav-brand" @click="scrollToTop">
        <slot name="brand">
          <div class="brand-icon">
            <v-icon icon="mdi-instagram" size="32" />
          </div>
          <span class="brand-text">{{ brandText }}</span>
        </slot>
      </div>
      
      <div class="nav-menu">
        <a 
          v-for="item in menuItems"
          :key="item.href"
          :href="item.href"
          class="nav-item"
          @click="smoothScroll"
        >
          {{ item.text }}
        </a>
        
        <button class="nav-cta" @click="$emit('cta-click')">
          {{ ctaText }}
        </button>
      </div>
      
      <!-- モバイルメニュー -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <v-icon :icon="mobileMenuOpen ? 'mdi-close' : 'mdi-menu'" />
      </button>
    </div>
    
    <!-- モバイルメニュー -->
    <div class="mobile-menu" :class="{ 'open': mobileMenuOpen }">
      <a 
        v-for="item in menuItems"
        :key="item.href"
        :href="item.href"
        class="mobile-nav-item"
        @click="closeMobileMenu"
      >
        {{ item.text }}
      </a>
      <button class="mobile-cta" @click="$emit('cta-click')">
        {{ ctaText }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface MenuItem {
  text: string
  href: string
}

interface Props {
  brandText?: string
  menuItems?: MenuItem[]
  ctaText?: string
}

withDefaults(defineProps<Props>(), {
  brandText: 'Omniy',
  menuItems: () => [
    { text: 'Features', href: '#features' },
    { text: 'Pricing', href: '#pricing' },
    { text: 'About', href: '#about' }
  ],
  ctaText: 'Get Started'
})

defineEmits<{
  'cta-click': []
}>()

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const smoothScroll = (event: MouseEvent) => {
  event.preventDefault()
  const target = event.currentTarget as HTMLAnchorElement
  const href = target.getAttribute('href')
  if (href) {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
  closeMobileMenu()
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.demo-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1.5rem 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-elevated {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-brand:hover {
  transform: scale(1.05);
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-item {
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.nav-cta {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-menu.open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.mobile-nav-item {
  display: block;
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
  transition: color 0.3s ease;
}

.mobile-nav-item:hover {
  color: #667eea;
}

.mobile-cta {
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 2rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
}
</style>