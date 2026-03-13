import { useState, useEffect } from 'react';
import { discussionsAPI } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bookmark, MessageSquare, ThumbsUp, Eye, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

export function BookmarksPage({ onViewDiscussion }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    discussionsAPI.getBookmarks()
      .then(({ data }) => setBookmarks(data.discussions || []))
      .catch(() => toast.error('Failed to load bookmarks'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    try {
      await discussionsAPI.bookmark(id);
      setBookmarks(prev => prev.filter(d => d._id !== id));
      toast.success('Bookmark removed');
    } catch { toast.error('Failed to remove bookmark'); }
  };

  const getAuthorRole = (d) => d.author?.role || d.authorRole || 'regular';

  if (loading) return <div className="text-center py-16 text-slate-400">Loading bookmarks...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bookmarks</h2>
        <p className="text-gray-600 mt-1">Saved discussions for quick access</p>
      </div>
      {bookmarks.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Bookmark className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-slate-600 font-medium">No bookmarks yet</h3>
          <p className="text-slate-400 text-sm mt-1">Save discussions to access them quickly here.</p>
        </CardContent></Card>
      ) : bookmarks.map(d => (
        <Card key={d._id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => onViewDiscussion(d)}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{d.category}</Badge>
                  {getAuthorRole(d) === 'doctor' && <Badge className="text-xs bg-green-100 text-green-700"><Stethoscope className="w-3 h-3 mr-1" /> Doctor</Badge>}
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{d.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">{d.content}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-yellow-500 shrink-0" onClick={e => handleRemove(e, d._id)}>
                <Bookmark className="w-4 h-4 fill-current" />
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {d.likes || 0}</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {d.views || 0}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
