#!/bin/bash

# Simple startup script for the advertising integration tool

echo "=========================================="
echo "  広告運用自動レポートツール"
echo "  Advertising Integration Tool"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env ファイルが見つかりません"
    echo "   .env.example をコピーして .env を作成し、APIキーを設定してください："
    echo ""
    echo "   cp .env.example .env"
    echo ""
    exit 1
fi

# Check if virtual environment exists
if [ ! -d venv ]; then
    echo "📦 仮想環境を作成しています..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 仮想環境を有効化しています..."
source venv/bin/activate

# Install dependencies
echo "📥 依存パッケージをインストールしています..."
pip install -q -r requirements.txt

echo ""
echo "✅ 準備完了！"
echo ""
echo "実行モードを選択してください："
echo "  1) テスト（接続確認）"
echo "  2) 今すぐレポート生成"
echo "  3) スケジュール実行"
echo ""
read -p "選択 (1-3): " mode

cd src

case $mode in
    1)
        echo ""
        echo "🧪 テストモードで実行します..."
        python main.py --mode test
        ;;
    2)
        echo ""
        echo "📊 レポートを生成します..."
        python main.py --mode run-now
        ;;
    3)
        echo ""
        echo "⏰ スケジュール実行を開始します..."
        echo "   （Ctrl+C で停止）"
        python main.py --mode schedule
        ;;
    *)
        echo "無効な選択です"
        exit 1
        ;;
esac
