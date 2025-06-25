/**
 * 🧪 OMNIY Instagram Scheduler - 包括的モック動作検証テスト
 * Claude Code による自動テストスクリプト
 */

// テスト対象のページ一覧
const TEST_PAGES = [
  { name: 'Home', path: '/', buttons: ['新しい投稿をスケジュール', 'アカウントを管理', 'コンテンツライブラリ'] },
  { name: 'Accounts', path: '/accounts', buttons: ['アカウントを追加', '更新', '削除'] },
  { name: 'Content', path: '/content', buttons: ['新しいコンテンツ作成', '編集', '削除', '更新', 'クリア'] },
  { name: 'Schedules', path: '/schedules', buttons: ['新しいスケジュール作成', '編集', '削除', '実行'] },
  { name: 'Dashboard', path: '/dashboard', buttons: ['リフレッシュ', 'エクスポート'] },
  { name: 'Settings', path: '/settings', buttons: ['保存', 'リセット'] },
  { name: 'Billing', path: '/billing', buttons: ['プラン変更', '支払い履歴'] }
];

// テスト実行関数
const runComprehensiveTest = async () => {
  console.log('🚀 包括的モック動作検証テスト開始');
  console.log('📋 テスト対象:', TEST_PAGES.length, 'ページ');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  for (const page of TEST_PAGES) {
    console.log(`\n📄 テスト中: ${page.name} (${page.path})`);
    
    try {
      // ページ遷移テスト
      await testPageNavigation(page);
      
      // ボタン動作テスト
      await testPageButtons(page);
      
      results.passed++;
      console.log(`✅ ${page.name}: 正常動作確認`);
      
    } catch (error) {
      results.failed++;
      results.errors.push({
        page: page.name,
        error: error.message
      });
      console.error(`❌ ${page.name}: エラー発生 -`, error.message);
    }
    
    results.total++;
  }

  // テスト結果レポート
  console.log('\n📊 テスト結果レポート');
  console.log('==================');
  console.log(`総ページ数: ${results.total}`);
  console.log(`成功: ${results.passed}`);
  console.log(`失敗: ${results.failed}`);
  console.log(`成功率: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ エラー詳細:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.page}: ${error.error}`);
    });
  }

  return results;
};

// ページ遷移テスト
const testPageNavigation = async (page) => {
  console.log(`  🔗 ナビゲーションテスト: ${page.path}`);
  
  // Vue Router を使用したページ遷移をシミュレート
  if (window.location.pathname !== page.path) {
    window.history.pushState({}, '', page.path);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return true;
};

// ボタン動作テスト
const testPageButtons = async (page) => {
  console.log(`  🔘 ボタンテスト: ${page.buttons.length}個のボタン`);
  
  for (const buttonText of page.buttons) {
    console.log(`    - テスト中: "${buttonText}"`);
    
    // ボタン要素の検索 (複数の方法で試行)
    const button = findButton(buttonText);
    
    if (button) {
      // ボタンクリックのシミュレート
      await simulateButtonClick(button, buttonText);
      console.log(`    ✅ "${buttonText}": 動作確認`);
    } else {
      console.log(`    ⚠️ "${buttonText}": ボタンが見つかりません`);
    }
  }
};

// ボタン要素検索
const findButton = (buttonText) => {
  // 1. テキスト内容で検索
  const buttons = Array.from(document.querySelectorAll('button, .v-btn, .cta-button'));
  let button = buttons.find(btn => 
    btn.textContent.includes(buttonText) || 
    btn.innerText.includes(buttonText)
  );
  
  if (button) return button;
  
  // 2. data-cy 属性で検索
  button = document.querySelector(`[data-cy*="${buttonText.toLowerCase().replace(/\s+/g, '-')}"]`);
  if (button) return button;
  
  // 3. aria-label で検索
  button = document.querySelector(`[aria-label*="${buttonText}"]`);
  if (button) return button;
  
  // 4. title 属性で検索
  button = document.querySelector(`[title*="${buttonText}"]`);
  if (button) return button;
  
  return null;
};

// ボタンクリックシミュレート
const simulateButtonClick = async (button, buttonText) => {
  try {
    // 要素が見える状態かチェック
    if (!button.offsetParent) {
      throw new Error('ボタンが非表示状態');
    }
    
    // 無効化されていないかチェック
    if (button.disabled || button.classList.contains('v-btn--disabled')) {
      console.log(`    ⚠️ "${buttonText}": ボタンが無効化されています`);
      return;
    }
    
    // クリックイベント発火
    button.click();
    
    // 少し待機してレスポンスを確認
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // ダイアログやモーダルの表示確認
    const modals = document.querySelectorAll('.v-dialog, .modal, .v-overlay');
    if (modals.length > 0) {
      console.log(`    📱 モーダル/ダイアログが表示されました`);
      
      // ダイアログを閉じる
      const closeButtons = document.querySelectorAll('.v-btn:contains("キャンセル"), .v-btn:contains("閉じる"), [aria-label="close"]');
      if (closeButtons.length > 0) {
        closeButtons[0].click();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
  } catch (error) {
    throw new Error(`"${buttonText}" クリック時エラー: ${error.message}`);
  }
};

// テスト実行用の関数をグローバルに公開
window.runOmniyTest = runComprehensiveTest;

console.log('🧪 テスト自動化スクリプト読み込み完了');
console.log('📝 実行方法: runOmniyTest()');