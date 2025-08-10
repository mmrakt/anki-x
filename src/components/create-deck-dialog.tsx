'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateDeck } from '@/lib/queries/deck';

interface CreateDeckDialogProps {
  children: React.ReactNode;
}

export function CreateDeckDialog({ children }: CreateDeckDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; general?: string }>({});

  const createDeckMutation = useCreateDeck();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors({ name: 'デッキ名は必須です' });
      return;
    }

    if (name.trim().length > 100) {
      setErrors({ name: 'デッキ名は100文字以内にしてください' });
      return;
    }

    try {
      await createDeckMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      
      // Reset form and close dialog
      setName('');
      setDescription('');
      setIsOpen(false);
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'デッキの作成に失敗しました' });
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setErrors({});
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいデッキを作成</DialogTitle>
          <DialogDescription>
            学習用の新しいデッキを作成します。デッキ名は必須です。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">デッキ名 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 英単語基礎"
                maxLength={100}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">説明（任意）</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="デッキの説明を入力してください..."
                rows={3}
              />
            </div>
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {errors.general}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createDeckMutation.isPending}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={createDeckMutation.isPending || !name.trim()}
            >
              {createDeckMutation.isPending ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}