
import type { Channel } from '../types';

// 실제 YouTube 채널 데이터를 시뮬레이션하는 더 현실적인 목업 데이터
export const mockChannels = [
  {
    id: '1',
    title: 'Traversy Media',
    description: 'Web development tutorials and programming courses',
    category: '교육/기술',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=professional%20tech%20educator%20with%20modern%20setup%2C%20clean%20background%2C%20programming%20tutorial%20style%2C%20high%20quality%20portrait&width=100&height=100&seq=1&orientation=squarish',
    subscriberCount: 1800000,
    videoCount: 847,
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Bon Appétit',
    description: 'Food recipes and cooking techniques from professional chefs',
    category: '요리/음식',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=professional%20chef%20cooking%20in%20modern%20kitchen%2C%20food%20preparation%2C%20culinary%20arts%2C%20clean%20white%20background&width=100&height=100&seq=2&orientation=squarish',
    subscriberCount: 5200000,
    videoCount: 2341,
    lastUpdated: '2024-01-14T15:45:00Z'
  },
  {
    id: '3',
    title: 'MKBHD',
    description: 'Technology reviews and tech news coverage',
    category: '교육/기술',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=tech%20reviewer%20with%20modern%20gadgets%2C%20professional%20studio%20setup%2C%20technology%20background%2C%20high%20quality%20portrait&width=100&height=100&seq=3&orientation=squarish',
    subscriberCount: 17500000,
    videoCount: 1654,
    lastUpdated: '2024-01-16T09:20:00Z'
  },
  {
    id: '4',
    title: 'Emma Chamberlain',
    description: 'Lifestyle vlogs and daily life content',
    category: '라이프스타일',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=young%20lifestyle%20vlogger%2C%20casual%20modern%20style%2C%20bright%20natural%20lighting%2C%20minimalist%20background&width=100&height=100&seq=4&orientation=squarish',
    subscriberCount: 11800000,
    videoCount: 456,
    lastUpdated: '2024-01-13T18:15:00Z'
  },
  {
    id: '5',
    title: 'Kurzgesagt',
    description: 'Science and philosophy explained with animations',
    category: '과학/교육',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=animated%20science%20education%2C%20colorful%20illustrations%2C%20space%20and%20science%20themes%2C%20educational%20content%20style&width=100&height=100&seq=5&orientation=squarish',
    subscriberCount: 19200000,
    videoCount: 178,
    lastUpdated: '2024-01-12T12:00:00Z'
  },
  {
    id: '6',
    title: 'PewDiePie',
    description: 'Gaming content and entertainment videos',
    category: '엔터테인먼트',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=gaming%20content%20creator%2C%20energetic%20personality%2C%20gaming%20setup%20background%2C%20entertainment%20style&width=100&height=100&seq=6&orientation=squarish',
    subscriberCount: 111000000,
    videoCount: 4567,
    lastUpdated: '2024-01-11T20:30:00Z'
  },
  {
    id: '7',
    title: 'Yoga with Adriene',
    description: 'Yoga practices and wellness content',
    category: '스포츠/피트니스',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=yoga%20instructor%20in%20peaceful%20studio%2C%20wellness%20and%20fitness%2C%20calm%20natural%20lighting%2C%20healthy%20lifestyle&width=100&height=100&seq=7&orientation=squarish',
    subscriberCount: 12100000,
    videoCount: 789,
    lastUpdated: '2024-01-10T07:45:00Z'
  },
  {
    id: '8',
    title: 'Vox',
    description: 'News analysis and current events coverage',
    category: '뉴스/정치',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=news%20media%20brand%2C%20professional%20journalism%2C%20modern%20newsroom%20style%2C%20clean%20corporate%20design&width=100&height=100&seq=8&orientation=squarish',
    subscriberCount: 8900000,
    videoCount: 1234,
    lastUpdated: '2024-01-09T14:20:00Z'
  },
  {
    id: '9',
    title: 'Tasty',
    description: 'Quick and easy recipe videos',
    category: '요리/음식',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=food%20preparation%20overhead%20view%2C%20colorful%20ingredients%2C%20modern%20kitchen%20setup%2C%20recipe%20video%20style&width=100&height=100&seq=9&orientation=squarish',
    subscriberCount: 21000000,
    videoCount: 3456,
    lastUpdated: '2024-01-08T16:10:00Z'
  },
  {
    id: '10',
    title: 'The Try Guys',
    description: 'Comedy and entertainment challenge videos',
    category: '엔터테인먼트',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=comedy%20entertainment%20group%2C%20fun%20and%20energetic%2C%20colorful%20background%2C%20entertainment%20content%20style&width=100&height=100&seq=10&orientation=squarish',
    subscriberCount: 7800000,
    videoCount: 567,
    lastUpdated: '2024-01-07T11:30:00Z'
  },
  {
    id: '11',
    title: 'Crash Course',
    description: 'Educational content across various subjects',
    category: '과학/교육',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=educational%20content%20creator%2C%20academic%20style%2C%20books%20and%20learning%20materials%2C%20professional%20educational%20background&width=100&height=100&seq=11&orientation=squarish',
    subscriberCount: 13500000,
    videoCount: 1876,
    lastUpdated: '2024-01-06T13:45:00Z'
  },
  {
    id: '12',
    title: 'James Charles',
    description: 'Beauty tutorials and makeup content',
    category: '라이프스타일',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=beauty%20content%20creator%2C%20makeup%20and%20cosmetics%2C%20glamorous%20style%2C%20beauty%20studio%20setup&width=100&height=100&seq=12&orientation=squarish',
    subscriberCount: 23400000,
    videoCount: 234,
    lastUpdated: '2024-01-05T19:20:00Z'
  },
  {
    id: '13',
    title: 'Dude Perfect',
    description: 'Sports tricks and entertainment content',
    category: '스포츠/피트니스',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=sports%20entertainment%20group%2C%20athletic%20activities%2C%20fun%20sports%20tricks%2C%20energetic%20team%20style&width=100&height=100&seq=13&orientation=squarish',
    subscriberCount: 58900000,
    videoCount: 345,
    lastUpdated: '2024-01-04T08:15:00Z'
  },
  {
    id: '14',
    title: 'TED',
    description: 'Inspirational talks and ideas worth spreading',
    category: '과학/교육',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=TED%20talk%20stage%2C%20professional%20presentation%2C%20inspirational%20speaking%2C%20conference%20style%20background&width=100&height=100&seq=14&orientation=squarish',
    subscriberCount: 22100000,
    videoCount: 4321,
    lastUpdated: '2024-01-03T15:30:00Z'
  },
  {
    id: '15',
    title: 'MrBeast',
    description: 'Philanthropy and entertainment challenges',
    category: '엔터테인먼트',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=philanthropic%20content%20creator%2C%20large%20scale%20challenges%2C%20generous%20giving%2C%20entertainment%20production%20style&width=100&height=100&seq=15&orientation=squarish',
    subscriberCount: 112000000,
    videoCount: 234,
    lastUpdated: '2024-01-02T12:45:00Z'
  },
  {
    id: '16',
    title: 'Corey Schafer',
    description: 'Python programming tutorials and coding education',
    category: '교육/기술',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=programming%20instructor%2C%20coding%20tutorial%20setup%2C%20Python%20development%2C%20technical%20education%20background&width=100&height=100&seq=16&orientation=squarish',
    subscriberCount: 1200000,
    videoCount: 156,
    lastUpdated: '2024-01-01T10:00:00Z'
  },
  {
    id: '17',
    title: 'Binging with Babish',
    description: 'Recreating foods from movies and TV shows',
    category: '요리/음식',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=culinary%20content%20creator%2C%20movie%20food%20recreation%2C%20professional%20kitchen%2C%20cooking%20show%20style&width=100&height=100&seq=17&orientation=squarish',
    subscriberCount: 9800000,
    videoCount: 456,
    lastUpdated: '2023-12-31T17:20:00Z'
  },
  {
    id: '18',
    title: 'Linus Tech Tips',
    description: 'Computer hardware reviews and tech content',
    category: '교육/기술',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=tech%20hardware%20reviewer%2C%20computer%20components%2C%20professional%20tech%20lab%2C%20hardware%20testing%20setup&width=100&height=100&seq=18&orientation=squarish',
    subscriberCount: 15300000,
    videoCount: 6789,
    lastUpdated: '2023-12-30T14:10:00Z'
  },
  {
    id: '19',
    title: 'Michelle Schroeder-Gardner',
    description: 'Personal finance and lifestyle content',
    category: '라이프스타일',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=personal%20finance%20educator%2C%20professional%20lifestyle%2C%20money%20management%2C%20clean%20modern%20office%20background&width=100&height=100&seq=19&orientation=squarish',
    subscriberCount: 890000,
    videoCount: 123,
    lastUpdated: '2023-12-29T11:30:00Z'
  },
  {
    id: '20',
    title: 'The Late Show',
    description: 'Late night comedy and celebrity interviews',
    category: '엔터테인먼트',
    thumbnailUrl: 'https://readdy.ai/api/search-image?query=late%20night%20talk%20show%2C%20comedy%20entertainment%2C%20professional%20TV%20studio%2C%20celebrity%20interview%20setup&width=100&height=100&seq=20&orientation=squarish',
    subscriberCount: 8700000,
    videoCount: 2345,
    lastUpdated: '2023-12-28T23:45:00Z'
  }
];

