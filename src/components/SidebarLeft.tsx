import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Hash } from 'lucide-react';
import { Category } from '../types';
import { apiFetch } from '../lib/api';

const SidebarLeft = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const currentCategory = searchParams.get('category') || '';

  useEffect(() => {
    apiFetch('/api/categories')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-8">
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 px-2">
            Categories
          </h3>
          <nav className="space-y-1">
            <Link
              to="/blog"
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all group ${
                currentCategory === '' 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Hash className={`w-4 h-4 ${currentCategory === '' ? 'text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/blog?category=${category.slug}`}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all group ${
                  currentCategory === category.slug 
                    ? 'bg-zinc-900 text-white' 
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Hash className={`w-4 h-4 ${currentCategory === category.slug ? 'text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default SidebarLeft;
