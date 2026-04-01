import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Post, Category } from '../types';
import { Plus, Edit2, Trash2, Save, X, Loader2, Upload, Lock, FileText, Globe, ArrowLeft, Calendar, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch, apiUrl } from '../lib/api';
import { formatDate, getCreatedAt } from '../lib/date';

const Admin = () => {
  const { t, refreshSettings } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ id?: number, name: string, slug: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'settings'>('posts');
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedPass = localStorage.getItem('admin_pass');
    if (savedPass) {
      setPassword(savedPass);
      handleLogin(savedPass);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
    setLoginError('');
    localStorage.removeItem('admin_pass');
  };

  const handleLogin = async (pass: string) => {
    try {
      const res = await apiFetch('/api/admin/check', {
        method: 'GET',
        headers: { 'x-admin-password': pass }
      });
      if (res.ok) {
        setIsLoggedIn(true);
        localStorage.setItem('admin_pass', pass);
        fetchData(pass);
      } else if (res.status === 403) {
        setLoginError('Invalid password');
        localStorage.removeItem('admin_pass');
      } else {
        setLoginError('Login failed');
        localStorage.removeItem('admin_pass');
      }
    } catch (err) {
      setLoginError('Login failed');
    }
  };

  const fetchData = async (_pass: string) => {
    setLoading(true);
    try {
      const [postsRes, catsRes, settingsRes] = await Promise.all([
        apiFetch('/api/posts?limit=100'),
        apiFetch('/api/categories'),
        apiFetch('/api/settings')
      ]);
      const [postsData, catsData, settingsData] = await Promise.all([
        postsRes.json(),
        catsRes.json(),
        settingsRes.ok ? settingsRes.json() : Promise.resolve({})
      ]);
      setPosts(postsData);
      setCategories(catsData);
      setSiteSettings(typeof settingsData === 'object' && settingsData !== null ? settingsData : {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await apiFetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: formData
      });
      // 백엔드/Cloudflare 연동에 따라 응답이 JSON이 아닐 수 있어 안전하게 처리합니다.
      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || `Upload failed: ${res.status}`);
      }
      if (!text) return null;
      try {
        const data = JSON.parse(text);
        // 백엔드가 url 대신 다른 키를 줄 가능성도 있어 몇 가지를 허용합니다.
        return data?.url ?? data?.fileUrl ?? data?.link ?? null;
      } catch {
        // JSON이 아니고 URL 문자열만 내려오는 경우
        return text;
      }
    } catch (err) {
      console.error('Upload failed', err);
      return null;
    }
  };

  const handleSavePost = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!editingPost) return;
    setIsSaving(true);
    
    const method = editingPost.id ? 'PUT' : 'POST';
    const url = editingPost.id ? `/api/admin/posts/${editingPost.id}` : '/api/admin/posts';
    
    try {
      const res = await apiFetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(editingPost)
      });
      if (res.ok) {
        setEditingPost(null);
        fetchData(password);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await apiFetch(`/api/admin/posts/${id}`, { 
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (res.ok) fetchData(password);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsSaving(true);
    
    try {
      const res = await apiFetch('/api/admin/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(editingCategory)
      });
      if (res.ok) {
        setEditingCategory(null);
        fetchData(password);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? All posts in this category will be uncategorized.')) return;
    try {
      const res = await apiFetch(`/api/admin/categories/${id}`, { 
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (res.ok) fetchData(password);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ settings: siteSettings })
      });
      if (res.ok) {
        alert('Settings saved!');
        refreshSettings();
        if (siteSettings.admin_password) {
          setPassword(siteSettings.admin_password);
          localStorage.setItem('admin_pass', siteSettings.admin_password);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Layout showSidebars={false}>
        <div className="max-w-md mx-auto py-24">
          <div className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-2xl shadow-zinc-200/50">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">{t('adminTitle')}</h1>
            <p className="text-zinc-500 mb-8">Please enter the administrator password.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(password); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                  required
                />
              </div>
              {loginError && <p className="text-red-500 text-sm font-medium">{loginError}</p>}
              <button
                type="submit"
                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all"
              >
                {t('login')}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) return <Layout><div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div></Layout>;

  return (
    <Layout showSidebars={false}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-zinc-900">{t('adminTitle')}</h1>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-900 underline-offset-4 hover:underline"
            >
              Logout
            </button>
          </div>
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'posts' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <FileText className="w-4 h-4" /> {t('blog')}
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'categories' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <Plus className="w-4 h-4" /> {t('categories')}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <Globe className="w-4 h-4" /> {t('siteSettings')}
            </button>
          </div>
        </div>

        {activeTab === 'posts' && editingPost ? (
          /* 글 작성/수정: PostDetail과 동일한 레이아웃으로 라이브 미리보기 편집 */
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-12"
            >
              <ArrowLeft className="w-4 h-4" /> {t('backToBlog')}
            </button>

            <article className="space-y-8">
              <header className="mb-12">
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex-wrap">
                  <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-900">
                    <select
                      value={editingPost.category_id}
                      onChange={e => setEditingPost({ ...editingPost, category_id: Number(e.target.value) })}
                      className="bg-transparent border-none text-zinc-900 font-bold cursor-pointer focus:outline-none focus:ring-0"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {editingPost.id && (editingPost as Post).created_at
                      ? formatDate(getCreatedAt(editingPost as Post), 'MMMM dd, yyyy')
                      : formatDate(Date.now() / 1000, 'MMMM dd, yyyy')}
                  </span>
                </div>
                <input
                  type="text"
                  value={editingPost.title ?? ''}
                  onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                  placeholder={t('title')}
                  className="w-full text-4xl md:text-5xl font-bold text-zinc-900 mb-8 leading-tight bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-zinc-300"
                />
              </header>

              {editingPost.thumbnail ? (
                <div className="aspect-[16/9] rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-zinc-200 relative group">
                  <img
                    src={apiUrl(editingPost.thumbnail)}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <Upload className="w-4 h-4" /> {t('uploadImage')}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setEditingPost({ ...editingPost, thumbnail: url });
                        }
                      }}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex aspect-[16/9] rounded-3xl border-2 border-dashed border-zinc-200 mb-12 items-center justify-center cursor-pointer hover:border-zinc-400 hover:bg-zinc-50/50 transition-all">
                  <span className="text-zinc-400 font-medium flex items-center gap-2">
                    <Upload className="w-6 h-6" /> {t('thumbnailUrl')} / {t('uploadImage')}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file);
                        if (url) setEditingPost({ ...editingPost, thumbnail: url });
                      }
                    }}
                  />
                </label>
              )}

              <div className="prose prose-zinc prose-lg max-w-none mb-16">
                <textarea
                  value={editingPost.content ?? ''}
                  onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder={t('content')}
                  rows={14}
                  className="w-full text-zinc-700 leading-relaxed whitespace-pre-wrap bg-transparent border-none focus:outline-none focus:ring-0 p-0 resize-y text-lg placeholder:text-zinc-300"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-8 pt-8 border-t border-zinc-100">
                {Array.isArray(editingPost.tags) && (editingPost.tags as string[]).map((tag: string, i: number) => (
                  <span key={i} className="flex items-center gap-1 text-xs font-medium text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>

              <div className="pt-8 border-t border-zinc-100 space-y-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">{t('slug')}</label>
                    <input
                      type="text"
                      value={editingPost.slug ?? ''}
                      onChange={e => setEditingPost({ ...editingPost, slug: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                      placeholder="post-url-slug"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-all"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePost}
                      disabled={isSaving}
                      className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {t('save')}</>}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        ) : activeTab === 'posts' ? (
          <>
            <div className="flex justify-end mb-8">
              <button
                onClick={() => setEditingPost({ title: '', slug: '', content: '', category_id: categories[0]?.id || 1, thumbnail: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all"
              >
                <Plus className="w-4 h-4" /> {t('addPost')}
              </button>
            </div>

            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="p-6 bg-white border border-zinc-100 rounded-2xl flex items-center justify-between group hover:border-zinc-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-50 overflow-hidden border border-zinc-100">
                      {post.thumbnail ? <img src={apiUrl(post.thumbnail)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : null}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">{post.title}</h3>
                      <p className="text-xs text-zinc-400">{post.category_name} • {post.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : activeTab === 'categories' ? (
          <>
            <div className="flex justify-end mb-8">
              <button
                onClick={() => setEditingCategory({ name: '', slug: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all"
              >
                <Plus className="w-4 h-4" /> {t('addCategory')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(category => (
                <div key={category.id} className="p-6 bg-white border border-zinc-100 rounded-2xl flex items-center justify-between group hover:border-zinc-200 transition-all">
                  <div>
                    <h3 className="font-bold text-zinc-900">{category.name}</h3>
                    <p className="text-xs text-zinc-400">{category.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-12">
            <div className="bg-white border border-zinc-100 rounded-3xl p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">English Content</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-900">Intro Title</label>
                      <input
                        type="text"
                        value={siteSettings.intro_title_en || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, intro_title_en: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-900">Intro Subtitle</label>
                      <textarea
                        rows={3}
                        value={siteSettings.intro_sub_en || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, intro_sub_en: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-900">About Text</label>
                      <textarea
                        rows={5}
                        value={siteSettings.about_text_en || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, about_text_en: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Korean Content</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-900">인트로 제목</label>
                      <input
                        type="text"
                        value={siteSettings.intro_title_ko || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, intro_title_ko: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-900">인트로 부제목</label>
                      <textarea
                        rows={3}
                        value={siteSettings.intro_sub_ko || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, intro_sub_ko: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-900">소개 텍스트</label>
                      <textarea
                        rows={5}
                        value={siteSettings.about_text_ko || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, about_text_ko: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Profile Image</h3>
                  <div className="text-sm text-zinc-500 leading-relaxed">
                    메인/소개 페이지 프로필 이미지는 현재 고정 이미지로 사용합니다. (업로드 경로 사용 안 함)
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Contact & Password</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-900">Contact Email</label>
                    <input
                      type="email"
                      value={siteSettings.contact_email || ''}
                      onChange={e => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-900">Admin Password</label>
                    <input
                      type="text"
                      value={siteSettings.admin_password || ''}
                      onChange={e => setSiteSettings({ ...siteSettings, admin_password: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Portfolio (KO)</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-900">Portfolio URL (KO)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={siteSettings.portfolio_ko || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, portfolio_ko: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                      />
                      <p className="text-[11px] text-zinc-500">
                        파일 업로드 대신 URL로 설정하면, 사용자 화면에서 해당 주소로 이동합니다.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                    {siteSettings.portfolio_ko && (
                      <a href={apiUrl(siteSettings.portfolio_ko)} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 underline truncate max-w-[180px]">현재 링크</a>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-xl cursor-pointer hover:bg-zinc-200 transition-all text-xs font-bold text-zinc-700">
                      <Upload className="w-4 h-4" />
                      {siteSettings.portfolio_ko ? '변경' : '업로드'}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) setSiteSettings({ ...siteSettings, portfolio_ko: url });
                          }
                        }}
                      />
                    </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Portfolio (EN)</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-900">Portfolio URL (EN)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={siteSettings.portfolio_en || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, portfolio_en: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                      />
                      <p className="text-[11px] text-zinc-500">
                        파일 업로드 대신 URL로 설정하면, 사용자 화면에서 해당 주소로 이동합니다.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                    {siteSettings.portfolio_en && (
                      <a href={apiUrl(siteSettings.portfolio_en)} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 underline truncate max-w-[180px]">현재 링크</a>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-xl cursor-pointer hover:bg-zinc-200 transition-all text-xs font-bold text-zinc-700">
                      <Upload className="w-4 h-4" />
                      {siteSettings.portfolio_en ? '변경' : '업로드'}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) setSiteSettings({ ...siteSettings, portfolio_en: url });
                          }
                        }}
                      />
                    </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-200"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {t('save')} {t('siteSettings')}</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingCategory && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-zinc-900">{t('addCategory')}</h2>
                <button onClick={() => setEditingCategory(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSaveCategory} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('fullName')}</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('slug')}</label>
                  <input
                    type="text"
                    value={editingCategory.slug}
                    onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {t('save')}</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-all"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
