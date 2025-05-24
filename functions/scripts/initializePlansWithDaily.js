const admin = require('firebase-admin');

// Firebase Admin SDK初期化
admin.initializeApp();
const db = admin.firestore();

// 新しいプラン設定（日次制限含む）
const plans = [
  {
    planId: 'free',
    name: 'Free',
    description: '個人利用に最適な無料プラン',
    price: 0,
    currency: 'jpy',
    interval: 'month',
    stripePriceId: null,
    features: {
      instagramAccountLimit: 1,
      monthlyPostLimit: 10,
      dailyPostLimitPerAccount: 10, // Freeプランは月次制限のみ
      scheduledPosts: true,
      recurringPosts: false,
      randomPosts: false,
      proxySupport: false,
      prioritySupport: false,
      apiAccess: false,
    },
    isActive: true,
  },
  {
    planId: 'basic',
    name: 'Basic',
    description: '小規模ビジネス向けベーシックプラン',
    price: 1280,
    currency: 'jpy',
    interval: 'month',
    stripePriceId: 'price_basic_monthly_jpy',
    features: {
      instagramAccountLimit: 3,
      monthlyPostLimit: 4500, // 理論値：50×30×3
      dailyPostLimitPerAccount: 50, // Instagram API上限
      scheduledPosts: true,
      recurringPosts: true,
      randomPosts: true,
      proxySupport: false,
      prioritySupport: false,
      apiAccess: false,
    },
    isActive: true,
  },
  {
    planId: 'pro',
    name: 'Pro',
    description: '成長企業向けプロフェッショナルプラン',
    price: 3480,
    currency: 'jpy',
    interval: 'month',
    stripePriceId: 'price_pro_monthly_jpy',
    features: {
      instagramAccountLimit: 10,
      monthlyPostLimit: 15000, // 理論値：50×30×10
      dailyPostLimitPerAccount: 50, // Instagram API上限
      scheduledPosts: true,
      recurringPosts: true,
      randomPosts: true,
      proxySupport: true,
      prioritySupport: true,
      apiAccess: false,
    },
    isActive: true,
  },
  {
    planId: 'business',
    name: 'Business',
    description: '大規模運用向けビジネスプラン',
    price: 12800,
    currency: 'jpy',
    interval: 'month',
    stripePriceId: 'price_business_monthly_jpy',
    features: {
      instagramAccountLimit: -1, // 無制限
      monthlyPostLimit: -1, // 無制限
      dailyPostLimitPerAccount: 50, // Instagram API上限
      scheduledPosts: true,
      recurringPosts: true,
      randomPosts: true,
      proxySupport: true,
      prioritySupport: true,
      apiAccess: true,
    },
    isActive: true,
  },
];

async function initializePlans() {
  try {
    console.log('🚀 プラン初期化を開始...');

    const batch = db.batch();

    for (const plan of plans) {
      const planRef = db.collection('plans').doc(plan.planId);
      
      // createdAt/updatedAtを追加
      const planData = {
        ...plan,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(planRef, planData, { merge: true });
      console.log(`📋 プラン設定: ${plan.name} (${plan.planId})`);
      console.log(`   - アカウント上限: ${plan.features.instagramAccountLimit === -1 ? '無制限' : plan.features.instagramAccountLimit}`);
      console.log(`   - 月間投稿上限: ${plan.features.monthlyPostLimit === -1 ? '無制限' : plan.features.monthlyPostLimit}`);
      console.log(`   - 日次投稿上限/アカウント: ${plan.features.dailyPostLimitPerAccount === -1 ? '無制限' : plan.features.dailyPostLimitPerAccount}`);
      console.log(`   - 価格: ¥${plan.price.toLocaleString()}/月`);
      console.log('');
    }

    await batch.commit();
    console.log('✅ プラン初期化完了！');

    // 設定確認
    console.log('\n📊 設定確認:');
    const plansSnapshot = await db.collection('plans').get();
    plansSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`${data.name}: ${data.features.dailyPostLimitPerAccount}投稿/日/アカウント`);
    });

  } catch (error) {
    console.error('❌ プラン初期化エラー:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  initializePlans()
    .then(() => {
      console.log('🎉 スクリプト実行完了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 スクリプト実行エラー:', error);
      process.exit(1);
    });
}

module.exports = { initializePlans }; 