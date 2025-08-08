# Create Work Log Command

## Purpose
作業内容を構造化されたマークダウンファイルとして記録するカスタムコマンド

## Usage
```
/create-log [task-name] [optional: description]
```

## Command Instructions

### 1. Log File Creation
- **保存場所**: `.claude/logs/`ディレクトリ
- **ファイル名**: `{task-name}-{YYYY-MM-DD}.md`形式
- **日付**: 実行日を自動で付与

### 2. Required Markdown Structure

```markdown
# [Task Title] - YYYY-MM-DD

## Overview
作業の概要を1-2文で記述

## Tasks Completed

### 1. [Task Category 1]
- **対象**: ファイル名やコンポーネント名
- **実装内容**:
  - 具体的な変更内容
  - 追加した機能
  - 修正した問題

### 2. [Task Category 2]
- **対象**: 
- **実装内容**:

## Technical Issues Fixed

### 1. [Issue Title]
- **問題**: 発生していた問題の詳細
- **解決**: 採用した解決方法と理由

### 2. [Issue Title]
- **問題**: 
- **解決**: 

## File Structure Created/Modified

```
path/to/files/
├── file1.ext          # 説明
├── file2.ext          # 説明
└── directory/
    ├── file3.ext      # 説明
    └── file4.ext      # 説明
```

## Key Features Implemented

### 1. [Feature Name]
- 機能の詳細説明
- 技術的な実装方法
- 特徴やメリット

### 2. [Feature Name]
- 機能の詳細説明

## Configuration Updates

### [Config Type] (e.g., Tailwind CSS, TypeScript, etc.)
```language
// 設定ファイルの変更内容をコードブロックで
```

## Content Structure (if applicable)
データ構造やスキーマの変更がある場合に記載

## Lessons Learned

1. **[カテゴリ]**: 学んだ内容や知見
2. **[カテゴリ]**: 注意点や改善点
3. **[カテゴリ]**: ベストプラクティス

## Future Improvements

1. 今後の改善予定
2. 追加したい機能
3. リファクタリング対象

---

**作業時間**: 約X時間  
**主要技術**: 使用した技術スタック  
**パフォーマンス**: パフォーマンスに関する特記事項
```

### 3. Content Guidelines

#### Overview Section
- 作業の目的と成果を簡潔に記述
- 技術的な背景や文脈を含める

#### Tasks Completed Section
- 実装した機能や変更を分類して整理
- ファイル名やコンポーネント名を明記
- 具体的な変更内容を箇条書きで記載

#### Technical Issues Fixed Section
- 遭遇した問題とその解決方法を記録
- 問題の原因と採用した解決策の理由を明記
- 今後同様の問題を避けるための知見を記載

#### File Structure Section
- 作成・変更されたファイル構造を視覚的に表示
- 各ファイルの役割や目的をコメントで説明

#### Key Features Section
- 実装した主要機能の技術的詳細
- 設計思想や実装上の工夫点
- ユーザーへの価値提供内容

#### Configuration Updates Section
- 設定ファイルの変更内容をコードブロックで記載
- 変更理由と影響範囲を説明

#### Lessons Learned Section
- 作業を通じて得られた技術的知見
- 改善点や注意すべきポイント
- 再利用可能なベストプラクティス

#### Future Improvements Section
- 今後の開発計画や改善予定
- 技術的負債や課題
- 機能拡張の方向性

### 4. Execution Steps

1. **情報収集**
   - git logで変更されたファイルを確認
   - 主要な変更内容を整理
   - 解決した問題や追加した機能を洗い出し

2. **構造化**
   - 変更内容をカテゴリ別に分類
   - 技術的な問題と解決策をペアで整理
   - ファイル構造の変更を図式化

3. **文書作成**
   - 上記のテンプレートに従ってマークダウンを作成
   - コードブロックや図表を適切に使用
   - 読みやすさと検索性を重視

4. **保存・確認**
   - `.claude/logs/`ディレクトリに保存
   - ファイル名の命名規則に従う
   - 内容の正確性と完成度を確認

### 5. Best Practices

- **具体性**: 抽象的な表現を避け、具体的な変更内容を記載
- **再現性**: 他の開発者が理解できる詳細レベルを維持
- **検索性**: キーワードやタグを意識した記述
- **継続性**: 一貫したフォーマットとスタイルを維持
- **価値提供**: 将来の開発に役立つ情報を重視

### 6. Example Usage

```bash
# 基本的な使用例
/create-log auth-system "ユーザー認証システムの実装"

# 生成されるファイル
.claude/logs/auth-system-2025-07-03.md
```

---

このコマンドを使用することで、作業内容の体系的な記録と知識の蓄積が可能になります。