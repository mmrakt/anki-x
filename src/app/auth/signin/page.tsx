'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth-client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上にしてください'),
});

type AuthForm = z.infer<typeof authSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const result = await signUp.email({
          email: data.email,
          password: data.password,
          name: data.email.split('@')[0],
          callbackURL: '/'
        });

        if (result.error) {
          setError('アカウント作成に失敗しました');
        } else {
          router.push('/');
        }
      } else {
        const result = await signIn.email({
          email: data.email,
          password: data.password,
          callbackURL: '/'
        });

        if (result.error) {
          setError('サインインに失敗しました');
        } else {
          router.push('/');
        }
      }
    } catch (_err) {
      setError('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Anki-X に{isSignUp ? 'アカウント作成' : 'サインイン'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">効率的な学習を始めましょう</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="sr-only">
              メールアドレス
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="メールアドレス"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              パスワード
            </label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="パスワード"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isLoading ? `${isSignUp ? 'アカウント作成' : 'サインイン'}中...` : (isSignUp ? 'アカウント作成' : 'サインイン')}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              {isSignUp ? 'すでにアカウントをお持ちですか？サインイン' : 'アカウントをお持ちでないですか？アカウント作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
