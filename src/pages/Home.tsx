import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PostListItem from '../components/PostListItem';
import { Post } from '../types';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch, apiUrl } from '../lib/api';

const Home = () => {
  const { t, settings } = useLanguage();
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);

  useEffect(() => {
    apiFetch('/api/posts?limit=5')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setLatestPosts(Array.isArray(data) ? data : []))
      .catch(() => setLatestPosts([]));
  }, []);

  return (
    <Layout>
      <section className="mb-32 mt-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 mb-12 leading-[0.9]">
            Think, Code,<br />
            and <span className="text-zinc-500 italic">Write.</span>
          </h1>
          
          <div className="flex items-center gap-4 mb-12">
            <img 
              src={settings.profile_image ? apiUrl(settings.profile_image) : "https://picsum.photos/seed/seojin/200/200"} 
              alt="Profile" 
              className="w-12 h-12 rounded-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
            <span className="text-lg font-bold text-zinc-900">Seojin Lee</span>
          </div>

          <p className="text-base md:text-lg text-zinc-500 max-w-3xl leading-relaxed font-medium opacity-90">
            {t('intro_sub')}
          </p>
        </motion.div>
      </section>

      <section className="mb-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 mb-2">{t('latestPosts')}</h2>
            <p className="text-zinc-500">Thoughts on development, design, and technology.</p>
          </div>
          <Link to="/blog" className="text-sm font-bold text-zinc-900 flex items-center gap-2 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-0 border-t border-zinc-100">
          {latestPosts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Home;
