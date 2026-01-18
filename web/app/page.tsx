'use client';

import { useState, useEffect } from 'react';

interface ShortenedUrl {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  clicks: number;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchUrls = async () => {
    try {
      const response = await fetch(`${API_URL}/api/urls`);
      const data = await response.json();
      if (data.success) {
        // Construct full URL if not provided by backend
        const formattedUrls = data.urls.map((u: any) => ({
          ...u,
          shortUrl: u.shortUrl || `${API_URL}/${u.shortCode}`
        }));
        setUrls(formattedUrls);
      }
    } catch (err) {
      console.error('Failed to fetch URLs');
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      setUrl('');
      fetchUrls(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (link: string, code: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const deleteUrl = async (code: string) => {
    try {
      await fetch(`${API_URL}/api/urls/${code}`, { method: 'DELETE' });
      fetchUrls();
    } catch (err) {
      console.error('Failed to delete URL');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-indigo-100 italic-text-none">
      <main className="max-w-2xl mx-auto px-6 py-20">
        {/* Simple Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">TinyURL</h1>
          <p className="text-slate-500">Fast, minimal URL shortening.</p>
        </div>

        {/* Input Box */}
        <div className="mb-16">
          <form onSubmit={handleShorten} className="flex flex-col gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long link here..."
              required
              className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Shorten'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </div>

        {/* Links List */}
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent Links</h2>
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {urls.length === 0 ? (
              <p className="py-8 text-center text-slate-400 text-sm italic">No links generated yet.</p>
            ) : (
              urls.map((item) => (
                <div key={item.shortCode} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-indigo-600 font-medium truncate mb-1">
                      <a href={item.shortUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {item.shortUrl}
                      </a>
                    </p>
                    <p className="text-slate-400 text-xs truncate">{item.originalUrl}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      {item.clicks} clicks
                    </span>
                    <button
                      onClick={() => copyToClipboard(item.shortUrl, item.shortCode)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        copiedCode === item.shortCode
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {copiedCode === item.shortCode ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => deleteUrl(item.shortCode)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-2xl mx-auto px-6 py-10 border-t border-slate-50 text-slate-300 text-xs flex justify-between">
        <p>© 2024 TinyURL</p>
        <p>Built with Bun + Next.js</p>
      </footer>
    </div>
  );
}