export const mockCategories = [
  {
    id: '1',
    name: '교육/기술',
    color: '#3B82F6',
    channelCount: mockChannels.filter(c => c.category === '교육/기술').length
  },
  {
    id: '2',
    name: '요리/음식',
    color: '#EF4444',
    channelCount: mockChannels.filter(c => c.category === '요리/음식').length
  },
  {
    id: '3',
    name: '라이프스타일',
    color: '#8B5CF6',
    channelCount: mockChannels.filter(c => c.category === '라이프스타일').length
  },
  {
    id: '4',
    name: '엔터테인먼트',
    color: '#10B981',
    channelCount: mockChannels.filter(c => c.category === '엔터테인먼트').length
  },
  {
    id: '5',
    name: '과학/교육',
    color: '#F59E0B',
    channelCount: mockChannels.filter(c => c.category === '과학/교육').length
  },
  {
    id: '6',
    name: '스포츠/피트니스',
    color: '#06B6D4',
    channelCount: mockChannels.filter(c => c.category === '스포츠/피트니스').length
  },
  {
    id: '7',
    name: '뉴스/정치',
    color: '#84CC16',
    channelCount: mockChannels.filter(c => c.category === '뉴스/정치').length
  },
  {
    id: '8',
    name: '기타',
    color: '#6B7280',
    channelCount: mockChannels.filter(c => c.category === '기타').length
  }
];
