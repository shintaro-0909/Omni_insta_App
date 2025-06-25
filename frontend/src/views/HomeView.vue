<template>
  <div class="content-wrapper">
    <div class="omniy-landing-page">
      <!-- ナビゲーション -->
      <UnifiedNavigation />

      <!-- ヒーローセクション -->
      <section class="hero">
        <div class="floating-elements">
          <div class="floating-circle circle-1"></div>
          <div class="floating-circle circle-2"></div>
          <div class="floating-circle circle-3"></div>
        </div>

        <div class="hero-container">
          <div class="hero-content">
            <h1>
              Instagram予約投稿を<br>
              <span class="gradient-text">もっとスマートに</span>
            </h1>
            <p class="hero-description">
              AIが最適な投稿時間を提案。繰り返し投稿やランダム投稿で、<br>
              フォロワーとのエンゲージメントを最大化します。
            </p>
            <div class="hero-actions">
              <router-link :to="authStore.isAuthenticated ? '/dashboard' : '/login'" class="cta-button primary">
                {{ authStore.isAuthenticated ? 'ダッシュボードへ' : '14日間無料で試す' }}
              </router-link>
              <router-link to="/demo" class="secondary-button">デモを見る</router-link>
            </div>
            
            <!-- 新しい統計セクション -->
            <div class="hero-stats">
              <div class="stat-item">
                <div class="stat-icon-wrapper">
                  <div class="stat-icon" style="background: var(--primary-gradient)">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="stat-content">
                  <div class="stat-number">14日間</div>
                  <div class="stat-label">無料トライアル</div>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-icon-wrapper">
                  <div class="stat-icon" style="background: var(--secondary-gradient)">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </div>
                </div>
                <div class="stat-content">
                  <div class="stat-number">AI技術</div>
                  <div class="stat-label">最適化自動投稿</div>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-icon-wrapper">
                  <div class="stat-icon" style="background: var(--accent-gradient)">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
                    </svg>
                  </div>
                </div>
                <div class="stat-content">
                  <div class="stat-number">安心</div>
                  <div class="stat-label">公式API対応</div>
                </div>
              </div>
            </div>
          </div>

          <div class="hero-visual">
            <div class="phone-mockup">
              <div class="phone-screen">
                <!-- Omniyアプリのメイン画面 -->
                <div class="omniy-app-header">
                  <div class="app-logo">
                    <div class="logo-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <span class="logo-text">Omniy</span>
                  </div>
                  <div class="notification-badge">3</div>
                </div>
                
                <!-- スケジュール管理画面 -->
                <div class="app-content">
                  <div class="page-title">
                    <h3>今日の投稿予定</h3>
                    <div class="date-indicator">1月15日（水）</div>
                  </div>
                  
                  <!-- 投稿スケジュールカード -->
                  <div class="schedule-cards">
                    <div class="schedule-card active">
                      <div class="card-header">
                        <div class="time-badge">18:00</div>
                        <div class="status-dot scheduled"></div>
                      </div>
                      <div class="card-content">
                        <div class="post-preview">
                          <div class="preview-image"></div>
                          <div class="post-info">
                            <div class="account-name">@fashion_store</div>
                            <div class="post-caption">新作コレクション発表</div>
                          </div>
                        </div>
                        <div class="card-actions">
                          <button class="action-btn edit">編集</button>
                          <button class="action-btn delete">削除</button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="schedule-card">
                      <div class="card-header">
                        <div class="time-badge">20:30</div>
                        <div class="status-dot pending"></div>
                      </div>
                      <div class="card-content">
                        <div class="post-preview">
                          <div class="preview-image secondary"></div>
                          <div class="post-info">
                            <div class="account-name">@lifestyle_blog</div>
                            <div class="post-caption">今日のコーディネート...</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 新規投稿ボタン -->
                  <div class="floating-add-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                  
                  <!-- 統計セクション -->
                  <div class="stats-section">
                    <div class="stat-item">
                      <div class="stat-number">12</div>
                      <div class="stat-label">今月の投稿</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">3</div>
                      <div class="stat-label">アカウント</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">98%</div>
                      <div class="stat-label">成功率</div>
                    </div>
                  </div>
                </div>
                
                <!-- 下部ナビゲーション -->
                <div class="bottom-navigation">
                  <div class="nav-item active">
                    <div class="nav-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div class="nav-label">スケジュール</div>
                  </div>
                  <div class="nav-item">
                    <div class="nav-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="9" cy="9" r="2"></circle>
                        <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                      </svg>
                    </div>
                    <div class="nav-label">コンテンツ</div>
                  </div>
                  <div class="nav-item">
                    <div class="nav-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div class="nav-label">アカウント</div>
                  </div>
                  <div class="nav-item">
                    <div class="nav-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>
                    <div class="nav-label">分析</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ソーシャルプルーフ -->
      <section class="social-proof">
        <div class="ticker-wrapper">
          <div class="ticker-item" v-for="activity in realTimeActivities" :key="activity.id">
            <div class="ticker-avatar">
              <img :src="activity.avatar" :alt="`Avatar for ${activity.category}`" />
              <div class="activity-indicator" :class="activity.category"></div>
            </div>
            <span class="ticker-text">{{ activity.text }}</span>
          </div>
          <!-- 繰り返し用 -->
          <div class="ticker-item" v-for="activity in realTimeActivities" :key="`repeat-${activity.id}`">
            <div class="ticker-avatar">
              <img :src="activity.avatar" :alt="`Avatar for ${activity.category}`" />
              <div class="activity-indicator" :class="activity.category"></div>
            </div>
            <span class="ticker-text">{{ activity.text }}</span>
          </div>
        </div>
      </section>

      <!-- 機能セクション -->
      <section class="features" id="features">
        <div class="section-header">
          <h2 class="section-title">なぜOmniyが選ばれるのか？</h2>
          <p class="section-description">
            Instagram運用の手間を最小限に、効果を最大限に。<br>
            AIとスマートな自動化機能があなたの投稿をサポートします。
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
            <div class="feature-benefits">
              <span class="benefit-chip" v-for="benefit in feature.benefits" :key="benefit">
                {{ benefit }}
              </span>
            </div>
          </div>
        </div>

        <!-- PC ダッシュボードモックアップ -->
        <div class="dashboard-preview">
          <div class="dashboard-container">
            <div class="dashboard-header">
              <h3>📊 管理画面プレビュー</h3>
              <p>すべての投稿を一元管理。直感的な操作で効率的に運用できます。</p>
            </div>
            <div class="dashboard-mockup">
              <div class="mockup-sidebar">
                <div class="sidebar-logo">Omniy</div>
                <div class="sidebar-nav">
                  <div class="nav-item active">📅 スケジュール</div>
                  <div class="nav-item">📸 コンテンツ</div>
                  <div class="nav-item">👥 アカウント</div>
                  <div class="nav-item">📊 分析</div>
                </div>
              </div>
              <div class="mockup-main">
                <div class="mockup-header">
                  <div class="header-title">今日の投稿予定</div>
                  <div class="header-actions">
                    <div class="action-btn">+ 新規作成</div>
                  </div>
                </div>
                <div class="schedule-grid">
                  <div class="schedule-card" v-for="i in 6" :key="i">
                    <div class="schedule-time">{{ getScheduleTime(i) }}</div>
                    <div class="schedule-preview"></div>
                    <div class="schedule-account">@account_{{ i }}</div>
                    <div class="schedule-status" :class="getScheduleStatus(i)">{{ getScheduleStatusText(i) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3ステップセクション -->
      <section class="steps-section">
        <div class="section-header">
          <h2 class="section-title">たった3ステップで開始</h2>
          <p class="section-description">
            アカウント作成から投稿開始まで、わずか5分で完了します。
          </p>
        </div>

        <div class="steps-container">
          <div class="step-item" v-for="(step, index) in steps" :key="step.title">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="step-icon">{{ step.icon }}</div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
            </div>
            <div v-if="index < steps.length - 1" class="step-arrow">→</div>
          </div>
        </div>

        <div class="steps-cta">
          <router-link :to="authStore.isAuthenticated ? '/dashboard' : '/login'" class="cta-button primary large">
            {{ authStore.isAuthenticated ? 'ダッシュボードを開く' : '今すぐ無料で始める' }}
          </router-link>
        </div>
      </section>

      <!-- 料金セクション -->
      <section class="pricing" id="pricing">
        <div class="section-header">
          <h2 class="section-title">シンプルで透明な料金プラン</h2>
          <p class="section-description">
            あなたのニーズに合わせた柔軟なプランをご用意。<br>
            いつでもアップグレード・ダウングレードが可能です。
          </p>
        </div>

        <div class="pricing-grid">
          <div class="pricing-card" :class="{ popular: plan.popular }" v-for="plan in pricingPlans" :key="plan.name">
            <span v-if="plan.popular" class="popular-badge">人気No.1</span>
            <h3 class="plan-name">{{ plan.name }}</h3>
            <div class="plan-price">
              ¥{{ plan.price.toLocaleString() }}<small>/月</small>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
              {{ plan.description }}
            </p>
            <ul class="plan-features">
              <li v-for="feature in plan.features" :key="feature">
                <span class="check-icon">✓</span> {{ feature }}
              </li>
            </ul>
            <router-link :to="plan.price === 0 ? '/login' : (authStore.isAuthenticated ? '/billing' : '/login')"
              :class="plan.popular ? 'cta-button' : 'secondary-button'"
              style="display: block; text-align: center; text-decoration: none;">
              {{ plan.buttonText }}
            </router-link>
          </div>
        </div>

        <div class="pricing-guarantee">
          <div class="guarantee-content">
            <div class="guarantee-icon">🔒</div>
            <div>
              <h4>安心の返金保証</h4>
              <p>14日間の返金保証付き。安心してお試しいただけます。</p>
            </div>
          </div>
          <div class="guarantee-content">
            <div class="guarantee-icon">💳</div>
            <div>
              <h4>クレジットカード不要</h4>
              <p>無料プランはクレジットカード登録なしで今すぐ開始できます。</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQセクション -->
      <section class="faq-section" id="faq">
        <div class="section-header">
          <h2 class="section-title">よくあるご質問</h2>
          <p class="section-description">
            Omniyについて、お客様からよく寄せられる質問にお答えします。
          </p>
        </div>

        <div class="faq-container">
          <div class="faq-item" v-for="(faq, index) in faqs" :key="faq.question" 
               :class="{ active: activeFaq === index }"
               @click="toggleFaq(index)">
            <div class="faq-question">
              <span>{{ faq.question }}</span>
              <span class="faq-toggle">{{ activeFaq === index ? '−' : '+' }}</span>
            </div>
            <div class="faq-answer" v-if="activeFaq === index">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- フッター -->
      <footer>
        <div class="footer-content">
          <div class="logo" style="margin-bottom: 2rem;">Omniy</div>
          <p style="opacity: 0.8;">
            © 2025 Omniy. All rights reserved.<br>
            Instagram予約投稿を、もっとスマートに。
          </p>
          <div class="footer-links">
            <router-link to="/" class="footer-link">ホーム</router-link>
            <router-link to="/demo" class="footer-link">デモ体験</router-link>
            <a href="#features" class="footer-link">機能</a>
            <a href="#pricing" class="footer-link">料金</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores'
import { UnifiedNavigation } from '@/components'
import { ref } from 'vue'

const authStore = useAuthStore()

// リアルタイム活動データ
const realTimeActivities = ref([
  { id: 1, text: '@fashion_maya さんが10分前に投稿を予約しました', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c1b2?w=60&h=60&fit=crop&crop=face', category: 'fashion' },
  { id: 2, text: '@cafe_tokyo さんが新規登録しました', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face', category: 'food' },
  { id: 3, text: '@beauty_salon さんの投稿が完了しました', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face', category: 'beauty' },
  { id: 4, text: '@shop_online さんが繰り返し投稿を設定しました', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face', category: 'business' },
  { id: 5, text: '@fitness_gym さんがワークアウト動画を投稿予約', avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop&crop=face', category: 'fitness' },
  { id: 6, text: '@travel_blog さんが海外旅行の投稿をスケジュール', avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=60&h=60&fit=crop&crop=face', category: 'travel' },
  { id: 7, text: '@food_lover さんがレシピ投稿を自動化設定', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=60&h=60&fit=crop&crop=face', category: 'food' },
  { id: 8, text: '@art_studio さんが作品展示の投稿を準備', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop&crop=face', category: 'art' },
  { id: 9, text: '@pet_care さんが可愛いペット動画を予約投稿', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=60&h=60&fit=crop&crop=face', category: 'pets' },
  { id: 10, text: '@music_band さんが新曲プロモを自動投稿設定', avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=60&h=60&fit=crop&crop=face', category: 'music' },
  { id: 11, text: '@tech_startup さんがプロダクト紹介を予約', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=60&h=60&fit=crop&crop=face', category: 'tech' },
  { id: 12, text: '@home_decor さんがインテリア投稿を自動化', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&crop=face', category: 'lifestyle' },
  { id: 13, text: '@yoga_studio さんが朝のヨガクラスを投稿予約', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=60&h=60&fit=crop&crop=face', category: 'wellness' },
  { id: 14, text: '@car_dealer さんが新車展示の投稿をスケジュール', avatar: 'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=60&h=60&fit=crop&crop=face', category: 'automotive' },
  { id: 15, text: '@book_store さんが読書レビューを自動投稿設定', avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=60&h=60&fit=crop&crop=face', category: 'books' },
  { id: 16, text: '@garden_life さんがガーデニング tips を予約', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=face', category: 'gardening' },
  { id: 17, text: '@photography さんが作品ポートフォリオを投稿予約', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face', category: 'photography' },
  { id: 18, text: '@bakery_sweet さんが季節限定ケーキを宣伝予約', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=60&h=60&fit=crop&crop=face', category: 'bakery' },
  { id: 19, text: '@real_estate さんが物件紹介を定期投稿設定', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop&crop=face', category: 'realestate' },
  { id: 20, text: '@jewelry_shop さんが新作アクセサリーを予約投稿', avatar: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=60&h=60&fit=crop&crop=face', category: 'jewelry' },
  { id: 21, text: '@wedding_plan さんが結婚式プランを自動宣伝', avatar: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=60&h=60&fit=crop&crop=face', category: 'wedding' },
  { id: 22, text: '@sports_club さんがトレーニング動画を毎日投稿設定', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop&crop=face', category: 'sports' },
  { id: 23, text: '@nail_salon さんがネイルアート作品を予約投稿', avatar: 'https://images.unsplash.com/photo-1559163499-413811fb2344?w=60&h=60&fit=crop&crop=face', category: 'nails' },
  { id: 24, text: '@language_school さんが学習 tips を自動配信', avatar: 'https://images.unsplash.com/photo-1507152492071-3db521b30d54?w=60&h=60&fit=crop&crop=face', category: 'education' },
  { id: 25, text: '@handmade_craft さんがDIY tutorial を予約投稿', avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=60&h=60&fit=crop&crop=face', category: 'craft' },
  { id: 26, text: '@wine_bar さんがワインペアリング情報を自動投稿', avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=60&h=60&fit=crop&crop=face', category: 'wine' },
  { id: 27, text: '@dance_studio さんがダンスレッスン動画を予約', avatar: 'https://images.unsplash.com/photo-1568038479111-87bf80659645?w=60&h=60&fit=crop&crop=face', category: 'dance' },
  { id: 28, text: '@baby_goods さんがベビー用品の紹介を自動化', avatar: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=60&h=60&fit=crop&crop=face', category: 'baby' },
  { id: 29, text: '@outdoor_gear さんがキャンプ用品レビューを予約', avatar: 'https://images.unsplash.com/photo-1521341957697-b93449760f30?w=60&h=60&fit=crop&crop=face', category: 'outdoor' },
  { id: 30, text: '@senior_care さんが健康管理 tips を定期投稿設定', avatar: 'https://images.unsplash.com/photo-1559570815-91ad8b473313?w=60&h=60&fit=crop&crop=face', category: 'healthcare' },
  { id: 31, text: '@game_dev さんが新作ゲーム情報を予約投稿', avatar: 'https://images.unsplash.com/photo-1541647376583-8934aaf3448a?w=60&h=60&fit=crop&crop=face', category: 'gaming' },
  { id: 32, text: '@eco_living さんがサステナブル生活 tips を自動配信', avatar: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=60&h=60&fit=crop&crop=face', category: 'eco' },
  { id: 33, text: '@skincare_expert さんがスキンケア routine を予約投稿', avatar: 'https://images.unsplash.com/photo-1572298254570-ab681ad4cca3?w=60&h=60&fit=crop&crop=face', category: 'skincare' },
  { id: 34, text: '@coffee_roaster さんがコーヒー豆情報を毎朝自動投稿', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face', category: 'coffee' },
  { id: 35, text: '@fashion_designer さんが最新トレンドを定期発信設定', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=face', category: 'fashion' }
])

// 機能データ
const features = ref([
  {
    title: 'スマート予約投稿',
    icon: '📅',
    description: '日時指定はもちろん、曜日×時刻の繰り返し投稿やランダム投稿も可能。AIが最適な投稿時間を提案します。',
    benefits: ['自動投稿', '繰り返し設定', 'AI最適化']
  },
  {
    title: 'マルチアカウント管理',
    icon: '👥',
    description: '複数のInstagramアカウントを一元管理。アカウントごとに異なる投稿戦略を簡単に実行できます。',
    benefits: ['一括管理', '切り替え簡単', 'グループ機能']
  },
  {
    title: '詳細な分析機能',
    icon: '📊',
    description: '投稿のパフォーマンスをリアルタイムで追跡。エンゲージメント率の高い時間帯や内容を分析します。',
    benefits: ['リアルタイム', '詳細レポート', '改善提案']
  },
  {
    title: '安全性最優先',
    icon: '🔒',
    description: 'Instagram公式APIを使用し、アカウントの安全性を確保。プロキシ設定でさらに安心して運用できます。',
    benefits: ['公式API', 'セキュア', '24/7監視']
  },
  {
    title: 'コンテンツライブラリ',
    icon: '🎨',
    description: '投稿コンテンツを事前に作成・保存。タグ管理で簡単に整理し、いつでも再利用できます。',
    benefits: ['一括作成', 'タグ管理', '再利用可能']
  },
  {
    title: 'スマート通知',
    icon: '🔔',
    description: '投稿の成功・失敗をリアルタイムで通知。重要なイベントを見逃しません。',
    benefits: ['リアルタイム', 'カスタマイズ', '複数チャンネル']
  }
])

// 3ステップデータ
const steps = ref([
  {
    title: 'アカウント作成',
    icon: '👤',
    description: 'Googleアカウントで簡単に登録。クレジットカード不要で今すぐ開始できます。'
  },
  {
    title: 'Instagram連携',
    icon: '🔗',
    description: 'Instagram公式APIで安全に連携。アカウント情報は暗号化されて保護されます。'
  },
  {
    title: '投稿予約開始',
    icon: '🚀',
    description: 'コンテンツをアップロードして投稿日時を設定。あとは自動で投稿されます。'
  }
])

// FAQ データ
const faqs = ref([
  {
    question: 'Instagramアカウントの安全性は大丈夫ですか？',
    answer: 'はい、完全に安全です。Omniyは Instagram 公式API のみを使用し、お客様のログイン情報は保存されません。Meta（Facebook）が認定したパートナーとして運営しています。'
  },
  {
    question: '無料プランでどこまで使えますか？',
    answer: '無料プランでは月10投稿まで、1つのInstagramアカウントで基本的な予約投稿機能をお使いいただけます。クレジットカード登録は不要です。'
  },
  {
    question: 'プランの変更はいつでもできますか？',
    answer: 'はい、いつでも可能です。アップグレードは即座に反映され、ダウングレードは次回請求日から適用されます。日割り計算で差額を調整いたします。'
  },
  {
    question: '投稿が失敗した場合はどうなりますか？',
    answer: '投稿失敗時は自動で3回までリトライします。それでも失敗する場合は、メールとアプリ内通知でお知らせし、手動で再投稿していただけます。'
  },
  {
    question: '返金保証の条件を教えてください',
    answer: '有料プランご利用開始から14日以内であれば、理由を問わず全額返金いたします。カスタマーサポートまでご連絡ください。'
  },
  {
    question: 'スマートフォンでも使えますか？',
    answer: 'はい、Omniyはレスポンシブデザインでスマートフォン・タブレットに完全対応しています。外出先でも投稿の管理や編集が可能です。'
  }
])

// FAQ表示状態
const activeFaq = ref<number | null>(null)

const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

// ダッシュボードモックアップ用の関数
const getScheduleTime = (index: number) => {
  const times = ['09:00', '12:00', '15:00', '18:00', '20:00', '22:00']
  return times[index - 1] || '09:00'
}

const getScheduleStatus = (index: number) => {
  const statuses = ['completed', 'scheduled', 'scheduled', 'pending', 'scheduled', 'scheduled']
  return statuses[index - 1] || 'scheduled'
}

const getScheduleStatusText = (index: number) => {
  const texts = ['完了', '予約中', '予約中', '待機中', '予約中', '予約中']
  return texts[index - 1] || '予約中'
}

// 料金プランデータ
const pricingPlans = ref([
  {
    name: 'Free',
    price: 0,
    description: '個人利用に最適',
    popular: false,
    buttonText: '無料で始める',
    features: [
      'IGアカウント 1個',
      '月10投稿まで',
      '基本的な予約投稿',
      'コミュニティサポート'
    ]
  },
  {
    name: 'Standard',
    price: 2980,
    description: 'プロフェッショナル向け',
    popular: true,
    buttonText: '14日間無料で試す',
    features: [
      'IGアカウント 5個',
      '月300投稿まで',
      '繰り返し・曜日投稿',
      'プライオリティサポート',
      '基本分析機能'
    ]
  },
  {
    name: 'Pro',
    price: 5980,
    description: 'パワーユーザー向け',
    popular: false,
    buttonText: '14日間無料で試す',
    features: [
      'IGアカウント 50個',
      '月1,000投稿まで',
      '全ての投稿機能',
      'AI最適化機能',
      '詳細分析レポート',
      '優先サポート'
    ]
  },
  {
    name: 'Business',
    price: 9800,
    description: '企業・代理店向け',
    popular: false,
    buttonText: 'お問い合わせ',
    features: [
      'IGアカウント 無制限',
      '投稿数 無制限',
      '全機能利用可能',
      'API アクセス',
      '専任サポート',
      'カスタマイズ対応'
    ]
  }
])
</script>

<style scoped>
/* 全体のスタイル調整 */
.content-wrapper {
  background-color: #ffffff;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.omniy-landing-page {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  background-color: #ffffff;
  color: var(--text-primary);
}

/* CTAボタンのスタイル修正 */
.cta-button.primary {
  background: var(--primary-gradient);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  /* テキストシャドウ追加 */
}

.cta-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* グラデーションテキストの修正 */
.gradient-text {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  text-shadow: none;
  /* テキストシャドウ削除 */
  padding: 0.1em 0;
  /* パディング追加 */
  font-weight: 800;
}

/* 既存のスタイルを保持 */
/* ここから下は変更なし */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --bg-light: #f7fafc;
  --white: #ffffff;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.omniy-landing-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
  line-height: 1.6;
  overflow-x: hidden;
}

/* ナビゲーション */
.omniy-nav {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 1rem 0;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--text-primary);
}

.cta-button {
  background: var(--primary-gradient);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  display: inline-block;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* ヒーローセクション */
.hero {
  margin-top: 80px;
  padding: 4rem 2rem 6rem;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 3rem;
}

.secondary-button {
  background: white;
  color: var(--text-primary);
  padding: 0.75rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  display: inline-block;
}

.secondary-button:hover {
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow-x: auto;
  min-width: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  min-width: 0;
}

.stat-icon-wrapper {
  position: relative;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.stat-item:hover .stat-icon::before {
  transform: translateX(100%);
}

.stat-icon svg {
  z-index: 1;
}

.stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  margin-bottom: 0.25rem;
  white-space: nowrap;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, transparent, #e2e8f0, transparent);
}

/* Instagram風モックアップ */
.hero-visual {
  position: relative;
}

.phone-mockup {
  width: 320px;
  height: 640px;
  background: #000;
  border-radius: 40px;
  padding: 10px;
  box-shadow: var(--shadow-xl);
  margin: 0 auto;
  position: relative;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Omniyアプリヘッダー */
.omniy-app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.omniy-app-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  color: white;
  display: flex;
  align-items: center;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.notification-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.9);
  animation: pulse-notification 2s infinite;
}

@keyframes pulse-notification {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* アプリコンテンツ */
.app-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
}

.app-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(180deg, rgba(102, 126, 234, 0.03) 0%, transparent 100%);
  pointer-events: none;
}

.page-title {
  margin-bottom: 1.5rem;
}

.page-title h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1e293b;
}

.date-indicator {
  font-size: 0.8rem;
  color: #64748b;
}

/* スケジュールカード */
.schedule-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.schedule-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.schedule-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.01) 0%, rgba(118, 75, 162, 0.01) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.schedule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.schedule-card:hover::before {
  opacity: 1;
}

.schedule-card.active {
  border-color: #667eea;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(255, 255, 255, 0.95) 100%);
}

.schedule-card.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.time-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 25px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.time-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.schedule-card:hover .time-badge::before {
  left: 100%;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
}

.status-dot.scheduled {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  animation: pulse-success 2s infinite;
}

.status-dot.pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  animation: pulse-warning 2s infinite;
}

@keyframes pulse-success {
  0% { box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 0 rgba(16, 185, 129, 0); }
}

@keyframes pulse-warning {
  0% { box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 0 rgba(245, 158, 11, 0.7); }
  70% { box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 6px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 0 rgba(245, 158, 11, 0); }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-preview {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.preview-image {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  transition: all 0.3s ease;
}

.preview-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.schedule-card:hover .preview-image::before {
  transform: translateX(100%);
}

.preview-image.secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.25);
}

.post-info {
  flex: 1;
  min-width: 0;
}

.account-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.1rem;
}

.post-caption {
  font-size: 0.75rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 0.35rem 0.9rem;
  border-radius: 8px;
  font-size: 0.7rem;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.action-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  color: #5a67d8;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn.edit {
  color: #667eea;
  border-color: rgba(102, 126, 234, 0.3);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.action-btn.edit:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: rgba(102, 126, 234, 0.5);
}

.action-btn.delete {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%);
}

.action-btn.delete:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%);
  border-color: rgba(239, 68, 68, 0.5);
  color: #dc2626;
}

/* フローティングボタン */
.floating-add-button {
  position: absolute;
  bottom: 100px;
  right: 1rem;
  width: 54px;
  height: 54px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.8);
  animation: float-gentle 3s ease-in-out infinite;
}

.floating-add-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: 50%;
}

.floating-add-button:hover {
  transform: scale(1.1) rotate(180deg);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  border-color: rgba(255, 255, 255, 1);
}

.floating-add-button:active {
  transform: scale(0.95) rotate(180deg);
}

.floating-add-button svg {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.floating-add-button:hover svg {
  transform: rotate(-180deg);
}

@keyframes float-gentle {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-3px) scale(1.02);
  }
}

/* 統計セクション */
.stats-section {
  display: flex;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.stats-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.02) 0%, transparent 50%, rgba(118, 75, 162, 0.02) 100%);
}

.stats-section .stat-item {
  text-align: center;
  flex: 1;
  min-width: 0;
  padding: 0.25rem;
  position: relative;
  z-index: 1;
}

.stats-section .stat-number {
  font-size: 1rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.stats-section .stat-label {
  font-size: 0.6rem;
  color: #64748b;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

/* 下部ナビゲーション */
.bottom-navigation {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  padding: 0.75rem 0.5rem;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  position: relative;
}

.bottom-navigation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.01) 0%, transparent 50%, rgba(118, 75, 162, 0.01) 100%);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item.active .nav-icon {
  color: #667eea;
}

.nav-item.active .nav-label {
  color: #667eea;
  font-weight: 600;
}

.nav-icon {
  color: #94a3b8;
  display: flex;
  justify-content: center;
}

.nav-icon svg {
  flex-shrink: 0;
}

.nav-label {
  font-size: 0.6rem;
  color: #94a3b8;
  text-align: center;
}

.post-image {
  width: 100%;
  height: 280px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.instagram-photo {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.real-photo-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8b5a2b 0%, #6d4423 50%, #4a2f1a 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.photo-person {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.person-silhouette {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(-1rem);
}

.person-head {
  width: 30px;
  height: 35px;
  background: linear-gradient(145deg, #f4a261, #e76f51);
  border-radius: 50% 50% 45% 45%;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.person-body {
  width: 40px;
  height: 50px;
  background: linear-gradient(145deg, #d4b5a0, #c49484);
  border-radius: 20px 20px 15px 15px;
  position: relative;
}

.person-arms {
  position: absolute;
  top: 8px;
  width: 70px;
  left: 50%;
  transform: translateX(-50%);
}

.arm {
  position: absolute;
  width: 18px;
  height: 35px;
  background: linear-gradient(145deg, #f4a261, #e76f51);
  border-radius: 10px;
}

.arm.left {
  left: -10px;
  transform: rotate(-25deg);
}

.arm.right {
  right: -10px;
  transform: rotate(25deg);
}

.dessert-glass {
  position: relative;
  margin-top: 1rem;
  transform: translateY(2rem);
}

.glass-base {
  width: 30px;
  height: 35px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.8));
  border-radius: 50% 50% 20% 20%;
  border: 2px solid rgba(200, 200, 200, 0.8);
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dessert-content {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fruit {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.fruit.red {
  background: linear-gradient(145deg, #ff6b6b, #ee5a52);
}

.fruit.yellow {
  background: linear-gradient(145deg, #ffd93d, #f9ca24);
}

.fruit.orange {
  background: linear-gradient(145deg, #ff9ff3, #f368e0);
}

.cafe-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.cafe-lights {
  position: absolute;
  top: 20%;
  left: 0;
  right: 0;
  height: 30%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  opacity: 0.6;
}

.table-surface {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 25%;
  background: linear-gradient(180deg, transparent 0%, rgba(101, 67, 33, 0.8) 50%, rgba(139, 90, 43, 0.9) 100%);
}

.photo-text-overlay {
  position: absolute;
  bottom: 1.5rem;
  left: 1rem;
  right: 1rem;
  text-align: center;
}

.photo-text-overlay span {
  background: rgba(255, 255, 255, 0.95);
  color: #495057;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: inline-block;
}

.scheduled-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--primary-gradient);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

/* 浮遊する要素 */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: var(--primary-gradient);
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  background: var(--secondary-gradient);
  top: 60%;
  right: 10%;
  animation-delay: 5s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  background: var(--accent-gradient);
  bottom: 20%;
  left: 15%;
  animation-delay: 10s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  25% {
    transform: translate(30px, -30px) scale(1.1);
  }

  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  75% {
    transform: translate(20px, 30px) scale(1.05);
  }
}

/* ソーシャルプルーフティッカー */
.social-proof {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%);
  padding: 1.5rem 0;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  overflow: hidden;
  position: relative;
}

.social-proof::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(102, 126, 234, 0.02) 0%, 
    transparent 20%, 
    transparent 80%, 
    rgba(118, 75, 162, 0.02) 100%);
}

.ticker-wrapper {
  display: flex;
  animation: ticker 45s linear infinite;
  gap: 1rem;
}

.ticker-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  margin-right: 1rem;
}

.ticker-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  background: rgba(255, 255, 255, 0.95);
}

.ticker-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.ticker-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.ticker-item:hover .ticker-avatar img {
  transform: scale(1.05);
}

.activity-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* カテゴリー別インジケーター色 */
.activity-indicator.fashion { background: linear-gradient(135deg, #ff6b6b, #ee5a52); }
.activity-indicator.food { background: linear-gradient(135deg, #ffd93d, #f9ca24); }
.activity-indicator.beauty { background: linear-gradient(135deg, #ff9ff3, #f368e0); }
.activity-indicator.business { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.activity-indicator.fitness { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.activity-indicator.travel { background: linear-gradient(135deg, #fa709a, #fee140); }
.activity-indicator.art { background: linear-gradient(135deg, #a8edea, #fed6e3); }
.activity-indicator.pets { background: linear-gradient(135deg, #ffecd2, #fcb69f); }
.activity-indicator.music { background: linear-gradient(135deg, #667eea, #764ba2); }
.activity-indicator.tech { background: linear-gradient(135deg, #f093fb, #f5576c); }
.activity-indicator.lifestyle { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.activity-indicator.wellness { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.activity-indicator.automotive { background: linear-gradient(135deg, #30cfd0, #91a7ff); }
.activity-indicator.books { background: linear-gradient(135deg, #a8edea, #fed6e3); }
.activity-indicator.gardening { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.activity-indicator.photography { background: linear-gradient(135deg, #667eea, #764ba2); }
.activity-indicator.bakery { background: linear-gradient(135deg, #ffd93d, #f9ca24); }
.activity-indicator.realestate { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.activity-indicator.jewelry { background: linear-gradient(135deg, #ff9ff3, #f368e0); }
.activity-indicator.wedding { background: linear-gradient(135deg, #fa709a, #fee140); }
.activity-indicator.sports { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.activity-indicator.nails { background: linear-gradient(135deg, #ff9ff3, #f368e0); }
.activity-indicator.education { background: linear-gradient(135deg, #667eea, #764ba2); }
.activity-indicator.craft { background: linear-gradient(135deg, #ffecd2, #fcb69f); }
.activity-indicator.wine { background: linear-gradient(135deg, #fa709a, #fee140); }
.activity-indicator.dance { background: linear-gradient(135deg, #ff6b6b, #ee5a52); }
.activity-indicator.baby { background: linear-gradient(135deg, #ffecd2, #fcb69f); }
.activity-indicator.outdoor { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.activity-indicator.healthcare { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.activity-indicator.gaming { background: linear-gradient(135deg, #667eea, #764ba2); }
.activity-indicator.eco { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.activity-indicator.skincare { background: linear-gradient(135deg, #ff9ff3, #f368e0); }
.activity-indicator.coffee { background: linear-gradient(135deg, #ffd93d, #f9ca24); }

.ticker-text {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

@keyframes ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 機能セクション */
.features {
  padding: 6rem 2rem;
  background: white;
}

.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--bg-light);
  padding: 2.5rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: var(--primary-gradient);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.feature-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.benefit-chip {
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  color: #667eea;
  border: 1px solid #e0e7ff;
}

/* 料金セクション */
.pricing {
  padding: 6rem 2rem;
  background: linear-gradient(180deg, #fafbff 0%, white 100%);
}

.pricing-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.pricing-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  min-width: 0;
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
}

.pricing-card.popular {
  border-color: #667eea;
  transform: scale(1.05);
}

.popular-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-gradient);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.plan-price {
  font-size: 3rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.plan-price small {
  font-size: 1rem;
  font-weight: 400;
}

.plan-features {
  list-style: none;
  margin: 2rem 0;
  text-align: left;
}

.plan-features li {
  padding: 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
}

.check-icon {
  color: #48bb78;
  font-size: 1.2rem;
}

/* フッター */
footer {
  background: var(--text-primary);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-links {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: white;
}

/* ダッシュボードプレビュー */
.dashboard-preview {
  margin-top: 4rem;
}

.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

.dashboard-header h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.dashboard-header p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.dashboard-mockup {
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 500px;
}

.mockup-sidebar {
  background: #f8fafc;
  padding: 2rem;
  border-right: 1px solid #e2e8f0;
}

.sidebar-logo {
  font-size: 1.5rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nav-item {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-item.active {
  background: var(--primary-gradient);
  color: white;
}

.nav-item:not(.active):hover {
  background: #e2e8f0;
}

.mockup-main {
  padding: 2rem;
}

.mockup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.action-btn {
  background: var(--primary-gradient);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.schedule-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

.schedule-time {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.schedule-preview {
  width: 100%;
  height: 60px;
  background: linear-gradient(45deg, #e2e8f0 25%, #f1f5f9 25%);
  background-size: 10px 10px;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.schedule-account {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.schedule-status {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}

.schedule-status.completed {
  background: #d4edda;
  color: #155724;
}

.schedule-status.scheduled {
  background: #cce7ff;
  color: #004085;
}

.schedule-status.pending {
  background: #fff3cd;
  color: #856404;
}

/* 3ステップセクション */
.steps-section {
  padding: 6rem 2rem;
  background: linear-gradient(180deg, white 0%, #fafbff 100%);
}

.steps-container {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  align-items: center;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
}

.step-number {
  width: 60px;
  height: 60px;
  background: var(--primary-gradient);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.step-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.step-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.step-arrow {
  font-size: 2rem;
  color: var(--text-secondary);
  margin: 0 1rem;
}

.steps-cta {
  text-align: center;
  margin-top: 3rem;
}

.cta-button.large {
  padding: 1rem 3rem;
  font-size: 1.1rem;
}

/* 料金保証セクション */
.pricing-guarantee {
  margin-top: 4rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.guarantee-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.guarantee-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.guarantee-content h4 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.guarantee-content p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* FAQセクション */
.faq-section {
  padding: 6rem 2rem;
  background: white;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  box-shadow: var(--shadow-md);
}

.faq-question {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  background: white;
  transition: background 0.3s ease;
}

.faq-item.active .faq-question {
  background: #f8fafc;
}

.faq-toggle {
  font-size: 1.5rem;
  color: var(--primary-gradient);
  font-weight: 700;
}

.faq-answer {
  padding: 0 1.5rem 1.5rem;
  color: var(--text-secondary);
  line-height: 1.7;
  background: #f8fafc;
}

/* レスポンシブ */
@media (max-width: 1024px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-visual {
    order: -1;
    margin-bottom: 2rem;
  }

  .phone-mockup {
    width: 280px;
    height: 560px;
  }

  .nav-links {
    display: none;
  }

  .features-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .pricing-card.popular {
    transform: scale(1);
  }

  .hero-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .hero-actions .cta-button,
  .hero-actions .secondary-button {
    width: 100%;
    max-width: 300px;
  }

  .footer-links {
    flex-direction: column;
    gap: 1rem;
  }

  .dashboard-mockup {
    grid-template-columns: 1fr;
  }

  .mockup-sidebar {
    display: none;
  }

  .steps-container {
    grid-template-columns: 1fr;
  }

  .step-item {
    flex-direction: column;
    text-align: center;
  }

  .step-arrow {
    display: none;
  }

  .guarantee-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
