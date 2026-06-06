import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight, Upload, Heart, Video, Image, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function FeederMyDogsTab({ feederProfile, user }) {
  const queryClient = useQueryClient();

  // Bio & Updates
  const [bio, setBio] = useState('');
  const [update, setUpdate] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  // Photo carousel
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Social post
  const [postCaption, setPostCaption] = useState('');
  const [postMedia, setPostMedia] = useState('');
  const [uploadingPost, setUploadingPost] = useState(false);
  const [posting, setPosting] = useState(false);

  const { data: feedingPhotos = [] } = useQuery({
    queryKey: ['feedingPhotos', feederProfile?.city],
    queryFn: async () => base44.entities.FeedingMedia.filter({ location: `${feederProfile.city}, ${feederProfile.country}` }, '-created_date', 20),
    enabled: !!feederProfile
  });

  const { data: socialPosts = [] } = useQuery({
    queryKey: ['socialPosts', user?.email],
    queryFn: async () => base44.entities.SocialPost.filter({ user_email: user.email }, '-created_date', 20),
    enabled: !!user?.email
  });

  const handleUploadCarouselPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.FeedingMedia.create({
        title: 'Dog photo',
        media_url: file_url,
        media_type: 'photo',
        location: `${feederProfile.city}, ${feederProfile.country}`,
        dogs_fed: 1
      });
      toast.success('Photo added!');
      queryClient.invalidateQueries({ queryKey: ['feedingPhotos'] });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUploadPostMedia = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPost(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPostMedia(file_url);
      toast.success('Media uploaded!');
    } finally {
      setUploadingPost(false);
    }
  };

  const handlePost = async () => {
    if (!postCaption && !postMedia) return;
    setPosting(true);
    try {
      await base44.entities.SocialPost.create({
        user_email: user.email,
        user_name: feederProfile.feeder_name,
        post_type: 'update',
        content: postCaption,
        avatar_url: postMedia || undefined
      });
      toast.success('Posted!');
      setPostCaption('');
      setPostMedia('');
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    } finally {
      setPosting(false);
    }
  };

  const prevPhoto = () => setCarouselIndex(i => Math.max(0, i - 1));
  const nextPhoto = () => setCarouselIndex(i => Math.min(feedingPhotos.length - 1, i + 1));

  return (
    <div className="px-6 pb-8 space-y-6">

      {/* Photo Carousel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-emerald-50">
          <h3 className="font-bold text-emerald-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-emerald-500" /> Feeding Photos
          </h3>
        </div>

        {feedingPhotos.length > 0 ? (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={carouselIndex}
                src={feedingPhotos[carouselIndex]?.media_url}
                alt="Feeding"
                className="w-full h-64 object-cover"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
            {feedingPhotos.length > 1 && (
              <>
                <button onClick={prevPhoto} disabled={carouselIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 disabled:opacity-30">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextPhoto} disabled={carouselIndex === feedingPhotos.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 disabled:opacity-30">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {feedingPhotos.map((_, i) => (
                    <button key={i} onClick={() => setCarouselIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
            <div className="absolute bottom-2 right-12 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {carouselIndex + 1} / {feedingPhotos.length}
            </div>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-emerald-400">
            <Camera className="w-10 h-10 mb-2" />
            <p className="text-sm">No photos yet</p>
          </div>
        )}

        <div className="p-4">
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-emerald-200 rounded-xl py-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
            <input type="file" accept="image/*" className="hidden" onChange={handleUploadCarouselPhoto} disabled={uploadingPhoto} />
            {uploadingPhoto ? (
              <span className="text-sm text-emerald-500 animate-pulse">Uploading...</span>
            ) : (
              <><Upload className="w-4 h-4 text-emerald-500" /><span className="text-sm text-emerald-600 font-medium">Upload feeding photo</span></>
            )}
          </label>
        </div>
      </motion.div>

      {/* Bio & Updates */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
        <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-rose-400" /> Dog Bio & Updates
        </h3>

        <div className="mb-4">
          <label className="text-sm font-medium text-emerald-800 block mb-1">Dog Bio</label>
          <Textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Write about the dog's personality, story, and daily life..."
            className="border-emerald-200 resize-none h-24"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-emerald-800 block mb-1">Latest Update</label>
          <Textarea
            value={update}
            onChange={e => setUpdate(e.target.value)}
            placeholder="Share the latest news about the dog — health, mood, weight gain..."
            className="border-emerald-200 resize-none h-20"
          />
        </div>

        <Button
          onClick={async () => {
            setSavingBio(true);
            await base44.entities.SocialPost.create({
              user_email: user.email,
              user_name: feederProfile.feeder_name,
              post_type: 'update',
              content: `📖 Bio: ${bio}\n\n📢 Update: ${update}`
            });
            toast.success('Bio & update saved!');
            setBio('');
            setUpdate('');
            setSavingBio(false);
            queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
          }}
          disabled={savingBio || (!bio && !update)}
          className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 py-3 rounded-xl font-semibold">
          {savingBio ? 'Saving...' : 'Save Bio & Update'}
        </Button>
      </motion.div>

      {/* Social Posts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
        <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4">
          <Video className="w-5 h-5 text-purple-400" /> Social Post
        </h3>

        <div className="mb-3">
          <Textarea
            value={postCaption}
            onChange={e => setPostCaption(e.target.value)}
            placeholder="Write a caption for your post..."
            className="border-emerald-200 resize-none h-20"
          />
        </div>

        {postMedia ? (
          <div className="relative rounded-xl overflow-hidden mb-3">
            <img src={postMedia} alt="Post media" className="w-full h-48 object-cover" />
            <button onClick={() => setPostMedia('')}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 text-xs w-6 h-6 flex items-center justify-center">✕</button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-purple-200 rounded-xl py-3 cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all mb-3">
            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUploadPostMedia} disabled={uploadingPost} />
            {uploadingPost ? (
              <span className="text-sm text-purple-500 animate-pulse">Uploading...</span>
            ) : (
              <><Camera className="w-4 h-4 text-purple-400" /><span className="text-sm text-purple-600 font-medium">Add photo or video</span></>
            )}
          </label>
        )}

        <Button onClick={handlePost} disabled={posting || (!postCaption && !postMedia)}
          className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 py-3 rounded-xl font-semibold">
          {posting ? 'Posting...' : <><Send className="w-4 h-4 mr-2" />Post</>}
        </Button>

        {/* Feed */}
        {socialPosts.length > 0 && (
          <div className="mt-5 space-y-3">
            <h4 className="font-semibold text-emerald-800 text-sm">Your Posts</h4>
            {socialPosts.map(post => (
              <div key={post.id} className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                {post.avatar_url && (
                  <img src={post.avatar_url} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />
                )}
                <p className="text-sm text-emerald-800">{post.content}</p>
                <p className="text-xs text-emerald-500 mt-1">{new Date(post.created_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}