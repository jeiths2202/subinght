export interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  category: string;
  lastUpdated: string;
  customUrl?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  channelId: string;
  channelTitle: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  channelCount: number;
}

export interface Query {
  id: string;
  originalQuery: string;
  refinedQueries: string[];
  finalQuery: string;
  status: 'pending' | 'refining' | 'executing' | 'completed';
  results?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  id: string;
  type: 'trend' | 'comparison' | 'recommendation';
  title: string;
  description: string;
  data: any;
  insights: string[];
  createdAt: string;
}