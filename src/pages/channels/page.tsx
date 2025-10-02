import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import { loadChannelsFromStorage, categorizeChannels } from '../../utils/youtubeApi';
import type { YouTubeChannel } from '../../utils/youtubeApi';

export default function Channels() {
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [categories, setCategories] = useState<{ [category: string]: YouTubeChannel[] }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('lastUpdated');

  useEffect(() => {
    const { channels: savedChannels } = loadChannelsFromStorage();
    if (savedChannels && savedChannels.length > 0) {
      setChannels(savedChannels);
      const categorized = categorizeChannels(savedChannels);
      setCategories(categorized);
    }
  }, []);

  // 카테고리 정보 추출
  const categoryList = Object.keys(categories).map(name => ({
    name,
    count: categories[name].length
  }));

  // 각 채널에 카테고리 정보 추가
  const channelsWithCategory = channels.map(channel => {
    const category = Object.keys(categories).find(cat =>
      categories[cat].some(c => c.id === channel.id)
    ) || '기타';
    return { ...channel, category };
  });

  const filteredChannels = channelsWithCategory
    .filter(channel =>
      channel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(channel =>
      selectedCategory === 'all' || channel.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'subscribers':
          return b.subscriberCount - a.subscriberCount;
        case 'videos':
          return b.videoCount - a.videoCount;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (categoryName: string) => {
    const colors: { [key: string]: string } = {
      '교육/기술': '#3B82F6',
      '요리/음식': '#EF4444',
      '라이프스타일': '#8B5CF6',
      '엔터테인먼트': '#10B981',
      '과학/교육': '#F59E0B',
      '스포츠/피트니스': '#06B6D4',
      '뉴스/정치': '#84CC16',
      '기타': '#6B7280'
    };
    return colors[categoryName] || '#6B7280';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">채널 관리</h1>
          <p className="text-gray-600">구독 중인 YouTube 채널을 카테고리별로 관리하고 분석하세요.</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="채널명 또는 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="ri-search-line"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">모든 카테고리</option>
                  {categoryList.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="lastUpdated">최근 업데이트</option>
                  <option value="subscribers">구독자 수</option>
                  <option value="videos">영상 수</option>
                  <option value="title">이름순</option>
                </select>
                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>
          </div>
        </Card>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChannels.map((channel) => (
            <Card key={channel.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <img
                  src={channel.thumbnailUrl}
                  alt={channel.title}
                  className="w-16 h-16 rounded-full object-cover object-top flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {channel.title}
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <i className="ri-more-2-line"></i>
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {channel.description}
                  </p>

                  <div className="flex items-center mb-3">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: getCategoryColor(channel.category) }}
                    ></span>
                    <span className="text-xs text-gray-500">{channel.category}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">구독자</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatNumber(channel.subscriberCount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">영상</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatNumber(channel.videoCount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(channel.publishedAt)}
                    </span>
                    <div className="flex space-x-2">
                      <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer">
                        <i className="ri-external-link-line text-sm"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors cursor-pointer">
                        <i className="ri-bar-chart-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredChannels.length === 0 && (
          <Card className="text-center py-12">
            <i className="ri-search-line text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600">다른 검색어나 필터를 시도해보세요.</p>
          </Card>
        )}

        {/* Add Channel Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            size="lg"
            className="rounded-full shadow-lg"
          >
            <i className="ri-add-line mr-2"></i>
            채널 추가
          </Button>
        </div>
      </main>
    </div>
  );
}