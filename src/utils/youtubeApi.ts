
// YouTube API 유틸리티 함수들

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  customUrl?: string;
  publishedAt: string;
}

export interface YouTubeSubscription {
  id: string;
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

// 카테고리 자동 분류를 위한 키워드 매핑
const CATEGORY_KEYWORDS = {
  '교육/기술': [
    'programming', 'coding', 'tutorial', 'education', 'tech', 'development', 
    'javascript', 'python', 'react', 'web', 'software', 'computer', 'IT',
    '프로그래밍', '코딩', '개발', '기술', '튜토리얼', '강의', '교육'
  ],
  '엔터테인먼트': [
    'entertainment', 'funny', 'comedy', 'music', 'gaming', 'game', 'movie',
    'entertainment', 'fun', 'viral', '엔터테인먼트', '재미', '게임', '음악', '영화'
  ],
  '라이프스타일': [
    'lifestyle', 'vlog', 'daily', 'life', 'beauty', 'fashion', 'travel',
    'food', 'cooking', 'recipe', '라이프스타일', '일상', '뷰티', '패션', '여행'
  ],
  '요리/음식': [
    'cooking', 'recipe', 'food', 'kitchen', 'chef', 'baking', 'meal',
    '요리', '음식', '레시피', '맛집', '쿠킹', '베이킹'
  ],
  '스포츠/피트니스': [
    'sports', 'fitness', 'workout', 'exercise', 'gym', 'health', 'training',
    '스포츠', '운동', '피트니스', '헬스', '트레이닝'
  ],
  '뉴스/정치': [
    'news', 'politics', 'current', 'events', 'breaking', 'report',
    '뉴스', '정치', '시사', '보도'
  ],
  '과학/교육': [
    'science', 'education', 'learning', 'documentary', 'research', 'study',
    '과학', '교육', '학습', '다큐멘터리', '연구'
  ],
  '기타': []
};

export class YouTubeAPI {
  private apiKey: string;
  private accessToken?: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string, accessToken?: string) {
    this.apiKey = apiKey;
    this.accessToken = accessToken;
  }

