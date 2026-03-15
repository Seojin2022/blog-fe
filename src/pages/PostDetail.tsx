import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Post } from '../types';
import { formatDate, getCreatedAt } from '../lib/date';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { apiFetch, apiUrl } from '../lib/api';

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiFetch(`/api/posts/${slug}`)
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        setPost(data ?? null);
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Layout><div className="animate-pulse h-screen bg-zinc-50 rounded-3xl" /></Layout>;
  if (!post) return <Layout><div>Post not found</div></Layout>;

  return (
    <Layout showSidebars={false}>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">
            {(post.category_name ?? post.categoryName) && (
              <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-900">{post.category_name ?? post.categoryName}</span>
            )}
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(getCreatedAt(post), 'MMMM dd, yyyy')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-8 leading-tight">
            {post.title}
          </h1>
        </header>

        {post.thumbnail ? (
          <div className="aspect-[16/9] rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-zinc-200">
            <img 
              src={apiUrl(post.thumbnail)} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : null}

        <div className="prose prose-zinc prose-lg max-w-none mb-16">
          <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {post.content ?? ''}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-16 pt-8 border-t border-zinc-100">
          {Array.isArray(post.tags) && post.tags.map((tag: string) => (
            <span key={tag} className="flex items-center gap-1 text-xs font-medium text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
              <Tag className="w-3 h-3" /> {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-zinc-100">
          {post.prev && (
            <Link to={`/blog/${post.prev.slug}`} className="group p-6 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Previous Post</p>
              <h4 className="text-sm font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">{post.prev.title}</h4>
            </Link>
          )}
          {post.next && (
            <Link to={`/blog/${post.next.slug}`} className="group p-6 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-all text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Next Post</p>
              <h4 className="text-sm font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">{post.next.title}</h4>
            </Link>
          )}
        </div>
      </motion.article>
    </Layout>
  );
};

export default PostDetail;
