import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Anki-X</h1>
          <p className="text-xl text-gray-600 mb-8">スペースドリピティション学習プラットフォーム</p>
          <div className="space-x-4">
            <Link href="/auth/signin">
              <Button size="lg">サインイン</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                ダッシュボード
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>効率的な学習</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                SM-2アルゴリズムベースの復習スケジューリングで、最適なタイミングで復習できます。
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>カスタムデッキ</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                自分だけの単語帳を作成し、好きな内容で学習を進められます。
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>進捗管理</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                学習の進捗をグラフで可視化し、モチベーションを維持できます。
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
