import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { formatDate, getCreatedAt } from '../lib/date';
import { ArrowUpRight } from 'lucide-react';

interface PostListItemProps {
  post: Post;
}

const PostListItem: React.FC<PostListItemProps> = ({ post }) => {
  return (
    <Link 
      to={`/blog/${post.slug}`}
      className="group flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-zinc-100 hover:bg-zinc-50/50 transition-all px-4 -mx-4 rounded-xl"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 flex-1">
        <div className="flex items-center gap-4 min-w-[120px]">
          <span className="text-sm font-medium text-zinc-400">
            {formatDate(getCreatedAt(post), 'yyyy.MM.dd')}
          </span>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
          {post.title}
        </h3>
      </div>
      <div className="mt-4 md:mt-0">
        <ArrowUpRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </Link>
  );
};

export default PostListItem;
