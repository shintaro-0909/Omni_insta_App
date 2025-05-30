<template>
  <div class="modern-pricing-page">
    <!-- Header -->
    <div class="pricing-header">
      <v-container>
        <div class="header-content text-center">
          <h1 class="page-title" data-aos="fade-up">
            Simple, Transparent Pricing
          </h1>
          <p class="page-subtitle" data-aos="fade-up" data-aos-delay="200">
            Choose the perfect plan to scale your Instagram presence and grow your business
          </p>
          
          <!-- Billing Toggle -->
          <div class="billing-toggle" data-aos="fade-up" data-aos-delay="400">
            <v-btn-toggle
              v-model="billingPeriod"
              mandatory
              variant="outlined"
              class="toggle-buttons"
            >
              <v-btn value="monthly">Monthly</v-btn>
              <v-btn value="yearly">
                Yearly
                <v-chip size="small" color="success" class="ml-2">Save 20%</v-chip>
              </v-btn>
            </v-btn-toggle>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Pricing Plans -->
    <v-container class="plans-section">
      <v-row justify="center">
        <v-col
          v-for="(plan, index) in pricingPlans"
          :key="index"
          cols="12"
          md="6"
          lg="4"
          xl="3"
        >
          <v-card
            class="pricing-plan-card"
            :class="{
              featured: plan.featured,
              enterprise: plan.name === 'Enterprise'
            }"
            elevation="0"
            data-aos="fade-up"
            :data-aos-delay="index * 150"
          >
            <!-- Popular Badge -->
            <div v-if="plan.featured" class="popular-badge">
              <v-icon icon="mdi-star" size="16"></v-icon>
              Most Popular
            </div>

            <!-- Plan Header -->
            <div class="plan-header">
              <div class="plan-icon">
                <v-avatar size="64" :class="`plan-avatar plan-avatar--${plan.color}`">
                  <v-icon :icon="plan.icon" size="32"></v-icon>
                </v-avatar>
              </div>
              <h3 class="plan-name">{{ plan.name }}</h3>
              <p class="plan-description">{{ plan.description }}</p>
            </div>

            <!-- Plan Pricing -->
            <div class="plan-pricing">
              <div class="price-display">
                <span class="currency">$</span>
                <span class="amount">{{ getCurrentPrice(plan) }}</span>
                <span class="period">/{{ billingPeriod === 'yearly' ? 'year' : 'month' }}</span>
              </div>
              <div v-if="billingPeriod === 'yearly' && plan.yearlyPrice" class="savings">
                Save ${{ (plan.monthlyPrice * 12 - plan.yearlyPrice) }} per year
              </div>
            </div>

            <!-- Plan Features -->
            <div class="plan-features">
              <div class="features-header">
                <h4>Everything in {{ plan.name }}</h4>
              </div>
              <v-list class="feature-list">
                <v-list-item
                  v-for="(feature, featureIndex) in plan.features"
                  :key="featureIndex"
                  class="feature-item"
                >
                  <template v-slot:prepend>
                    <v-icon
                      :icon="feature.included ? 'mdi-check-circle' : 'mdi-close-circle'"
                      :color="feature.included ? 'success' : 'error'"
                      size="20"
                    ></v-icon>
                  </template>
                  <v-list-item-title
                    :class="{ 'text-disabled': !feature.included }"
                  >
                    {{ feature.name }}
                  </v-list-item-title>
                  <template v-if="feature.tooltip" v-slot:append>
                    <v-tooltip location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon
                          icon="mdi-information-outline"
                          size="16"
                          color="grey"
                          v-bind="props"
                        ></v-icon>
                      </template>
                      <span>{{ feature.tooltip }}</span>
                    </v-tooltip>
                  </template>
                </v-list-item>
              </v-list>
            </div>

            <!-- Plan Action -->
            <div class="plan-action">
              <v-btn
                :color="plan.featured ? 'primary' : 'secondary'"
                :variant="plan.featured ? 'flat' : 'outlined'"
                size="large"
                block
                class="plan-cta-btn"
                @click="selectPlan(plan)"
              >
                {{ plan.ctaText }}
              </v-btn>
              <p v-if="plan.trialDays" class="trial-info">
                {{ plan.trialDays }}-day free trial • No credit card required
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Feature Comparison -->
    <v-container class="comparison-section">
      <div class="section-header text-center">
        <h2 class="section-title" data-aos="fade-up">
          Compare All Features
        </h2>
        <p class="section-subtitle" data-aos="fade-up" data-aos-delay="200">
          See exactly what's included in each plan
        </p>
      </div>

      <v-card class="comparison-table-card" elevation="2" data-aos="fade-up" data-aos-delay="400">
        <div class="table-responsive">
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="feature-header">Features</th>
                <th
                  v-for="plan in pricingPlans"
                  :key="plan.name"
                  class="plan-header"
                  :class="{ featured: plan.featured }"
                >
                  <div class="plan-header-content">
                    <div class="plan-name">{{ plan.name }}</div>
                    <div class="plan-price">
                      ${{ getCurrentPrice(plan) }}/{{ billingPeriod === 'yearly' ? 'yr' : 'mo' }}
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(feature, index) in comparisonFeatures"
                :key="index"
                class="feature-row"
              >
                <td class="feature-name">
                  <div class="feature-content">
                    <span class="feature-text">{{ feature.name }}</span>
                    <v-tooltip v-if="feature.tooltip" location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon
                          icon="mdi-information-outline"
                          size="16"
                          color="grey"
                          v-bind="props"
                        ></v-icon>
                      </template>
                      <span>{{ feature.tooltip }}</span>
                    </v-tooltip>
                  </div>
                </td>
                <td
                  v-for="plan in pricingPlans"
                  :key="plan.name"
                  class="feature-value"
                  :class="{ featured: plan.featured }"
                >
                  <div class="value-content">
                    <v-icon
                      v-if="typeof feature.values[plan.name.toLowerCase()] === 'boolean'"
                      :icon="feature.values[plan.name.toLowerCase()] ? 'mdi-check' : 'mdi-close'"
                      :color="feature.values[plan.name.toLowerCase()] ? 'success' : 'error'"
                      size="20"
                    ></v-icon>
                    <span v-else class="value-text">
                      {{ feature.values[plan.name.toLowerCase()] }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card>
    </v-container>

    <!-- Testimonials -->
    <v-container class="testimonials-section">
      <div class="section-header text-center">
        <h2 class="section-title" data-aos="fade-up">
          Trusted by 10,000+ Creators
        </h2>
        <p class="section-subtitle" data-aos="fade-up" data-aos-delay="200">
          See what our customers are saying about Omniy
        </p>
      </div>

      <v-row>
        <v-col
          v-for="(testimonial, index) in testimonials"
          :key="index"
          cols="12"
          md="4"
        >
          <v-card
            class="testimonial-card"
            elevation="0"
            data-aos="fade-up"
            :data-aos-delay="index * 200"
          >
            <div class="testimonial-content">
              <div class="quote-icon">
                <v-icon icon="mdi-format-quote-close" size="24" color="primary"></v-icon>
              </div>
              <p class="testimonial-text">{{ testimonial.text }}</p>
              <div class="testimonial-author">
                <v-avatar size="48">
                  <v-img :src="testimonial.avatar"></v-img>
                </v-avatar>
                <div class="author-info">
                  <div class="author-name">{{ testimonial.name }}</div>
                  <div class="author-title">{{ testimonial.title }}</div>
                  <div class="author-stats">{{ testimonial.followers }} followers</div>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- FAQ Section -->
    <v-container class="faq-section">
      <div class="section-header text-center">
        <h2 class="section-title" data-aos="fade-up">
          Frequently Asked Questions
        </h2>
        <p class="section-subtitle" data-aos="fade-up" data-aos-delay="200">
          Everything you need to know about our pricing
        </p>
      </div>

      <v-row justify="center">
        <v-col cols="12" lg="8">
          <v-expansion-panels
            class="faq-panels"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <v-expansion-panel
              v-for="(faq, index) in faqs"
              :key="index"
              class="faq-panel"
            >
              <v-expansion-panel-title class="faq-question">
                {{ faq.question }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="faq-answer">
                {{ faq.answer }}
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-container>

    <!-- Final CTA -->
    <div class="final-cta-section">
      <v-container>
        <div class="cta-content text-center">
          <h2 class="cta-title" data-aos="fade-up">
            Ready to Transform Your Instagram Strategy?
          </h2>
          <p class="cta-subtitle" data-aos="fade-up" data-aos-delay="200">
            Join thousands of creators and businesses already using Omniy to grow their Instagram presence
          </p>
          <div class="cta-actions" data-aos="fade-up" data-aos-delay="400">
            <v-btn
              color="primary"
              size="x-large"
              class="cta-primary-btn"
              @click="startFreeTrial"
            >
              <v-icon start>mdi-rocket-launch</v-icon>
              Start Your Free Trial
            </v-btn>
            <v-btn
              variant="outlined"
              color="white"
              size="x-large"
              class="cta-secondary-btn"
              @click="scheduleDemo"
            >
              <v-icon start>mdi-calendar</v-icon>
              Schedule a Demo
            </v-btn>
          </div>
          <p class="cta-note" data-aos="fade-up" data-aos-delay="600">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </v-container>
    </div>

    <!-- Enterprise Contact Modal -->
    <v-dialog v-model="showEnterpriseModal" max-width="600px">
      <v-card class="enterprise-modal">
        <v-card-title class="modal-header">
          <h3>Enterprise Solutions</h3>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showEnterpriseModal = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <div class="enterprise-content">
            <div class="enterprise-features">
              <h4>What's included in Enterprise:</h4>
              <v-list>
                <v-list-item
                  v-for="feature in enterpriseFeatures"
                  :key="feature"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-check-circle" color="success"></v-icon>
                  </template>
                  <v-list-item-title>{{ feature }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
            
            <v-form class="enterprise-form">
              <v-text-field
                v-model="enterpriseForm.name"
                label="Full Name"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              <v-text-field
                v-model="enterpriseForm.email"
                label="Business Email"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              <v-text-field
                v-model="enterpriseForm.company"
                label="Company Name"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              <v-select
                v-model="enterpriseForm.teamSize"
                :items="teamSizeOptions"
                label="Team Size"
                variant="outlined"
                class="mb-4"
              ></v-select>
              <v-textarea
                v-model="enterpriseForm.message"
                label="Tell us about your needs"
                variant="outlined"
                rows="3"
              ></v-textarea>
            </v-form>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showEnterpriseModal = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="submitEnterpriseForm"
          >
            Contact Sales
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Reactive data
const billingPeriod = ref('monthly')
const showEnterpriseModal = ref(false)
const enterpriseForm = ref({
  name: '',
  email: '',
  company: '',
  teamSize: '',
  message: ''
})

// Pricing plans
const pricingPlans = ref([
  {
    name: 'Starter',
    icon: 'mdi-rocket-launch-outline',
    color: 'blue',
    description: 'Perfect for getting started with Instagram automation',
    monthlyPrice: 9,
    yearlyPrice: 86,
    featured: false,
    ctaText: 'Start Free Trial',
    trialDays: 14,
    features: [
      { name: '1 Instagram Account', included: true },
      { name: '50 Scheduled Posts/Month', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Post Templates', included: true },
      { name: 'Email Support', included: true },
      { name: 'Advanced Analytics', included: false },
      { name: 'AI Caption Generation', included: false },
      { name: 'Priority Support', included: false }
    ]
  },
  {
    name: 'Professional',
    icon: 'mdi-star-outline',
    color: 'purple',
    description: 'Ideal for growing creators and small businesses',
    monthlyPrice: 29,
    yearlyPrice: 278,
    featured: true,
    ctaText: 'Start Free Trial',
    trialDays: 14,
    features: [
      { name: '5 Instagram Accounts', included: true },
      { name: 'Unlimited Scheduled Posts', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'AI Caption Generation', included: true },
      { name: 'Content Calendar', included: true },
      { name: 'Priority Support', included: true },
      { name: 'White-label Reports', included: false },
      { name: 'API Access', included: false }
    ]
  },
  {
    name: 'Business',
    icon: 'mdi-office-building-outline',
    color: 'green',
    description: 'Built for teams and agencies managing multiple brands',
    monthlyPrice: 79,
    yearlyPrice: 758,
    featured: false,
    ctaText: 'Start Free Trial',
    trialDays: 14,
    features: [
      { name: '15 Instagram Accounts', included: true },
      { name: 'Unlimited Everything', included: true },
      { name: 'Team Collaboration', included: true },
      { name: 'White-label Reports', included: true },
      { name: 'API Access', included: true },
      { name: 'Custom Integrations', included: true },
      { name: 'Dedicated Account Manager', included: false },
      { name: 'Custom SLA', included: false }
    ]
  },
  {
    name: 'Enterprise',
    icon: 'mdi-domain',
    color: 'orange',
    description: 'Custom solutions for large organizations',
    monthlyPrice: null,
    yearlyPrice: null,
    featured: false,
    ctaText: 'Contact Sales',
    trialDays: null,
    features: [
      { name: 'Unlimited Accounts', included: true },
      { name: 'Custom Features', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'Custom SLA', included: true },
      { name: 'On-premise Deployment', included: true },
      { name: 'Advanced Security', included: true },
      { name: 'Custom Training', included: true },
      { name: '24/7 Phone Support', included: true }
    ]
  }
])

// Comparison features
const comparisonFeatures = ref([
  {
    name: 'Instagram Accounts',
    tooltip: 'Number of Instagram accounts you can connect',
    values: {
      starter: '1',
      professional: '5',
      business: '15',
      enterprise: 'Unlimited'
    }
  },
  {
    name: 'Scheduled Posts/Month',
    tooltip: 'Monthly limit for scheduled posts',
    values: {
      starter: '50',
      professional: 'Unlimited',
      business: 'Unlimited',
      enterprise: 'Unlimited'
    }
  },
  {
    name: 'AI Caption Generation',
    tooltip: 'AI-powered caption suggestions and optimization',
    values: {
      starter: false,
      professional: true,
      business: true,
      enterprise: true
    }
  },
  {
    name: 'Advanced Analytics',
    tooltip: 'Detailed insights and performance metrics',
    values: {
      starter: false,
      professional: true,
      business: true,
      enterprise: true
    }
  },
  {
    name: 'Team Collaboration',
    tooltip: 'Multiple users and role-based permissions',
    values: {
      starter: false,
      professional: false,
      business: true,
      enterprise: true
    }
  },
  {
    name: 'White-label Reports',
    tooltip: 'Branded reports for clients',
    values: {
      starter: false,
      professional: false,
      business: true,
      enterprise: true
    }
  },
  {
    name: 'API Access',
    tooltip: 'Custom integrations and API access',
    values: {
      starter: false,
      professional: false,
      business: true,
      enterprise: true
    }
  },
  {
    name: 'Priority Support',
    tooltip: 'Faster response times and dedicated support',
    values: {
      starter: false,
      professional: true,
      business: true,
      enterprise: true
    }
  }
])

// Testimonials
const testimonials = ref([
  {
    text: "Omniy has transformed how I manage my Instagram. The AI features save me hours every week, and my engagement has increased by 300%!",
    name: "Sarah Johnson",
    title: "Travel Influencer",
    followers: "125K",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    text: "The analytics insights are incredible. I finally understand what content resonates with my audience and when to post for maximum reach.",
    name: "Mike Chen",
    title: "Fitness Coach",
    followers: "89K",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    text: "Managing multiple client accounts used to be a nightmare. Omniy's team features make collaboration seamless and efficient.",
    name: "Emma Rodriguez",
    title: "Social Media Manager",
    followers: "45K",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg"
  }
])

// FAQs
const faqs = ref([
  {
    question: "Can I change my plan at any time?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
  },
  {
    question: "What happens if I exceed my account or post limits?",
    answer: "We'll notify you when you're approaching your limits. You can upgrade your plan to increase limits, or wait until the next billing cycle for limits to reset."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day free trial, so you can test all features before paying. If you're not satisfied within the first 30 days of paid service, we offer a full refund."
  },
  {
    question: "Is my Instagram data secure?",
    answer: "Absolutely. We use enterprise-grade encryption and follow Instagram's official API guidelines. Your data is never shared with third parties."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time from your account settings. Your plan will remain active until the end of your current billing period."
  },
  {
    question: "Do you offer custom enterprise solutions?",
    answer: "Yes! Our Enterprise plan includes custom features, dedicated support, and can be tailored to your organization's specific needs. Contact our sales team for more information."
  }
])

// Enterprise features
const enterpriseFeatures = ref([
  'Unlimited Instagram accounts',
  'Custom feature development',
  'Dedicated account manager',
  'Custom SLA and uptime guarantees',
  'On-premise deployment options',
  'Advanced security and compliance',
  'Custom training and onboarding',
  '24/7 phone and priority support'
])

// Team size options
const teamSizeOptions = ref([
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-1000 employees',
  '1000+ employees'
])

// Computed properties
const getCurrentPrice = (plan: any) => {
  if (!plan.monthlyPrice) return 'Custom'
  
  if (billingPeriod.value === 'yearly' && plan.yearlyPrice) {
    return Math.round(plan.yearlyPrice / 12)
  }
  
  return plan.monthlyPrice
}

// Methods
const selectPlan = (plan: any) => {
  if (plan.name === 'Enterprise') {
    showEnterpriseModal.value = true
  } else {
    console.log('Selected plan:', plan.name)
    // Handle plan selection
  }
}

const startFreeTrial = () => {
  console.log('Start free trial')
}

const scheduleDemo = () => {
  console.log('Schedule demo')
}

const submitEnterpriseForm = () => {
  console.log('Enterprise form submitted:', enterpriseForm.value)
  showEnterpriseModal.value = false
  // Reset form
  enterpriseForm.value = {
    name: '',
    email: '',
    company: '',
    teamSize: '',
    message: ''
  }
}

// Lifecycle
onMounted(() => {
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true
  })
})
</script>

<style scoped>
.modern-pricing-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* Header */
.pricing-header {
  padding: 4rem 0;
  color: white;
  text-align: center;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.billing-toggle {
  display: flex;
  justify-content: center;
}

.toggle-buttons {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toggle-buttons .v-btn {
  border-radius: 25px;
  color: white;
  font-weight: 600;
}

.toggle-buttons .v-btn--active {
  background: white;
  color: #667eea;
}

/* Plans Section */
.plans-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.pricing-plan-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
  height: 100%;
  border: 2px solid transparent;
}

.pricing-plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.pricing-plan-card.featured {
  border-color: #667eea;
  box-shadow: 0 15px 50px rgba(102, 126, 234, 0.2);
  transform: scale(1.05);
}

.pricing-plan-card.featured:hover {
  transform: scale(1.05) translateY(-8px);
}

.pricing-plan-card.enterprise {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.plan-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-icon {
  margin-bottom: 1.5rem;
}

.plan-avatar {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}

.plan-avatar--blue {
  background: linear-gradient(45deg, #2196f3, #90caf9);
}

.plan-avatar--purple {
  background: linear-gradient(45deg, #9c27b0, #ce93d8);
}

.plan-avatar--green {
  background: linear-gradient(45deg, #4caf50, #a5d6a7);
}

.plan-avatar--orange {
  background: linear-gradient(45deg, #ff9800, #ffcc02);
}

.plan-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.enterprise .plan-name {
  color: white;
}

.plan-description {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
}

.enterprise .plan-description {
  color: rgba(255, 255, 255, 0.9);
}

.plan-pricing {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.enterprise .plan-pricing {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.price-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.currency {
  font-size: 1.5rem;
  color: #7f8c8d;
  font-weight: 600;
}

.amount {
  font-size: 3.5rem;
  font-weight: 900;
  color: #2c3e50;
  line-height: 1;
}

.enterprise .amount {
  color: white;
}

.period {
  font-size: 1.2rem;
  color: #7f8c8d;
  font-weight: 500;
}

.enterprise .period {
  color: rgba(255, 255, 255, 0.8);
}

.savings {
  font-size: 0.9rem;
  color: #4caf50;
  font-weight: 600;
  background: rgba(76, 175, 80, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
}

.plan-features {
  margin-bottom: 2rem;
}

.features-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem;
  text-align: center;
}

.enterprise .features-header h4 {
  color: white;
}

.feature-list {
  background: transparent;
  padding: 0;
}

.feature-item {
  padding: 8px 0;
  min-height: auto;
}

.feature-item .v-list-item-title {
  font-size: 0.95rem;
  line-height: 1.4;
}

.plan-action {
  text-align: center;
}

.plan-cta-btn {
  font-weight: 600;
  border-radius: 50px;
  padding: 16px 32px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.plan-cta-btn:hover {
  transform: translateY(-2px);
}

.trial-info {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

.enterprise .trial-info {
  color: rgba(255, 255, 255, 0.8);
}

/* Comparison Section */
.comparison-section {
  padding: 4rem 0;
  background: white;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto 3rem;
}

.comparison-table-card {
  border-radius: 20px;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 1.5rem 1rem;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.feature-header {
  text-align: left;
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  position: sticky;
  left: 0;
  z-index: 2;
}

.plan-header {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  min-width: 150px;
}

.plan-header.featured {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.plan-header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plan-name {
  font-size: 1.1rem;
  font-weight: 700;
}

.plan-price {
  font-size: 0.9rem;
  opacity: 0.8;
}

.feature-row:hover {
  background: #f8f9fa;
}

.feature-name {
  text-align: left;
  font-weight: 500;
  color: #2c3e50;
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
}

.feature-row:hover .feature-name {
  background: #f8f9fa;
}

.feature-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feature-value.featured {
  background: rgba(102, 126, 234, 0.05);
}

.value-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.value-text {
  font-weight: 500;
  color: #2c3e50;
}

/* Testimonials Section */
.testimonials-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.testimonial-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  height: 100%;
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.testimonial-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.quote-icon {
  margin-bottom: 1rem;
}

.testimonial-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
  margin: 0 0 2rem;
  flex: 1;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.author-title {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.author-stats {
  color: #667eea;
  font-size: 0.85rem;
  font-weight: 500;
}

/* FAQ Section */
.faq-section {
  padding: 4rem 0;
  background: white;
}

.faq-panels {
  border-radius: 20px;
  overflow: hidden;
}

.faq-panel {
  margin-bottom: 1rem;
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.faq-question {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.faq-answer {
  color: #5a6c7d;
  line-height: 1.6;
}

/* Final CTA */
.final-cta-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  color: white;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.cta-primary-btn,
.cta-secondary-btn {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 16px 32px;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.cta-primary-btn {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8px 32px rgba(240, 147, 251, 0.3);
}

.cta-primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(240, 147, 251, 0.4);
}

.cta-secondary-btn {
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.cta-secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.cta-note {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

/* Enterprise Modal */
.enterprise-modal {
  border-radius: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.enterprise-content {
  padding: 1rem 0;
}

.enterprise-features {
  margin-bottom: 2rem;
}

.enterprise-features h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.enterprise-form {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 15px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
  
  .page-subtitle {
    font-size: 1.1rem;
  }
  
  .pricing-plan-card.featured {
    transform: none;
  }
  
  .pricing-plan-card.featured:hover {
    transform: translateY(-8px);
  }
  
  .price-display {
    flex-direction: column;
    align-items: center;
    gap: 0;
  }
  
  .amount {
    font-size: 2.5rem;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-primary-btn,
  .cta-secondary-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .comparison-table th,
  .comparison-table td {
    padding: 1rem 0.5rem;
    font-size: 0.9rem;
  }
  
  .feature-header {
    min-width: 200px;
  }
  
  .plan-header {
    min-width: 120px;
  }
}
</style>