import React from 'react';
import { Post } from '../types';

interface TrendingTopic {
  tag: string;
  count: number;
  velocity: number;
  category: string;
  isHot?: boolean;
}

interface TrendingHashtagSidebarProps {
  posts: Post[];
  selectedHashtag: string | null;
  onSelectHashtag: (tag: string) => void;
  onClearHashtag: () => void;
}

export const TrendingHashtagSidebar: React.FC<TrendingHashtagSidebarProps> = ({
  posts,
  selectedHashtag,
  onSelectHashtag,
  onClearHashtag,
}) => {
  // Extract hashtags or calculate topic velocities from posts
  const computeTrendingTopics = (): TrendingTopic[] => {
    const topicMap: Record<string, { count: number; velocity: number; category: string }> = {
      '#VibeCode': { count: 18, velocity: 1420, category: 'Engineering' },
      '#SparkBuild': { count: 14, velocity: 980, category: 'Hardware' },
      '#AIPrototype': { count: 12, velocity: 850, category: 'AI & ML' },
      '#AudioSynthesizer': { count: 9, velocity: 620, category: 'Music' },
      '#UIUXInspiration': { count: 8, velocity: 510, category: 'Design' },
      '#NXTChallengers': { count: 6, velocity: 430, category: 'Hackathon' },
    };

    // Dynamically increment counts based on current post content and track
    posts.forEach((post) => {
      const text = `${post.projectTitle} ${post.tagline} ${post.track}`.toLowerCase();
      
      // Extract any explicitly written #hashtags in the post
      const extractedTags = (text.match(/#[a-z0-9_]+/gi) || []) as string[];
      extractedTags.forEach((rawTag) => {
        const tag = rawTag.charAt(0).toUpperCase() + rawTag.slice(1);
        if (!topicMap[tag]) {
          topicMap[tag] = { count: 1, velocity: post.vibes * 10 + post.xpBoosts * 5, category: post.track || 'Spark' };
        } else {
          topicMap[tag].count += 1;
          topicMap[tag].velocity += post.vibes * 10 + post.xpBoosts * 5;
        }
      });

      // Map tracks
      if (post.track) {
        const trackTag = `#${post.track.replace(/\s+/g, '')}`;
        if (!topicMap[trackTag]) {
          topicMap[trackTag] = { count: 1, velocity: post.vibes * 12, category: 'Track' };
        } else {
          topicMap[trackTag].count += 1;
          topicMap[trackTag].velocity += post.vibes * 12;
        }
      }
    });

    return Object.entries(topicMap)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        velocity: data.velocity,
        category: data.category,
        isHot: data.velocity > 700,
      }))
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 7);
  };

  const trendingTopics = computeTrendingTopics();

  return (
    <aside className="bg-slate-900/60 border themed-border rounded-2xl p-3.5 space-y-3 text-left shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2 themed-border">
        <div className="flex items-center space-x-2">
          <span className="text-base animate-pulse">📈</span>
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-orange-400">Trending Velocity</h4>
            <p className="text-[9px] text-slate-400">Real-time post activity topics</p>
          </div>
        </div>

        {selectedHashtag && (
          <button
            onClick={onClearHashtag}
            className="text-[9px] font-bold text-slate-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 transition-all"
          >
            Clear Filter ✕
          </button>
        )}
      </div>

      {/* Active Filter Banner if selected */}
      {selectedHashtag && (
        <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-between">
          <span className="text-[10px] font-bold text-orange-400">
            Filtering by: <strong className="text-white">{selectedHashtag}</strong>
          </span>
          <span className="text-[9px] text-slate-400">Active</span>
        </div>
      )}

      {/* Topics List */}
      <div className="space-y-1.5">
        {trendingTopics.map((topic, index) => {
          const isSelected = selectedHashtag?.toLowerCase() === topic.tag.toLowerCase();

          return (
            <div
              key={topic.tag}
              onClick={() => {
                if (isSelected) {
                  onClearHashtag();
                } else {
                  onSelectHashtag(topic.tag);
                }
              }}
              className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'bg-orange-500/20 border border-orange-500 text-white font-bold shadow-md'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="text-[10px] font-black text-slate-500 font-mono w-4">#{index + 1}</span>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <p className={`text-xs font-black truncate ${isSelected ? 'text-orange-400' : 'group-hover:text-orange-300'}`}>
                      {topic.tag}
                    </p>
                    {topic.isHot && (
                      <span className="text-[8px] bg-red-500/20 text-red-400 font-extrabold px-1 py-0.2 rounded border border-red-500/30 uppercase">
                        🔥 High
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 flex items-center space-x-2">
                    <span>{topic.count} posts</span>
                    <span>•</span>
                    <span className="text-sky-400 font-mono">{topic.category}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono font-bold text-orange-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                  ⚡ {topic.velocity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
