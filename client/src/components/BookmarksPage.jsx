import { useState, useEffect, useRef, useCallback } from 'react';
import { discussionsAPI } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Bookmark, ThumbsUp, Eye, Stethoscope, Search, ArrowUp, X } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 15;

export function BookmarksPage({ onViewDiscussion }) {
  const [allBookmarks, setAllBookmarks] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    discussionsAPI.getBookmarks()
      .then(({ data }) => setAllBookmarks(data.discussions || []))
      .catch(() => toast.error('Failed to load bookmarks'))
      .finally(() => setLoading(false));
  }, []);

  // Reset pagination when search changes
  useEffect(() => { setPage(1); }, [search]);

  // Track scroll position inside the panel
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setShowScrollTop(scrollRef.current.scrollTop > 300);
    }
  }, []);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    try {
      await discussionsAPI.bookmark(id);
      setAllBookmarks(prev => prev.filter(d => d._id !== id));
      toast.success('Bookmark removed');
    } catch { toast.error('Failed to remove bookmark'); }
  };

  const getAuthorRole = (d) => d.author?.role || d.authorRole || 'regular';

  // Filter + paginate
  const filtered = allBookmarks.filter(d =>
    !search ||
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.category?.toLowerCase().includes(search.toLowerCase()) ||
    d.content?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    // Fixed-height scrollable panel — its own independent window
    <div className="flex flex-col h-[calc(100vh-88px)] bg-white/50 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bookmarks</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {allBookmarks.length} saved discussion{allBookmarks.length !== 1 ? 's' : ''}
            </p>
          </div>
          {allBookmarks.length > 0 && (
            <Badge variant="outline" className="text-xs text-slate-500">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Search */}
        {allBookmarks.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search bookmarks…"
              className="pl-9 pr-8 h-9 text-sm border-slate-200 focus:border-blue-400 bg-slate-50 focus:bg-white"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Scrollable list ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
      >
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600/30 border-t-blue-600" />
          </div>
        ) : allBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-600 mb-1">No bookmarks yet</h3>
            <p className="text-slate-400 text-sm">Save discussions to access them quickly here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <Search className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No results for "{search}"</p>
            <button onClick={() => setSearch('')} className="text-sm text-blue-600 mt-1 hover:underline">Clear search</button>
          </div>
        ) : (
          <>
            {paginated.map(d => (
              <Card key={d._id}
                className="cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200 border-slate-100"
                onClick={() => onViewDiscussion(d)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50/50">{d.category}</Badge>
                        {getAuthorRole(d) === 'doctor' && (
                          <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                            <Stethoscope className="w-3 h-3" /> Doctor
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">{d.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{d.content}</p>
                    </div>
                    <button
                      onClick={e => handleRemove(e, d._id)}
                      className="p-1.5 text-amber-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all shrink-0"
                      title="Remove bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" />{d.likes || 0}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{d.views || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 pb-1 border-t border-slate-100">
                <Button variant="outline" size="sm" disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); scrollToTop(); }}
                  className="h-8 text-xs">
                  ← Previous
                </Button>
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); scrollToTop(); }}
                  className="h-8 text-xs">
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Back to top button (inside the panel) ── */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-6 right-6 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
          title="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}