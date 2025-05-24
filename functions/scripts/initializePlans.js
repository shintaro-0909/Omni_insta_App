const admin = require('firebase-admin');

// Firebase Admin SDK初期化
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

// プラン定義
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
    description: '小規模ビジネス向けのベーシックプラン',
    price: 980,
    currency: 'jpy',
    interval: 'month',
    stripePriceId: 'price_basic_monthly_jpy', // 実際のStripe Price IDに置き換える
    features: {
      instagramAccountLimit: 3,
      monthlyPostLimit: 100,
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
    description: '成長企業向けのプロフェッショナルプラン',
    price: 2980,
    currency: 'jpy',
    interval: 'month',
    stripePriceId: 'price_pro_monthly_jpy', // 実際のStripe Price IDに置き換える
    features: {
      instagramAccountLimit: 10,
      monthlyPostLimit: 500,
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
    description: '大企業向けのビジネスプラン',
    price: 9800,
    currency: 'jpy',
    interval: 'month',
    stripePriceId: 'price_business_monthly_jpy', // 実際のStripe Price IDに置き換える
    features: {
      instagramAccountLimit: -1, // 無制限
      monthlyPostLimit: -1, // 無制限
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
    console.log('プラン初期化を開始します...');

    const batch = db.batch();

    for (const plan of plans) {
      const planRef = db.collection('plans').doc(plan.planId);
      
      // タイムスタンプを追加
      const planData = {
        ...plan,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(planRef, planData);
      console.log(`プラン追加: ${plan.name} (${plan.planId})`);
    }

    await batch.commit();
    console.log('✅ プラン初期化が完了しました');

    // 作成されたプランを確認
    const plansSnapshot = await db.collection('plans').get();
    console.log(`\n📊 登録されたプラン数: ${plansSnapshot.size}`);
    
    plansSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.name}: ¥${data.price}/月`);
    });

  } catch (error) {
    console.error('❌ プラン初期化エラー:', error);
  } finally {
    process.exit(0);
  }
}

// スクリプト実行
initializePlans(); 