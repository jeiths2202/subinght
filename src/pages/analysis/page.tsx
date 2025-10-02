import { useState } from 'react';
import Header from '../../components/feature/Header';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { mockChannels, mockCategories } from '../../mocks/channels';
import { mockVideos } from '../../mocks/videos';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function Analysis() {
  const [activeTab, setActiveTab] = useState('overview');

  // 카테고리별 채널 수 데이터
  const categoryData = mockCategories.map(category => ({
    name: category.name,
    value: category.channelCount,
    color: category.color
  }));

  // 구독자 수 상위 채널 데이터
  const topChannelsData = mockChannels
    .sort((a, b) => b.subscriberCount - a.subscriberCount)
    .slice(0, 5)
    .map(channel => ({
      name: channel.title.length > 10 ? channel.title.substring(0, 10) + '...' : channel.title,
      subscribers: Math.round(channel.subscriberCount / 1000),
      videos: channel.videoCount
    }));

  // 최근 영상 조회수 트렌드
  const videoTrendData = mockVideos.slice(0, 6).map((video, index) => ({
    name: `영상 ${index + 1}`,
    views: Math.round(video.viewCount / 1000),
    likes: Math.round(video.likeCount / 100)
  }));

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const tabs = [
    { id: 'overview', label: '개요', icon: 'ri-dashboard-line' },
    { id: 'channels', label: '채널 분석', icon: 'ri-youtube-line' },
    { id: 'content', label: '콘텐츠 분석', icon: 'ri-play-circle-line' },
    { id: 'trends', label: '트렌드', icon: 'ri-line-chart-line' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">분석 대시보드</h1>
          <p className="text-gray-600">구독 채널과 콘텐츠의 성과를 분석하고 인사이트를 얻으세요.</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-youtube-line text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 구독자</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(mockChannels.reduce((sum, channel) => sum + channel.subscriberCount, 0))}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-play-circle-line text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 영상</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockChannels.reduce((sum, channel) => sum + channel.videoCount, 0)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-eye-line text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 조회수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(mockVideos.reduce((sum, video) => sum + video.viewCount, 0))}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-heart-line text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 좋아요</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(mockVideos.reduce((sum, video) => sum + video.likeCount, 0))}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Distribution */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 채널 분포</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Top Channels */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">구독자 수 상위 채널</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topChannelsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}K`, '구독자 수']} />
                      <Bar dataKey="subscribers" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-8">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">채널 성과 비교</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topChannelsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="subscribers" fill="#3B82F6" name="구독자 (K)" />
                    <Bar yAxisId="right" dataKey="videos" fill="#10B981" name="영상 수" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">성장률 분석</h3>
                <div className="space-y-4">
                  {mockChannels.slice(0, 5).map((channel, index) => (
                    <div key={channel.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={channel.thumbnailUrl}
                          alt={channel.title}
                          className="w-10 h-10 rounded-full object-cover object-top mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{channel.title}</p>
                          <p className="text-sm text-gray-500">{formatNumber(channel.subscriberCount)} 구독자</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${index % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {index % 2 === 0 ? '+' : '-'}{Math.floor(Math.random() * 10) + 1}%
                        </p>
                        <p className="text-xs text-gray-500">지난 주 대비</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 성과</h3>
                <div className="space-y-4">
                  {mockCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{category.channelCount}개 채널</p>
                        <p className="text-xs text-gray-500">
                          평균 {formatNumber(Math.floor(Math.random() * 500000) + 100000)} 구독자
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">영상 조회수 트렌드</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={videoTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}K`, '조회수']} />
                    <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 영상</h3>
                <div className="space-y-4">
                  {mockVideos.slice(0, 5).map((video) => (
                    <div key={video.id} className="flex space-x-4">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-20 h-12 rounded-lg object-cover object-top flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-1">{video.channelTitle}</p>
                        <div className="flex items-center text-xs text-gray-400 space-x-3">
                          <span>조회수 {formatNumber(video.viewCount)}</span>
                          <span>좋아요 {formatNumber(video.likeCount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">콘텐츠 유형 분석</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">튜토리얼</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">리뷰</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">라이브</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">브이로그</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-8">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 트렌드 키워드</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', '웹개발', '프론트엔드', 'JavaScript', 'Next.js', '백엔드', 'AI', '머신러닝', '데이터분석'].map((keyword, index) => (
                  <span
                    key={keyword}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      index < 3 ? 'bg-blue-100 text-blue-800' :
                      index < 6 ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">업로드 패턴 분석</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">월요일</span>
                      <span className="text-sm text-gray-600">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">화요일</span>
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">수요일</span>
                      <span className="text-sm text-gray-600">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">목요일</span>
                      <span className="text-sm text-gray-600">18%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">금요일</span>
                      <span className="text-sm text-gray-600">22%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '22%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">성과 예측</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <i className="ri-arrow-up-line text-green-600 mr-2"></i>
                      <span className="font-medium text-green-800">상승 예상</span>
                    </div>
                    <p className="text-sm text-green-700">
                      교육/기술 카테고리의 구독자 증가율이 지속적으로 상승하고 있습니다.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <i className="ri-information-line text-blue-600 mr-2"></i>
                      <span className="font-medium text-blue-800">주목할 트렌드</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      AI 관련 콘텐츠의 조회수가 급격히 증가하고 있습니다.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <i className="ri-lightbulb-line text-orange-600 mr-2"></i>
                      <span className="font-medium text-orange-800">추천 사항</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      화요일과 금요일에 업로드되는 영상의 성과가 가장 좋습니다.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}