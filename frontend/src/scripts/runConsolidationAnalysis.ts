/**
 * 統合分析実行スクリプト
 * 推奨順序での統合計画分析・実行
 */

import { getRecommendedOrder, analyzePlan, getPreChecklist, getPostChecklist } from '../utils/consolidationAnalyzer'

/**
 * 統合分析の実行
 */
function runConsolidationAnalysis() {
  console.log('🚀 統合分析開始')
  console.log('=' .repeat(60))

  // 1. 推奨統合順序を取得
  console.log('\n📊 推奨統合順序を取得中...')
  const recommendedOrder = getRecommendedOrder()
  
  console.log('\n🎯 推奨統合順序:')
  recommendedOrder.forEach((plan, index) => {
    const riskIcon = plan.riskLevel === 'high' ? '🚨' : plan.riskLevel === 'medium' ? '⚠️' : '✅'
    console.log(`${index + 1}. ${riskIcon} ${plan.name} (${plan.riskLevel} risk)`)
    console.log(`   📝 ${plan.description}`)
    console.log(`   ⏱️ 期間: ${plan.timeline}`)
  })

  // 2. 最初の（最低リスク）計画を分析
  console.log('\n' + '='.repeat(60))
  console.log('🔍 第1段階統合計画の詳細分析')
  console.log('='.repeat(60))

  const firstPlan = recommendedOrder[0]
  console.log(`\n📋 分析対象: ${firstPlan.name}`)
  
  try {
    const analysis = analyzePlan(firstPlan.id)
    
    console.log('\n📊 分析結果:')
    console.log(`✅ 統合計画: ${analysis.plan.name}`)
    console.log(`📝 説明: ${analysis.plan.description}`)
    console.log(`🔴 リスクレベル: ${analysis.plan.riskLevel.toUpperCase()}`)
    console.log(`📁 対象ファイル数: ${analysis.plan.sourceFiles.length}`)
    console.log(`⏱️ 予想期間: ${analysis.plan.timeline}`)

    // 3. 統合前チェックリスト生成
    console.log('\n' + '='.repeat(60))
    console.log('📋 統合前チェックリスト')
    console.log('='.repeat(60))
    
    const preChecklist = getPreChecklist(firstPlan.id)
    preChecklist.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`)
    })

    // 4. 統合後検証リスト生成
    console.log('\n' + '='.repeat(60))
    console.log('🔍 統合後検証リスト')
    console.log('='.repeat(60))
    
    const postChecklist = getPostChecklist(firstPlan.id)
    postChecklist.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`)
    })

    // 5. 実行推奨事項
    console.log('\n' + '='.repeat(60))
    console.log('🎯 実行推奨事項')
    console.log('='.repeat(60))
    
    console.log(`\n💡 第1段階統合「${firstPlan.name}」の実行準備：`)
    console.log(`🔹 リスクレベル: ${firstPlan.riskLevel.toUpperCase()} - 安全な統合です`)
    console.log(`🔹 対象ファイル:`)
    firstPlan.sourceFiles.forEach(file => {
      console.log(`   📁 ${file}`)
    })
    console.log(`🔹 統合先: ${firstPlan.targetFile}`)
    
    console.log(`\n🚀 次のステップ:`)
    console.log(`1. 上記チェックリストの実行`)
    console.log(`2. 段階的な統合実装`)
    console.log(`3. 統合後検証の実施`)
    console.log(`4. 成功確認後、次の統合計画へ`)

    // 6. 実行確認
    console.log('\n' + '='.repeat(60))
    console.log('⚡ 実行確認')
    console.log('='.repeat(60))
    
    console.log(`\n🎯 統合準備完了`)
    console.log(`📊 分析結果: 正常`)
    console.log(`⚠️ リスクレベル: ${firstPlan.riskLevel.toUpperCase()}`)
    console.log(`✅ 実行推奨: はい`)
    
    console.log(`\n💡 推奨実行コマンド:`)
    console.log(`   第1段階統合の実行準備が完了しました。`)
    console.log(`   チェックリストを確認の上、統合作業を開始してください。`)

    return {
      success: true,
      firstPlan,
      analysis,
      preChecklist,
      postChecklist,
      recommendation: '第1段階統合の実行準備完了'
    }

  } catch (error) {
    console.error('❌ 分析エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendation: '分析を再実行してください'
    }
  }
}

// 分析実行
const result = runConsolidationAnalysis()

if (result.success) {
  console.log('\n🎉 統合分析完了 - 実行準備OK')
} else {
  console.log('\n❌ 統合分析失敗 - 再確認が必要です')
}

export default runConsolidationAnalysis