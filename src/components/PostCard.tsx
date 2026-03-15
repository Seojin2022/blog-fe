import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, getCreatedAt } from '../lib/date';
import { apiUrl } from '../lib/api';
import { Post } from '../types';
import { ArrowRight } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <article className="group relative bg-white border border-zinc-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">
      <Link to={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden bg-zinc-100">
        {post.thumbnail ? (
          <img
            src={apiUrl(post.thumbnail)}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : null}
      </Link>
      
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
            {post.category_name}
          </span>
          <span className="text-[10px] text-zinc-400">
            {formatDate(getCreatedAt(post), 'MMM dd, yyyy')}
          </span>
        </div>
        
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors mb-3 leading-tight">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-zinc-500 text-sm line-clamp-2 mb-6 leading-relaxed">
          {post.content}
        </p>
        
        <Link 
          to={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 group/link"
        >
          Read Article
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
};

export default PostCard;
