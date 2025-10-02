
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { loadChannelsFromStorage, categorizeChannels } from '../../utils/youtubeApi';
import type { YouTubeChannel } from '../../utils/youtubeApi';

export default function Home() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [categories, setCategories] = useState<{ [category: string]: YouTubeChannel[] }>({});
  const [stats, setStats] = useState({
    totalChannels: 0,
    totalCategories: 0,
    totalVideos: 0,
    lastUpdate: ''
  });

  useEffect(() => {
    const { channels: savedChannels, lastSync } = loadChannelsFromStorage();
    if (savedChannels && savedChannels.length > 0) {
      setChannels(savedChannels);
      const categorized = categorizeChannels(savedChannels);
      setCategories(categorized);

      const totalVideos = savedChannels.reduce((sum, ch) => sum + ch.videoCount, 0);

      setStats({
        totalChannels: savedChannels.length,
        totalCategories: Object.keys(categorized).length,
        totalVideos,
        lastUpdate: lastSync ? new Date(lastSync).toLocaleDateString('ko-KR') : '없음'
      });
    }
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">
              YouTube 채널 분석 및 의사결정 지원 시스템
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              구독 채널을 자동으로 분류하고, 최신 정보를 기반으로 스마트한 의사결정을 지원합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="secondary"
                onClick={() => navigate('/connect')}
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <i className="ri-link mr-2"></i>
                계정 연결
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate('/mindmap')}
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <i className="ri-mind-map mr-2"></i>
                마인드맵
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate('/channels')}
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <i className="ri-youtube-line mr-2"></i>
                채널 관리
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate('/query')}
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <i className="ri-question-line mr-2"></i>
                질의 시스템
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <i className="ri-youtube-line text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">총 구독 채널</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChannels}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <i className="ri-folder-line text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">카테고리</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <i className="ri-play-circle-line text-purple-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">총 영상</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVideos}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <i className="ri-refresh-line text-orange-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">마지막 업데이트</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lastUpdate}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Channels */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">인기 채널</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/channels')}
              >
                전체 보기
                <i className="ri-arrow-right-line ml-1"></i>
              </Button>
            </div>
            <div className="space-y-4">
              {channels.slice(0, 4).sort((a, b) => b.subscriberCount - a.subscriberCount).map((channel) => (
                <div key={channel.id} className="flex space-x-4">
                  <img
                    src={channel.thumbnailUrl}
                    alt={channel.title}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
                      {channel.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-1">{channel.description}</p>
                    <div className="flex items-center text-xs text-gray-400 space-x-3">
                      <span>구독자 {formatNumber(channel.subscriberCount)}</span>
                      <span>영상 {formatNumber(channel.videoCount)}개</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Categories */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">카테고리별 채널</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/channels')}
              >
                전체 보기
                <i className="ri-arrow-right-line ml-1"></i>
              </Button>
            </div>
            <div className="space-y-4">
              {Object.keys(categories).map((categoryName, index) => {
                const colors = ['#3B82F6', '#EF4444', '#8B5CF6', '#10B981', '#F59E0B', '#06B6D4', '#84CC16', '#6B7280'];
                const color = colors[index % colors.length];
                return (
                  <div key={categoryName} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {categoryName}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {categories[categoryName].length}개 채널
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">빠른 작업</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/connect')}
              className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer text-left"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-link text-blue-600 text-xl"></i>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">YouTube 계정 연결</h3>
              <p className="text-sm text-gray-600">
                YouTube API를 통해 실제 구독 채널을 가져오세요
              </p>
            </button>

            <button
              onClick={() => navigate('/mindmap')}
              className="p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer text-left"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-mind-map text-green-600 text-xl"></i>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">마인드맵 보기</h3>
              <p className="text-sm text-gray-600">
                구독 채널을 시각적 마인드맵으로 탐색하세요
              </p>
            </button>

            <button
              onClick={() => navigate('/analysis')}
              className="p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer text-left"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-bar-chart-line text-purple-600 text-xl"></i>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">트렌드 분석</h3>
              <p className="text-sm text-gray-600">
                채널별 성과와 트렌드를 분석해보세요
              </p>
            </button>
          </div>
        </Card>
      </main>
    </div>
  );
}
