import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PostListItem from '../components/PostListItem';
import { Post } from '../types';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '../lib/api';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10; // Increased limit for list view

  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * limit;
    const url = `/api/posts?limit=${limit}&offset=${offset}${category ? `&category=${category}` : ''}`;
    
    apiFetch(url)
      .then(res => (res.ok ? res.json() : []))
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [category, page]);

  return (
    <Layout>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">
          {category ? `Category: ${category.replace('-', ' ')}` : 'The Blog'}
        </h1>
        <p className="text-zinc-500">
          Exploring the intersection of code, design, and productivity.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-zinc-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-0 mb-16 border-t border-zinc-100">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <PostListItem post={post} />
              </motion.div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-24 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
              <p className="text-zinc-400">No posts found in this category.</p>
            </div>
          )}

          <div className="flex justify-center items-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => setSearchParams({ category, page: (page - 1).toString() })}
              className="p-2 rounded-full border border-zinc-200 disabled:opacity-30 hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-zinc-900">Page {page}</span>
            <button
              disabled={posts.length < limit}
              onClick={() => setSearchParams({ category, page: (page + 1).toString() })}
              className="p-2 rounded-full border border-zinc-200 disabled:opacity-30 hover:bg-zinc-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Blog;