  // 구독 채널 목록 가져오기
  async getSubscriptions(pageToken?: string): Promise<{
    items: YouTubeSubscription[];
    nextPageToken?: string;
    totalResults: number;
  }> {
    const url = new URL(`${this.baseUrl}/subscriptions`);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('mine', 'true');
    url.searchParams.set('maxResults', '50');

    // OAuth access token이 있으면 사용, 없으면 API key 사용
    if (!this.accessToken) {
      url.searchParams.set('key', this.apiKey);
    }

    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('YouTube API requires OAuth 2.0 authentication to access subscription data. An API key alone cannot access private user data. Please implement OAuth 2.0 flow or use mock data for testing.');
      }
      throw new Error(`YouTube API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      items: data.items.map((item: any) => ({
        id: item.id,
        channelId: item.snippet.resourceId.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.default?.url || '',
        publishedAt: item.snippet.publishedAt
      })),
      nextPageToken: data.nextPageToken,
      totalResults: data.pageInfo.totalResults
    };
  }

  // 채널 상세 정보 가져오기
  async getChannelDetails(channelIds: string[]): Promise<YouTubeChannel[]> {
    const url = new URL(`${this.baseUrl}/channels`);
    url.searchParams.set('part', 'snippet,statistics');
    url.searchParams.set('id', channelIds.join(','));

    // OAuth access token이 있으면 사용, 없으면 API key 사용
    if (!this.accessToken) {
      url.searchParams.set('key', this.apiKey);
    }

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.default?.url || '',
      subscriberCount: parseInt(item.statistics.subscriberCount || '0'),
      videoCount: parseInt(item.statistics.videoCount || '0'),
      customUrl: item.snippet.customUrl,
      publishedAt: item.snippet.publishedAt
    }));
  }

  // 모든 구독 채널 가져오기 (페이지네이션 처리)
  async getAllSubscriptions(): Promise<YouTubeChannel[]> {
    const allSubscriptions: YouTubeSubscription[] = [];
    let nextPageToken: string | undefined;

    do {
      const result = await this.getSubscriptions(nextPageToken);
      allSubscriptions.push(...result.items);
      nextPageToken = result.nextPageToken;
    } while (nextPageToken);

    // 채널 상세 정보 가져오기 (50개씩 배치 처리)
    const channels: YouTubeChannel[] = [];
    const batchSize = 50;
    
    for (let i = 0; i < allSubscriptions.length; i += batchSize) {
      const batch = allSubscriptions.slice(i, i + batchSize);
      const channelIds = batch.map(sub => sub.channelId);
      const channelDetails = await this.getChannelDetails(channelIds);
      channels.push(...channelDetails);
    }

    return channels;
  }
}

// 채널을 카테고리별로 자동 분류
export function categorizeChannels(channels: YouTubeChannel[]): {
  [category: string]: YouTubeChannel[]
} {
  const categorized: { [category: string]: YouTubeChannel[] } = {};
  
  // 모든 카테고리 초기화
  Object.keys(CATEGORY_KEYWORDS).forEach(category => {
    categorized[category] = [];
  });

  channels.forEach(channel => {
    let assigned = false;
    const searchText = `${channel.title} ${channel.description}`.toLowerCase();

    // 각 카테고리의 키워드와 매칭
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (category === '기타') continue;
      
      const hasKeyword = keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );

      if (hasKeyword) {
        categorized[category].push(channel);
        assigned = true;
        break;
      }
    }

    // 어떤 카테고리에도 속하지 않으면 '기타'로 분류
    if (!assigned) {
      categorized['기타'].push(channel);
    }
  });

  // 빈 카테고리 제거
  Object.keys(categorized).forEach(category => {
    if (categorized[category].length === 0) {
      delete categorized[category];
    }
  });

  return categorized;
}

// 로컬 스토리지에 채널 데이터 저장
export function saveChannelsToStorage(channels: YouTubeChannel[]): void {
  const categorized = categorizeChannels(channels);
  
  localStorage.setItem('youtube_channels', JSON.stringify(channels));
  localStorage.setItem('youtube_categories', JSON.stringify(categorized));
  localStorage.setItem('youtube_last_sync', new Date().toISOString());
}

// 로컬 스토리지에서 채널 데이터 불러오기
export function loadChannelsFromStorage(): {
  channels: YouTubeChannel[];
  categories: { [category: string]: YouTubeChannel[] };
  lastSync: string | null;
} {
  const channels = JSON.parse(localStorage.getItem('youtube_channels') || '[]');
  const categories = JSON.parse(localStorage.getItem('youtube_categories') || '{}');
  const lastSync = localStorage.getItem('youtube_last_sync');

  return { channels, categories, lastSync };
}

// 채널 데이터 동기화 (API 호출 후 저장)
export async function syncChannelData(apiKey: string, accessToken?: string): Promise<{
  channels: YouTubeChannel[];
  categories: { [category: string]: YouTubeChannel[] };
}> {
  const api = new YouTubeAPI(apiKey, accessToken);
  const channels = await api.getAllSubscriptions();

  saveChannelsToStorage(channels);

  const categories = categorizeChannels(channels);

  return { channels, categories };
}

// Mock 데이터를 사용한 동기화 (개발/테스트용)
export async function syncWithMockData(): Promise<{
  channels: YouTubeChannel[];
  categories: { [category: string]: YouTubeChannel[] };
}> {
  // Mock 채널 데이터 생성
  const mockChannels: YouTubeChannel[] = [
    {
      id: 'UC29ju8bIPH5as8OGnQzwJyA',
      title: 'Traversy Media',
      description: 'Web development tutorials and programming courses',
      thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_lKlOZhZqfcXJVv7Q0UWG6LkO5w5B_6lHh',
      subscriberCount: 1800000,
      videoCount: 847,
      publishedAt: '2009-10-04T14:39:07Z'
    },
    {
      id: 'UCbRP3c757lWg9M-U7TyEkXA',
      title: 'MKBHD',
      description: 'Technology reviews and tech news coverage',
      thumbnailUrl: 'https://yt3.googleusercontent.com/lkH-b6MuZvFfZ_MK4eCT8T5zNy37rbNu',
      subscriberCount: 17500000,
      videoCount: 1654,
      publishedAt: '2008-03-21T21:45:34Z'
    },
    {
      id: 'UCsXVk37bltHxD1rDPwtNM8Q',
      title: 'Kurzgesagt',
      description: 'Science and philosophy explained with animations',
      thumbnailUrl: 'https://yt3.googleusercontent.com/4-kCJKNP_oEK3FI88XOZOA2P6g',
      subscriberCount: 19200000,
      videoCount: 178,
      publishedAt: '2013-07-09T13:19:27Z'
    },
    {
      id: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
      title: 'MrBeast',
      description: 'Philanthropy and entertainment challenges',
      thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_mKzklyPPhha_yGH9kU',
      subscriberCount: 112000000,
      videoCount: 234,
      publishedAt: '2012-02-20T00:42:39Z'
    },
    {
      id: 'UCsooa4yRKGN_zEE8iknghZA',
      title: 'TED-Ed',
      description: 'Educational animated lessons',
      thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_k8x_wHJTD0Q',
      subscriberCount: 18500000,
      videoCount: 1876,
      publishedAt: '2011-03-01T18:16:17Z'
    }
  ];

  saveChannelsToStorage(mockChannels);
  const categories = categorizeChannels(mockChannels);

  return { channels: mockChannels, categories };
}
