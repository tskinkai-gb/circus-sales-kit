/**
 * product-config.js
 * BowNow固有データ一元管理ファイル
 * 料金プラン改定・配点変更・ROI前提値変更はこのファイルのみ編集する
 */

const BOWNOW_CONFIG = {

  // ブランド情報
  brand: {
    name: 'BowNow',
    nameJa: 'バウナウ',
    company: 'クラウドサーカス株式会社',
    tagline: '誰でも使いこなせる、シンプルなMAツール',
    subTagline: '国内シェアNo.1 ／ 11,000社以上が導入',
    logoUrl: 'https://bow-now.jp/wp-content/themes/bownow2023/img/common/logo.svg',
    colors: {
      primary: '#FF5A00',
      primaryDark: '#CC4800',
      primaryLight: '#FF8040',
      secondary: '#1A1A2E',
      accent: '#FFF3EE',
    }
  },

  // 料金プラン（税抜）
  plans: [
    {
      id: 'free',
      name: 'フリー',
      monthly: 0,
      initial: 0,
      leadsLimit: 100,
      pvLimit: 50000,
      pvNote: '以降従量課金',
      logRetention: '直近1ヶ月のみ',
      minTerm: 'なし',
      highlight: false,
      tag: 'スモールスタート',
      features: {
        emailDelivery: '制限あり（配信上限あり）',
        emailOpenRate: false,
        emailScheduled: false,
        emailTemplate: '制限あり',
        emailDomain: 1,
        formStepMail: false,
        scenario: false,
        customField: false,
        apiIntegration: false,
        crossDomainTracking: false,
        unlimitedSites: false,
        support: 'メール・チャットサポート',
        highTouchSupport: false,
      }
    },
    {
      id: 'standard',
      name: 'スタンダード',
      monthly: 36000,
      initial: 100000,
      leadsLimit: 5000,
      pvLimit: 50000,
      pvNote: '以降従量課金',
      logRetention: '2年間分蓄積',
      minTerm: '1年間',
      highlight: true,
      tag: '最も人気',
      features: {
        emailDelivery: '制限なし（全機能対応）',
        emailOpenRate: true,
        emailScheduled: true,
        emailTemplate: '40種類以上のHTMLテンプレート',
        emailDomain: '無制限',
        formStepMail: false,
        scenario: false,
        customField: false,
        apiIntegration: false,
        crossDomainTracking: false,
        unlimitedSites: true,
        support: 'メール・チャット・電話サポート',
        highTouchSupport: false,
      }
    },
    {
      id: 'business',
      name: 'ビジネス',
      monthly: 60000,
      initial: 100000,
      leadsLimit: 10000,
      pvLimit: 50000,
      pvNote: '以降従量課金',
      logRetention: '2年間分蓄積',
      minTerm: '1年間',
      highlight: false,
      tag: '本格運用',
      features: {
        emailDelivery: '制限なし（全機能対応）',
        emailOpenRate: true,
        emailScheduled: true,
        emailTemplate: '40種類以上のHTMLテンプレート',
        emailDomain: '無制限',
        formStepMail: true,
        scenario: true,
        customField: true,
        apiIntegration: true,
        crossDomainTracking: false,
        unlimitedSites: true,
        support: 'メール・チャット・電話サポート',
        highTouchSupport: false,
      }
    },
    {
      id: 'premium',
      name: 'プレミアム',
      monthly: 100000,
      initial: 300000,
      leadsLimit: 30000,
      pvLimit: 300000,
      pvNote: '込み',
      logRetention: '2年間分蓄積',
      minTerm: '1年間',
      highlight: false,
      tag: '大規模・多拠点',
      features: {
        emailDelivery: '制限なし（全機能対応）',
        emailOpenRate: true,
        emailScheduled: true,
        emailTemplate: '40種類以上のHTMLテンプレート',
        emailDomain: '無制限',
        formStepMail: true,
        scenario: true,
        customField: true,
        apiIntegration: true,
        crossDomainTracking: true,
        unlimitedSites: true,
        support: 'メール・チャット・電話サポート＋専任担当',
        highTouchSupport: '導入後1年間ハイタッチ支援',
      }
    }
  ],

  // 共通注記
  planNotes: [
    '価格はすべて税抜表記',
    '最低利用期間は1年間（フリープランを除く）',
    '「企業解析」「個人解析」のログ蓄積期間は過去2年間（フリープランを除く）',
    'リード数上限を超過した場合は自動メールで通知。超過が15日間続くとリードの新規登録・フォーム送信履歴機能が停止する',
    'リード追加費用・コンテンツ容量追加・PV追加などの有料オプションが存在する（詳細はお問い合わせください）',
  ],

  // 競合比較データ（概算・参考値）
  competitors: [
    {
      name: 'BowNow スタンダード',
      monthly: 36000,
      initial: 100000,
      isBownow: true,
      target: '中小BtoB企業・MA初挑戦',
      strength: '低コスト・シンプル・国産',
      leadsLimit: '5,000リード',
    },
    {
      name: 'SATORI',
      monthly: 148000,
      initial: 300000,
      isBownow: false,
      target: '中堅〜大手BtoB企業',
      strength: '匿名追跡・シナリオ設計',
      leadsLimit: 'プランによる',
    },
    {
      name: 'HubSpot Marketing Professional',
      monthly: 96000,
      initial: 0,
      isBownow: false,
      target: '成長期BtoB・インバウンド重視',
      strength: 'CRM統合・多機能',
      leadsLimit: '2,000コンタクト〜',
    },
    {
      name: 'Adobe Marketo Engage',
      monthly: 300000,
      initial: 300000,
      isBownow: false,
      target: '大手企業・高度な自動化',
      strength: '高度なスコアリング・カスタマイズ',
      leadsLimit: 'プランによる',
    },
    {
      name: 'ツール未導入（現状維持）',
      monthly: 0,
      initial: 0,
      isBownow: false,
      target: '—',
      strength: '初期費用ゼロ',
      leadsLimit: '—',
      isNoTool: true,
    }
  ],

  // フィットスコア診断設定
  scoring: {
    categories: [
      {
        id: 'pain',
        name: 'A. 課題の明確さ',
        maxScore: 20,
        questions: [
          { id: 'pain_1', text: '自社サイトに訪問した企業・人物を把握できていない', score: 5 },
          { id: 'pain_2', text: 'リード（見込み客）の育成・フォローが手動・属人的になっている', score: 5 },
          { id: 'pain_3', text: 'メール配信が手作業で、開封・クリック状況を把握できていない', score: 5 },
          { id: 'pain_4', text: '営業とマーケティングの間で、どの案件が「ホット」か共有できていない', score: 5 },
        ]
      },
      {
        id: 'web',
        name: 'B. Webサイト・トラフィック状況',
        maxScore: 20,
        questions: [
          { id: 'web_1', text: '自社Webサイトが存在する', score: 5 },
          { id: 'web_2', text: '月間PVが5,000以上ある（または増加傾向にある）', score: 5 },
          { id: 'web_3', text: '問い合わせフォームや資料請求フォームが設置されている', score: 5 },
          { id: 'web_4', text: 'コンテンツ（ブログ・事例・LP等）を定期的に更新している', score: 5 },
        ]
      },
      {
        id: 'ease',
        name: 'C. 導入・運用のしやすさ',
        maxScore: 20,
        questions: [
          { id: 'ease_1', text: 'マーケ専任でなくてもツール設定ができる人材がいる', score: 5 },
          { id: 'ease_2', text: '社内IT環境への追加ツール導入に大きな障壁がない', score: 5 },
          { id: 'ease_3', text: 'クラウドサービスの導入実績がある（他SaaS利用中）', score: 5 },
          { id: 'ease_4', text: '決裁者がMAツールの必要性を認識している（または説明済み）', score: 5 },
        ]
      },
      {
        id: 'budget',
        name: 'D. 予算フィット',
        maxScore: 20,
        questions: [
          { id: 'budget_1', text: '月額3〜6万円程度の予算が確保できる（またはできそう）', score: 5 },
          { id: 'budget_2', text: '初期費用10万円程度の社内稟議が通る見込みがある', score: 5 },
          { id: 'budget_3', text: '現在のリード獲得コスト・営業工数を削減したいという意識がある', score: 5 },
          { id: 'budget_4', text: 'まず無料で試してから判断したいというスタンスである', score: 5 },
        ]
      },
      {
        id: 'momentum',
        name: 'E. 検討熱量・タイムライン',
        maxScore: 20,
        questions: [
          { id: 'momentum_1', text: '今四半期または今期中に導入を検討している', score: 5 },
          { id: 'momentum_2', text: '複数のMAツールを比較検討中である', score: 5 },
          { id: 'momentum_3', text: '決裁者または導入キーマンが本日の商談に同席している', score: 5 },
          { id: 'momentum_4', text: '具体的な課題（例：リード数が月X件）を数字で把握している', score: 5 },
        ]
      }
    ],
    tiers: [
      {
        min: 80, max: 100,
        label: '◎ 最優先提案',
        color: '#16a34a',
        bg: '#f0fdf4',
        nextAction: 'フリープランの即日開始を提案し、スタンダード以上への移行ロードマップを共有する。初期費用・月額の試算を今日中に提示する。',
        planRecommend: 'スタンダード（まずフリーで試用 → 早期有料移行）'
      },
      {
        min: 60, max: 79,
        label: '○ 提案適切',
        color: '#2563eb',
        bg: '#eff6ff',
        nextAction: 'フリープランで実際にサイト解析・リスト取り込みを試してもらう。1〜2週間後に活用状況を確認し、有料プランのメリットを具体的に説明する。',
        planRecommend: 'フリー試用 → スタンダード'
      },
      {
        min: 40, max: 59,
        label: '△ 要育成',
        color: '#d97706',
        bg: '#fffbeb',
        nextAction: 'MAツールの必要性を感じてもらうためのコンテンツ（事例・ROI資料）を送付する。1〜2ヶ月後に再商談を設定する。',
        planRecommend: 'フリープランで課題の見える化から着手'
      },
      {
        min: 0, max: 39,
        label: '✕ 時期尚早',
        color: '#dc2626',
        bg: '#fef2f2',
        nextAction: '情報提供に留め、半年後に再接触する。メールマガジンや事例コンテンツで継続的なナーチャリングを行う。',
        planRecommend: '半年後に再提案'
      }
    ]
  },

  // ROIシミュレーター前提値
  roi: {
    // BowNow実績ベースの効率化想定
    leadMultiplier: 2.5,           // リード獲得数の増加倍率（実績: 4〜5倍、控えめに2.5倍）
    workHourReduction: 8,          // 月間工数削減時間（実績: 月10時間削減事例ベース）
    hotLeadConversionBoost: 1.5,   // ホットリード商談化率向上倍率（リードスコアリング活用時）

    // デフォルト入力値
    defaults: {
      monthlyPvk: 10,       // 月間PV（千単位）デフォルト: 10,000PV
      currentLeads: 10,     // 月間新規リード数（現状）
      staffCount: 2,        // リードフォロー担当者数
      staffHoursPerMonth: 20, // 1人あたり月間フォロー工数（時間）
      staffHourlyRate: 3000, // 担当者の時給換算（円）
      currentEmailTool: 0,  // 現在のメール配信ツール月額
    },

    // 比較する競合ツールの参考月額（概算）
    competitorMonthly: {
      satori: 148000,
      hubspot: 96000,
    },

    // 計算式の前提テキスト（ユーザーへの説明用）
    assumptions: [
      'リード獲得数の増加は実績値（最大4〜5倍）をベースに控えめに2.5倍で試算',
      '工数削減は導入事例（月10時間削減）をもとに試算',
      '初期費用はスタンダードプランの場合、12ヶ月で均して月額換算',
      '競合ツールの料金は各社公開情報をもとにした参考値（税抜・概算）',
    ]
  }
};

// グローバルに公開
window.BOWNOW_CONFIG = BOWNOW_CONFIG;
