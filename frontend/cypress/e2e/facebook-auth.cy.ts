describe('Facebook Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  describe('Adding Instagram Account via Facebook', () => {
    beforeEach(() => {
      // ログイン済み状態にする
      cy.loginWithGoogle();
      cy.visit('/accounts');
    });

    it('should display Facebook login option in add account dialog', () => {
      cy.get('[data-cy="add-account-button"]').click();
      
      // 認証方法選択画面が表示される
      cy.contains('Instagram アカウントを連携').should('be.visible');
      cy.contains('Facebook でログイン（推奨）').should('be.visible');
      cy.contains('アクセストークンを手動で入力').should('be.visible');
      
      // デフォルトでFacebook認証が選択されている
      cy.get('[value="facebook"]').should('be.checked');
    });

    it('should show Facebook login button when Facebook auth is selected', () => {
      cy.get('[data-cy="add-account-button"]').click();
      
      // Facebook認証が選択されている状態
      cy.get('[value="facebook"]').should('be.checked');
      
      // Facebookログインボタンが表示される
      cy.contains('button', 'Facebook でログイン')
        .should('be.visible')
        .should('have.class', 'v-btn--flat')
        .find('.mdi-facebook')
        .should('exist');
    });

    it('should show manual token input when manual auth is selected', () => {
      cy.get('[data-cy="add-account-button"]').click();
      
      // 手動入力を選択
      cy.contains('アクセストークンを手動で入力').click();
      cy.get('[value="manual"]').should('be.checked');
      
      // 手動入力フォームが表示される
      cy.get('textarea[label="アクセストークン *"]').should('be.visible');
      cy.contains('アクセストークンの取得方法').should('be.visible');
    });

    it('should handle Facebook OAuth popup (mock)', () => {
      // Facebook OAuth をモック
      cy.intercept('POST', '**/api.instagram.com/oauth/**', {
        statusCode: 200,
        body: {
          access_token: 'mock_facebook_token',
          user_id: '123456789'
        }
      });

      cy.intercept('GET', '**/graph.facebook.com/*/accounts**', {
        statusCode: 200,
        body: {
          data: [{
            id: 'page_123',
            name: 'Test Page',
            instagram_business_account: {
              id: 'ig_business_123'
            }
          }]
        }
      });

      cy.intercept('GET', '**/graph.facebook.com/*/ig_business_123**', {
        statusCode: 200,
        body: {
          id: 'ig_business_123',
          username: 'test_business',
          profile_picture_url: 'https://example.com/profile.jpg',
          followers_count: 1000,
          media_count: 50
        }
      });

      cy.get('[data-cy="add-account-button"]').click();
      
      // Facebook認証を実行（実際のポップアップはテストできないため、結果をモック）
      cy.window().then((win) => {
        // Facebook認証成功をシミュレート
        win.postMessage({
          type: 'facebook-auth-success',
          accessToken: 'mock_facebook_token'
        }, '*');
      });

      // アカウント選択画面が表示される
      cy.contains('連携するアカウントを選択').should('be.visible');
      cy.contains('@test_business').should('be.visible');
      cy.contains('1,000 フォロワー').should('be.visible');
      cy.contains('50 投稿').should('be.visible');
    });

    it('should complete account addition flow', () => {
      // APIモック設定
      cy.intercept('POST', '**/addInstagramAccount', {
        statusCode: 200,
        body: {
          success: true,
          accountId: 'new_account_123'
        }
      });

      cy.intercept('POST', '**/getInstagramAccounts', {
        statusCode: 200,
        body: {
          success: true,
          accounts: [{
            id: 'new_account_123',
            username: 'test_business',
            instagramUserId: 'ig_business_123',
            profilePictureUrl: 'https://example.com/profile.jpg',
            followersCount: 1000,
            mediaCount: 50
          }]
        }
      });

      // 手動入力でテスト（Facebook OAuthポップアップを避ける）
      cy.get('[data-cy="add-account-button"]').click();
      cy.contains('アクセストークンを手動で入力').click();
      
      // トークンを入力
      cy.get('textarea[label="アクセストークン *"]').type('IGQVJ_test_token_123');
      cy.contains('button', '次へ').click();

      // アカウント確認画面
      cy.contains('アカウント情報を確認').should('be.visible');
      cy.contains('button', 'アカウントを追加').click();

      // 完了画面
      cy.contains('アカウントを追加しました！').should('be.visible');
      cy.contains('button', '完了').click();

      // ダイアログが閉じる
      cy.get('.v-dialog').should('not.exist');

      // アカウント一覧に追加される
      cy.contains('@test_business').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.loginWithGoogle();
      cy.visit('/accounts');
    });

    it('should handle Facebook auth cancellation', () => {
      cy.get('[data-cy="add-account-button"]').click();
      
      // キャンセルボタンをクリック
      cy.contains('button', 'キャンセル').click();
      
      // ダイアログが閉じる
      cy.get('.v-dialog').should('not.exist');
    });

    it('should show error when no Instagram business account found', () => {
      cy.intercept('GET', '**/graph.facebook.com/*/accounts**', {
        statusCode: 200,
        body: {
          data: []
        }
      });

      cy.get('[data-cy="add-account-button"]').click();
      
      // Facebook認証成功をシミュレート（ビジネスアカウントなし）
      cy.window().then((win) => {
        win.postMessage({
          type: 'facebook-auth-success',
          accessToken: 'mock_facebook_token'
        }, '*');
      });

      // エラーメッセージが表示される
      cy.contains('Instagram ビジネス/クリエイターアカウントが見つかりませんでした').should('be.visible');
    });

    it('should validate required fields for manual input', () => {
      cy.get('[data-cy="add-account-button"]').click();
      cy.contains('アクセストークンを手動で入力').click();
      
      // 空の状態で次へボタンを押す
      cy.contains('button', '次へ').should('be.disabled');
      
      // エラーメッセージ確認
      cy.get('textarea[label="アクセストークン *"]').click().blur();
      cy.contains('必須項目です').should('be.visible');
    });
  });

  describe('Multiple Account Selection', () => {
    beforeEach(() => {
      cy.loginWithGoogle();
      cy.visit('/accounts');
    });

    it('should allow selection when multiple Instagram accounts exist', () => {
      cy.intercept('GET', '**/graph.facebook.com/*/accounts**', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'page_1',
              name: 'Page 1',
              instagram_business_account: { id: 'ig_1' }
            },
            {
              id: 'page_2',
              name: 'Page 2',
              instagram_business_account: { id: 'ig_2' }
            }
          ]
        }
      });

      cy.intercept('GET', '**/graph.facebook.com/*/ig_1**', {
        statusCode: 200,
        body: {
          id: 'ig_1',
          username: 'account_1',
          followers_count: 1000
        }
      });

      cy.intercept('GET', '**/graph.facebook.com/*/ig_2**', {
        statusCode: 200,
        body: {
          id: 'ig_2',
          username: 'account_2',
          followers_count: 2000
        }
      });

      cy.get('[data-cy="add-account-button"]').click();
      
      // Facebook認証成功をシミュレート
      cy.window().then((win) => {
        win.postMessage({
          type: 'facebook-auth-success',
          accessToken: 'mock_facebook_token'
        }, '*');
      });

      // 複数のアカウントが表示される
      cy.contains('@account_1').should('be.visible');
      cy.contains('@account_2').should('be.visible');
      
      // アカウントを選択
      cy.contains('@account_2').click();
      
      // 選択されたアカウントがハイライトされる
      cy.contains('@account_2')
        .closest('.v-card')
        .should('have.class', 'v-card--variant-outlined');
      
      // アカウントを追加ボタンが有効になる
      cy.contains('button', 'アカウントを追加').should('not.be.disabled');
    });
  });
});