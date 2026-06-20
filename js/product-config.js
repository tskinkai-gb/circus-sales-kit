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
    logoUrl: 'images/bownow-logo.svg',
    // ロゴカラーから抜粋したカラーパレット
    colors: {
      primary:      '#8B1A14',   // ロゴサークル クリムゾンレッド
      primaryDark:  '#6A1410',
      primaryLight: '#B82219',
      primaryBg:    '#FEF0EF',
      secondary:    '#1A1A1A',   // ロゴテキスト 深黒
      secondaryMid: '#4A4A6A',   // サブテキスト
      accent:       '#D4241C',   // CTAアクセント
      // カテゴリカラー（視認性向上のため5色）
      catA: '#E85D04',   // 課題の明確さ - オレンジ
      catB: '#2563EB',   // Webサイト・トラフィック - ブルー
      catC: '#16A34A',   // 導入・運用のしやすさ - グリーン
      catD: '#7C3AED',   // 予算フィット - パープル
      catE: '#DB2777',   // 検討熱量 - ピンク
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
        emailDomainCount: 1,
        unlimitedSites: false,
        formStepMail: false,
        scenario: false,
        customField: false,
        apiIntegration: false,
        crossDomainTracking: false,
        support: 'メール・チャット',
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
        emailDomainCount: '無制限',
        unlimitedSites: true,
        formStepMail: false,
        scenario: false,
        customField: false,
        apiIntegration: false,
        crossDomainTracking: false,
        support: 'メール・チャット・電話',
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
        emailDomainCount: '無制限',
        unlimitedSites: true,
        formStepMail: true,
        scenario: true,
        customField: true,
        apiIntegration: true,
        crossDomainTracking: false,
        support: 'メール・チャット・電話',
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
        emailDomainCount: '無制限',
        unlimitedSites: true,
        formStepMail: true,
        scenario: true,
        customField: true,
        apiIntegration: true,
        crossDomainTracking: true,
        support: 'メール・チャット・電話＋専任担当',
        highTouchSupport: '導入後1年間ハイタッチ支援',
      }
    }
  ],

  // 共通注記
  planNotes: [
    '価格はすべて税抜表記',
    '最低利用期間は1年間（フリープランを除く）',
    '「企業解析」「個人解析」のログ蓄積期間は過去2年間（フリープランを除く）',
    'リード数上限超過時は自動メールで通知。超過が15日間続くとリードの新規登録・フォーム送信履歴機能が停止',
    'リード追加費用・コンテンツ容量追加・PV追加などの有料オプションあり（詳細はお問い合わせください）',
  ],

  // 競合比較データ（概算・参考値）
  competitors: [
    {
      name: 'BowNow スタンダード',
      monthly: 36000,
      initial: 100000,
      isBownow: true,
      target: '中小BtoB企業・MA初挑戦',
      strength: '低コスト・シンプル・国産・フリー有り',
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
      strength: 'CRM統合・多機能・英語UI',
      leadsLimit: '2,000コンタクト〜',
    },
    {
      name: 'Adobe Marketo Engage',
      monthly: 300000,
      initial: 300000,
      isBownow: false,
      target: '大手企業・高度な自動化',
      strength: '高度なスコアリング・カスタマイズ性',
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
  // 各質問のIDはヒアリングシートの質問IDと共通（hearing→fitscore自動連携用）
  scoring: {
    categories: [
      {
        id: 'pain',
        name: '課題の明確さ',
        colorVar: '--cat-a',
        color: '#E85D04',
        colorBg: '#FFF4EE',
        icon: 'target',
        maxScore: 20,
        questions: [
          { id: 'pain_1', text: 'サイト訪問者が「どの企業か」を把握する手段がない', score: 5 },
          { id: 'pain_2', text: 'リードへのフォローが担当者の記憶・感覚に依存している', score: 5 },
          { id: 'pain_3', text: 'メール配信が一斉送信で、個人の関心に合わせられていない', score: 5 },
          { id: 'pain_4', text: '「今すぐ提案できる状態の見込み客」を特定する仕組みがない', score: 5 },
        ]
      },
      {
        id: 'web',
        name: 'Web・デジタル資産',
        colorVar: '--cat-b',
        color: '#2563EB',
        colorBg: '#EFF6FF',
        icon: 'globe',
        maxScore: 20,
        questions: [
          { id: 'web_1', text: '運用中の自社Webサイトがある', score: 5 },
          { id: 'web_2', text: '月間セッション数が5,000以上ある（または目標にしている）', score: 5 },
          { id: 'web_3', text: 'お問い合わせ・資料請求等のコンバージョンポイントがある', score: 5 },
          { id: 'web_4', text: 'ブログ・事例・コラム等のコンテンツを公開・更新している', score: 5 },
        ]
      },
      {
        id: 'ease',
        name: '導入・運用のしやすさ',
        colorVar: '--cat-c',
        color: '#16A34A',
        colorBg: '#F0FDF4',
        icon: 'settings',
        maxScore: 20,
        questions: [
          { id: 'ease_1', text: 'マーケ・営業推進を担当できる人材が社内にいる', score: 5 },
          { id: 'ease_2', text: '新しいクラウドツールの導入にIT部門との調整が大きな障壁にならない', score: 5 },
          { id: 'ease_3', text: 'メール・Web・SFA等のデジタルツールをすでに活用している', score: 5 },
          { id: 'ease_4', text: 'MAツールの導入について決裁者の理解・関与がある', score: 5 },
        ]
      },
      {
        id: 'budget',
        name: '予算フィット',
        colorVar: '--cat-d',
        color: '#7C3AED',
        colorBg: '#F5F3FF',
        icon: 'circle-dollar-sign',
        maxScore: 20,
        questions: [
          { id: 'budget_1', text: 'マーケティングDX・営業効率化への投資意欲がある', score: 5 },
          { id: 'budget_2', text: '月額数万円のSaaSツール導入の意思決定ができる体制がある', score: 5 },
          { id: 'budget_3', text: '現在のリード獲得・育成に「もったいない」非効率を感じている', score: 5 },
          { id: 'budget_4', text: 'まず無料で試してから判断するアプローチが取れる', score: 5 },
        ]
      },
      {
        id: 'momentum',
        name: '検討熱量・タイムライン',
        colorVar: '--cat-e',
        color: '#DB2777',
        colorBg: '#FDF2F8',
        icon: 'flame',
        maxScore: 20,
        questions: [
          { id: 'momentum_1', text: '今期中（〜3ヶ月以内）に何らかの手を打ちたい', score: 5 },
          { id: 'momentum_2', text: '他社MAツールを含め複数のソリューションを比較・検討している', score: 5 },
          { id: 'momentum_3', text: '本日の商談に決裁者または導入を進める権限のある方が参加している', score: 5 },
          { id: 'momentum_4', text: '解決したい課題が具体的な数字（リード数・商談率等）で把握できている', score: 5 },
        ]
      }
    ],
    tiers: [
      {
        min: 80, max: 100,
        label: '◎ 最優先提案',
        emoji: '🟢',
        color: '#16A34A',
        bg: '#F0FDF4',
        border: '#86EFAC',
        nextAction: 'フリープランの即日開始を提案し、スタンダード以上への移行ロードマップを共有する。初期費用・月額の試算を今日中に提示する。',
        planRecommend: 'スタンダード（まずフリーで試用 → 早期有料移行）'
      },
      {
        min: 60, max: 79,
        label: '○ 提案適切',
        emoji: '🔵',
        color: '#2563EB',
        bg: '#EFF6FF',
        border: '#93C5FD',
        nextAction: 'フリープランで実際にサイト解析・リスト取り込みを試してもらう。1〜2週間後に活用状況を確認し、有料プランのメリットを具体的に説明する。',
        planRecommend: 'フリー試用 → スタンダード'
      },
      {
        min: 40, max: 59,
        label: '△ 要育成',
        emoji: '🟡',
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FCD34D',
        nextAction: 'MAツールの必要性を感じてもらうためのコンテンツ（事例・ROI資料）を送付する。1〜2ヶ月後に再商談を設定する。',
        planRecommend: 'フリープランで課題の見える化から着手'
      },
      {
        min: 0, max: 39,
        label: '✕ 時期尚早',
        emoji: '🔴',
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FCA5A5',
        nextAction: '情報提供に留め、半年後に再接触する。メールマガジンや事例コンテンツで継続的なナーチャリングを行う。',
        planRecommend: '半年後に再提案'
      }
    ]
  },

  // ROIシミュレーター前提値
  roi: {
    laborReductionRate: 0.40,      // 工数削減率（実績事例ベース）
    leadMultiplier: 2.5,            // リード増加倍率（実績: 4〜5倍、控えめに2.5倍）
    workHourReduction: 8,           // 月間工数削減時間（実績: 月10時間削減事例ベース）

    defaults: {
      monthlyPvk: 10,
      currentLeads: 10,
      staffCount: 2,
      staffHoursPerMonth: 20,
      staffHourlyRate: 3000,
      currentEmailTool: 0,
    },

    competitorMonthly: {
      satori: 148000,
      hubspot: 96000,
    },

    assumptions: [
      'リード獲得数の増加は実績値（最大4〜5倍）をベースに控えめに2.5倍で試算',
      '工数削減は導入事例（月10時間削減）をもとに40%削減で試算',
      '初期費用はスタンダードプランの場合、12ヶ月で均して月額換算',
      '競合ツールの料金は各社公開情報をもとにした参考値（税抜・概算）',
    ]
  }
};

// 共有ステート（ヒアリングシート ↔ フィットスコア連携用）
window.BOWNOW_STATE = {
  checkedItems: {},   // { questionId: boolean }
  hearingNotes: '',
  customerInfo: {},
};

window.BOWNOW_CONFIG = BOWNOW_CONFIG;
