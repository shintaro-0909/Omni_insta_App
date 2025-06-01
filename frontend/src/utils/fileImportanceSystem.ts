/**
 * ファイル重要度管理システム
 * アプリケーション構成ファイルのリスク レベル管理・変更確認システム
 */

interface FileImportanceRule {
  path: string;
  level: 'low' | 'medium' | 'high';
  description: string;
  changeImpact: string;
  confirmationRequired: boolean;
}

interface ChangeConfirmation {
  fileName: string;
  level: 'low' | 'medium' | 'high';
  reason: string;
  approved: boolean;
  timestamp: number;
}

class FileImportanceManager {
  private rules: Map<string, FileImportanceRule> = new Map();
  private changeHistory: ChangeConfirmation[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * ファイル重要度ルール初期化
   */
  private initializeRules(): void {
    const rules: FileImportanceRule[] = [
      // 高リスク: アプリケーションの核となるファイル
      {
        path: 'main.ts',
        level: 'high',
        description: 'アプリケーションのエントリーポイント',
        changeImpact: 'アプリ全体の動作に影響',
        confirmationRequired: true,
      },
      {
        path: 'App.vue',
        level: 'high',
        description: 'アプリケーションのルートコンポーネント',
        changeImpact: 'UI全体の構造・動作に影響',
        confirmationRequired: true,
      },
      {
        path: 'package.json',
        level: 'high',
        description: 'プロジェクト設定・依存関係',
        changeImpact: 'ビルド・デプロイに影響',
        confirmationRequired: true,
      },
      {
        path: 'vite.config.ts',
        level: 'high',
        description: 'ビルド設定',
        changeImpact: 'ビルドプロセス全体に影響',
        confirmationRequired: true,
      },
      {
        path: 'tsconfig.json',
        level: 'high',
        description: 'TypeScript設定',
        changeImpact: '型チェック・コンパイルに影響',
        confirmationRequired: true,
      },
      {
        path: 'firebase.json',
        level: 'high',
        description: 'Firebase設定',
        changeImpact: 'デプロイ・サービス連携に影響',
        confirmationRequired: true,
      },
      {
        path: 'firestore.rules',
        level: 'high',
        description: 'Firestoreセキュリティルール',
        changeImpact: 'データベースセキュリティに影響',
        confirmationRequired: true,
      },
      {
        path: 'router/index.ts',
        level: 'high',
        description: 'ルーティング設定',
        changeImpact: 'ナビゲーション・ページアクセスに影響',
        confirmationRequired: true,
      },

      // 中リスク: 重要な機能コンポーネント・ユーティリティ
      {
        path: 'stores/**/*.ts',
        level: 'medium',
        description: 'Piniaストア（状態管理）',
        changeImpact: 'アプリケーション状態管理に影響',
        confirmationRequired: true,
      },
      {
        path: 'services/**/*.ts',
        level: 'medium',
        description: 'API・外部サービス連携',
        changeImpact: 'データ取得・外部連携に影響',
        confirmationRequired: true,
      },
      {
        path: 'utils/**/*.ts',
        level: 'medium',
        description: 'ユーティリティ関数・システム',
        changeImpact: '機能・パフォーマンスに影響',
        confirmationRequired: true,
      },
      {
        path: 'components/**/*.vue',
        level: 'medium',
        description: 'Vueコンポーネント',
        changeImpact: 'UI・ユーザー体験に影響',
        confirmationRequired: false,
      },
      {
        path: 'views/**/*.vue',
        level: 'medium',
        description: 'ページビューコンポーネント',
        changeImpact: 'ページ機能・表示に影響',
        confirmationRequired: false,
      },

      // 低リスク: テスト・設定・デモファイル
      {
        path: '**/*.test.ts',
        level: 'low',
        description: 'テストファイル',
        changeImpact: 'テスト実行に影響（本体には影響なし）',
        confirmationRequired: false,
      },
      {
        path: '**/demos/**/*',
        level: 'low',
        description: 'デモ・サンプルファイル',
        changeImpact: 'デモ機能のみに影響',
        confirmationRequired: false,
      },
      {
        path: '**/*.md',
        level: 'low',
        description: 'ドキュメントファイル',
        changeImpact: 'ドキュメンテーションのみに影響',
        confirmationRequired: false,
      },
      {
        path: '.env*',
        level: 'medium',
        description: '環境変数設定',
        changeImpact: '環境依存の動作に影響',
        confirmationRequired: true,
      },
      {
        path: 'public/**/*',
        level: 'low',
        description: '静的ファイル',
        changeImpact: '静的リソースのみに影響',
        confirmationRequired: false,
      },
    ];

    rules.forEach(rule => {
      this.rules.set(rule.path, rule);
    });

    console.log('📋 ファイル重要度ルール初期化完了');
  }

  /**
   * ファイルの重要度レベルを取得
   */
  getFileImportanceLevel(filePath: string): 'low' | 'medium' | 'high' {
    // パターンマッチングでルールを検索
    for (const [pattern, rule] of this.rules.entries()) {
      if (this.matchPattern(filePath, pattern)) {
        return rule.level;
      }
    }

    // デフォルトは medium
    return 'medium';
  }

  /**
   * ファイル変更前の確認チェック
   */
  checkChangePermission(filePath: string, reason: string): boolean {
    const rule = this.getFileRule(filePath);
    const level = this.getFileImportanceLevel(filePath);

    console.log(`\n⚠️ 【注意】ファイル変更確認`);
    console.log(`📁 ファイル: ${filePath}`);
    console.log(`🔴 重要度: ${level.toUpperCase()}`);
    console.log(`📝 説明: ${rule?.description || 'ファイル'}`);
    console.log(`💥 影響範囲: ${rule?.changeImpact || '不明'}`);
    console.log(`🎯 変更理由: ${reason}`);

    if (level === 'high') {
      console.log(`\n🚨 【HIGH RISK】この変更は慎重に行ってください！`);
      console.log(`🔍 変更前に必ず内容を確認してください`);
    } else if (level === 'medium') {
      console.log(`\n⚠️ 【MEDIUM RISK】変更内容を確認してください`);
    }

    // 変更履歴に記録
    this.recordChange(filePath, level, reason, true);

    return true; // 実際の実装では確認プロンプトを表示
  }

  /**
   * ファイルルールを取得
   */
  private getFileRule(filePath: string): FileImportanceRule | undefined {
    for (const [pattern, rule] of this.rules.entries()) {
      if (this.matchPattern(filePath, pattern)) {
        return rule;
      }
    }
    return undefined;
  }

  /**
   * パターンマッチング
   */
  private matchPattern(filePath: string, pattern: string): boolean {
    // 簡単なglobパターンマッチング
    const regexPattern = pattern
      .replace(/\*\*/g, '.*') // ** = 任意のディレクトリ階層
      .replace(/\*/g, '[^/]*') // * = 任意の文字（/ 以外）
      .replace(/\./g, '\\.'); // . = リテラルドット

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  /**
   * 変更履歴を記録
   */
  private recordChange(
    fileName: string,
    level: 'low' | 'medium' | 'high',
    reason: string,
    approved: boolean
  ): void {
    this.changeHistory.push({
      fileName,
      level,
      reason,
      approved,
      timestamp: Date.now(),
    });

    // 履歴は最新100件まで保持
    if (this.changeHistory.length > 100) {
      this.changeHistory = this.changeHistory.slice(-50);
    }
  }

  /**
   * 高リスクファイル一覧を取得
   */
  getHighRiskFiles(): string[] {
    return Array.from(this.rules.entries())
      .filter(([, rule]) => rule.level === 'high')
      .map(([pattern]) => pattern);
  }

  /**
   * 変更履歴を取得
   */
  getChangeHistory(): ChangeConfirmation[] {
    return this.changeHistory;
  }

  /**
   * ファイル統合時の影響分析
   */
  analyzeConsolidationImpact(sourceFiles: string[], targetFile: string): any {
    const impacts = sourceFiles.map(file => ({
      file,
      level: this.getFileImportanceLevel(file),
      rule: this.getFileRule(file),
    }));

    const maxLevel = impacts.reduce(
      (max, current) => {
        if (current.level === 'high') return 'high';
        if (current.level === 'medium' && max !== 'high') return 'medium';
        return max;
      },
      'low' as 'low' | 'medium' | 'high'
    );

    return {
      sourceFiles: impacts,
      targetFile,
      targetLevel: maxLevel,
      riskAssessment: maxLevel,
      requiresCarefulReview: maxLevel === 'high',
      recommendations: this.generateConsolidationRecommendations(
        impacts,
        maxLevel
      ),
    };
  }

  /**
   * 統合推奨事項を生成
   */
  private generateConsolidationRecommendations(
    _impacts: any[],
    level: 'low' | 'medium' | 'high'
  ): string[] {
    const recommendations = [];

    if (level === 'high') {
      recommendations.push('🚨 高リスク統合: 段階的に実装してください');
      recommendations.push('🔍 統合前に既存機能の完全な動作確認を実施');
      recommendations.push('💾 統合前にバックアップを作成');
      recommendations.push('🧪 統合後の包括的テストを実施');
    } else if (level === 'medium') {
      recommendations.push('⚠️ 中リスク統合: 慎重に実装してください');
      recommendations.push('🔍 関連機能の動作確認を実施');
      recommendations.push('🧪 統合後のテストを実施');
    } else {
      recommendations.push('✅ 低リスク統合: 通常通り実装可能');
      recommendations.push('🧪 基本的なテストを実施');
    }

    return recommendations;
  }
}

// グローバルインスタンス
export const fileImportanceManager = new FileImportanceManager();

// ヘルパー関数
export function checkFileChange(filePath: string, reason: string): boolean {
  return fileImportanceManager.checkChangePermission(filePath, reason);
}

export function getFileLevel(filePath: string): 'low' | 'medium' | 'high' {
  return fileImportanceManager.getFileImportanceLevel(filePath);
}

export function analyzeConsolidation(
  sourceFiles: string[],
  targetFile: string
) {
  return fileImportanceManager.analyzeConsolidationImpact(
    sourceFiles,
    targetFile
  );
}

export default fileImportanceManager;
