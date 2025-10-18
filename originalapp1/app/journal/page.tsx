'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  timestamp: number;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const saveEntry = () => {
    if (!title.trim() || !content.trim()) {
      alert('タイトルと内容を入力してください');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      title: title.trim(),
      content: content.trim(),
      timestamp: Date.now()
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

    setTitle('');
    setContent('');
    alert('日誌を保存しました');
  };

  const deleteEntry = (id: string) => {
    if (confirm('この日誌を削除しますか？')) {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    }
  };

  const startEditing = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditDate(entry.date);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setEditDate('');
  };

  const saveEdit = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('タイトルと内容を入力してください');
      return;
    }

    const updatedEntries = entries.map(entry =>
      entry.id === editingId
        ? { ...entry, title: editTitle.trim(), content: editContent.trim(), date: editDate }
        : entry
    );

    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    cancelEditing();
    alert('日誌を更新しました');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/"
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold">📝 日誌</h1>
        <div className="w-24"></div>
      </div>
      
      {/* 新規投稿フォーム */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>新しい日誌を書く</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="date">日付</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              placeholder="今日のタイトル..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="content">内容</Label>
            <textarea
              id="content"
              placeholder="今日あったことを書いてみましょう..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <Button onClick={saveEntry} className="w-full">
            日誌を保存
          </Button>
        </CardContent>
      </Card>

      {/* 日誌一覧 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">これまでの日誌</h2>
        
        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              まだ日誌がありません。最初の日誌を書いてみましょう！
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {editingId === entry.id ? (
                  // 編集モード
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`edit-date-${entry.id}`}>日付</Label>
                      <Input
                        id={`edit-date-${entry.id}`}
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-title-${entry.id}`}>タイトル</Label>
                      <Input
                        id={`edit-title-${entry.id}`}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-content-${entry.id}`}>内容</Label>
                      <textarea
                        id={`edit-content-${entry.id}`}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={6}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveEdit} className="flex-1">
                        保存
                      </Button>
                      <Button onClick={cancelEditing} variant="outline" className="flex-1">
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold">{entry.title}</h3>
                        <p className="text-sm text-gray-500">{entry.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEditing(entry)}
                          variant="outline"
                          size="sm"
                        >
                          編集
                        </Button>
                        <Button
                          onClick={() => deleteEntry(entry.id)}
                          variant="destructive"
                          size="sm"
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {entry.content}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}