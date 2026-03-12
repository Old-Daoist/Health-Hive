import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { discussionsAPI } from '../services/api';
import { socket } from "../services/socket";

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';

import { Checkbox } from './ui/checkbox';

import {
  MessageSquare,
  Plus,
  Stethoscope,
  ThumbsUp,
  User as UserIcon,
  Eye,
  Search
} from 'lucide-react';

import { toast } from 'sonner';

const commonSymptoms = [
  'Headache','Fever','Cough','Fatigue','Nausea','Dizziness','Anxiety',
  'Insomnia','Rash','Back Pain','Joint Pain','Sore Throat','Chest Pain',
  'Shortness of Breath','Stomach Pain','Diarrhea','Vomiting','Chills',
];

export function DiscussionList({ discussions, setDiscussions, categories, onViewDiscussion }) {

  const { user } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: 'General Health',
    tags: '',
    symptoms: []
  });

  /* ===========================
     SOCKET REAL-TIME EVENTS
  =========================== */

  useEffect(() => {

    socket.on("newDiscussion", (discussion) => {
      setDiscussions(prev => [discussion, ...prev]);
    });

    socket.on("newReply", (reply) => {
      setDiscussions(prev =>
        prev.map(d =>
          d._id === reply.discussion
            ? { ...d, replyCount: (d.replyCount || 0) + 1 }
            : d
        )
      );
    });

    return () => {
      socket.off("newDiscussion");
      socket.off("newReply");
    };

  }, [setDiscussions]);


  /* ===========================
     CREATE DISCUSSION
  =========================== */

  const handleCreate = async () => {

    if (!newDiscussion.title || !newDiscussion.content) {
      return toast.error('Title and content are required');
    }

    if (newDiscussion.symptoms.length === 0) {
      return toast.error('Select at least one symptom');
    }

    setSubmitting(true);

    try {

      const { data } = await discussionsAPI.create({
        title: newDiscussion.title,
        content: newDiscussion.content,
        category: newDiscussion.category,
        tags: newDiscussion.tags.split(',').map(t => t.trim()).filter(Boolean),
        symptoms: newDiscussion.symptoms,
      });

      setDiscussions(prev => [data.discussion, ...prev]);

      setNewDiscussion({
        title: '',
        content: '',
        category: 'General Health',
        tags: '',
        symptoms: []
      });

      setIsDialogOpen(false);

      toast.success('Discussion posted!');

    } catch (err) {

      toast.error(err.response?.data?.message || 'Failed to create discussion');

    } finally {

      setSubmitting(false);

    }
  };


  /* ===========================
     TOGGLE SYMPTOMS
  =========================== */

  const toggleSymptom = (s) => {

    setNewDiscussion(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s)
        ? prev.symptoms.filter(x => x !== s)
        : [...prev.symptoms, s],
    }));

  };


  /* ===========================
     LIKE DISCUSSION
  =========================== */

  const handleLike = async (e, id) => {

    e.stopPropagation();

    if (!user) return toast.error('Login to like');

    try {

      const { data } = await discussionsAPI.like(id);

      setDiscussions(prev =>
        prev.map(d =>
          d._id === id
            ? { ...d, likes: data.likes, isLiked: data.isLiked }
            : d
        )
      );

    } catch {

      toast.error('Failed to like');

    }
  };


  const getAuthorName = (d) => {
  if (d.author?.firstName) {
    return `${d.author.firstName} ${d.author.lastName}`;
  }
  return "Unknown User";
};

  const getAuthorRole = (d) => d.author?.role || d.authorRole || 'regular';


  const filtered = discussions.filter(d =>
    !searchQuery ||
    d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discussions</h2>
          <p className="text-gray-500 mt-1">Join the conversation with the community</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

          <DialogTrigger asChild>
            <Button className="gap-2 bg-linear-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4" /> New Discussion
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

            <DialogHeader>
              <DialogTitle>Start a Discussion</DialogTitle>
              <DialogDescription>
                Share your health question or experience
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="What's your health question?"
                  value={newDiscussion.title}
                  onChange={e => setNewDiscussion({
                    ...newDiscussion,
                    title: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">

                <Label>Category *</Label>

                <Select
                  value={newDiscussion.category}
                  onValueChange={v =>
                    setNewDiscussion({
                      ...newDiscussion,
                      category: v
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>

                </Select>

              </div>

              <div className="space-y-2">

                <Label>Description *</Label>

                <Textarea
                  placeholder="Describe your situation in detail..."
                  rows={4}
                  value={newDiscussion.content}
                  onChange={e =>
                    setNewDiscussion({
                      ...newDiscussion,
                      content: e.target.value
                    })
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>Symptoms (select all that apply)</Label>

                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-slate-50">

                  {commonSymptoms.map(s => (

                    <label key={s} className="flex items-center gap-1.5 cursor-pointer">

                      <Checkbox
                        checked={newDiscussion.symptoms.includes(s)}
                        onCheckedChange={() => toggleSymptom(s)}
                      />

                      <span className="text-sm">{s}</span>

                    </label>

                  ))}

                </div>

              </div>

              <div className="space-y-2">

                <Label>Tags (comma separated)</Label>

                <Input
                  placeholder="e.g. headache, workout, hydration"
                  value={newDiscussion.tags}
                  onChange={e =>
                    setNewDiscussion({
                      ...newDiscussion,
                      tags: e.target.value
                    })
                  }
                />

              </div>

            </div>

            <DialogFooter>

              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={handleCreate}
                disabled={submitting}
                className="bg-linear-to-r from-blue-600 to-indigo-600"
              >
                {submitting ? 'Posting...' : 'Post Discussion'}
              </Button>

            </DialogFooter>

          </DialogContent>

        </Dialog>

      </div>

      <div className="relative">

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <Input
          placeholder="Search discussions..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />

      </div>

      <div className="space-y-3">

        {filtered.length === 0 ? (

          <Card>

            <CardContent className="py-16 text-center">

              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />

              <h3 className="text-slate-600 font-medium">
                No discussions yet
              </h3>

              <p className="text-slate-400 text-sm mt-1">
                Be the first to start a conversation!
              </p>

            </CardContent>

          </Card>

        ) : filtered.map(d => (

          <Card
            key={d._id}
            className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
            onClick={() => onViewDiscussion(d)}
          >

            <CardContent className="p-5">

              <div className="flex items-center gap-2 mb-2 flex-wrap">

                <Badge variant="outline" className="text-xs">
                  {d.category}
                </Badge>

                {getAuthorRole(d) === 'doctor' && (
                  <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                    <Stethoscope className="w-3 h-3 mr-1" /> Doctor
                  </Badge>
                )}

              </div>

              <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">
                {d.title}
              </h3>

              <p className="text-slate-500 text-sm line-clamp-2">
                {d.content}
              </p>

              {d.symptoms?.length > 0 && (

                <div className="flex gap-1 flex-wrap mt-2">

                  {d.symptoms.slice(0, 3).map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}

                  {d.symptoms.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{d.symptoms.length - 3}
                    </Badge>
                  )}

                </div>

              )}

              <div className="flex items-center justify-between mt-4 text-xs text-slate-400">

                <div className="flex items-center gap-1">

                  {getAuthorRole(d) === 'doctor'
                    ? <Stethoscope className="w-3 h-3" />
                    : <UserIcon className="w-3 h-3" />
                  }

                  <span>{getAuthorName(d)}</span>

                </div>

                <div className="flex items-center gap-4">

                  <button
                    onClick={e => handleLike(e, d._id)}
                    className={`flex items-center gap-1 transition-colors ${
                      d.isLiked ? 'text-blue-600' : 'hover:text-blue-600'
                    }`}
                  >

                    <ThumbsUp className="w-3.5 h-3.5" />

                    {d.likes || 0}

                  </button>

                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> {d.replyCount || 0}
                  </span>

                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {d.views || 0}
                  </span>

                </div>

              </div>

            </CardContent>

          </Card>

        ))}

      </div>

    </div>
  );
}