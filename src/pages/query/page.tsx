import { useState } from 'react';
import Header from '../../components/feature/Header';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import type { Query } from '../../types';

export default function QuerySystem() {
  const [currentQuery, setCurrentQuery] = useState('');
  const [queries, setQueries] = useState<Query[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeQuery, setActiveQuery] = useState<Query | null>(null);

  const handleSubmitQuery = async () => {
    if (!currentQuery.trim()) return;

    setIsProcessing(true);
    
    const newQuery: Query = {
      id: Date.now().toString(),
      originalQuery: currentQuery,
      refinedQueries: [],
      finalQuery: '',
      status: 'refining',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setQueries(prev => [newQuery, ...prev]);
    setActiveQuery(newQuery);
    setCurrentQuery('');

    // 시뮬레이션: 질의 구체화 과정
    setTimeout(() => {
      const refinedQueries = generateRefinedQueries(newQuery.originalQuery);
      const updatedQuery = {
        ...newQuery,
        refinedQueries,
        status: 'executing' as const,
        updatedAt: new Date().toISOString()
      };
      
      setQueries(prev => prev.map(q => q.id === newQuery.id ? updatedQuery : q));
      setActiveQuery(updatedQuery);

      // 시뮬레이션: 최종 질의 실행
      setTimeout(() => {
        const finalQuery = refinedQueries[refinedQueries.length - 1];
        const results = generateMockResults(finalQuery);
        
        const completedQuery = {
          ...updatedQuery,
          finalQuery,
          status: 'completed' as const,
          results,
          updatedAt: new Date().toISOString()
        };
        
        setQueries(prev => prev.map(q => q.id === newQuery.id ? completedQuery : q));
        setActiveQuery(completedQuery);
        setIsProcessing(false);
      }, 2000);
    }, 1500);
  };

  const generateRefinedQueries = (originalQuery: string): string[] => {
    const refinements = [
      `"${originalQuery}"에 대한 구체적인 정보를 찾고 있습니다.`,
      `YouTube 채널 데이터에서 "${originalQuery}"와 관련된 패턴을 분석합니다.`,
      `"${originalQuery}"에 대한 최신 트렌드와 성과 지표를 조사합니다.`,
      `구독 채널들 중에서 "${originalQuery}"와 관련된 콘텐츠를 필터링하고 분석합니다.`
    ];
    
    return refinements;
  };

  const generateMockResults = (query: string) => {
    return [
      {
        type: 'channel',
        title: '관련 채널 분석',
        data: '3개의 채널에서 관련 콘텐츠를 발견했습니다.',
        confidence: 85
      },
      {
        type: 'trend',
        title: '트렌드 분석',
        data: '지난 30일간 관련 키워드의 언급량이 23% 증가했습니다.',
        confidence: 92
      },
      {
        type: 'recommendation',
        title: '추천 사항',
        data: '유사한 주제의 채널 2개를 추가 구독하는 것을 권장합니다.',
        confidence: 78
      }
    ];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Query['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'refining': return 'text-blue-600 bg-blue-100';
      case 'executing': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: Query['status']) => {
    switch (status) {
      case 'pending': return '대기 중';
      case 'refining': return '질의 구체화 중';
      case 'executing': return '실행 중';
      case 'completed': return '완료';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">스마트 질의 시스템</h1>
          <p className="text-gray-600">AI가 질의를 구체화하여 정확한 분석 결과를 제공합니다.</p>
        </div>

        {/* Query Input */}
        <Card className="mb-8">
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                질의 입력
              </label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="예: 프로그래밍 관련 채널의 최근 트렌드는?"
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuery()}
                    disabled={isProcessing}
                  />
                </div>
                <Button
                  onClick={handleSubmitQuery}
                  disabled={!currentQuery.trim() || isProcessing}
                  loading={isProcessing}
                >
                  <i className="ri-send-plane-line mr-2"></i>
                  질의 실행
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">추천 질의:</span>
              {[
                '가장 성장률이 높은 채널은?',
                '요리 관련 채널의 평균 조회수는?',
                '최근 인기 있는 콘텐츠 유형은?'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setCurrentQuery(suggestion)}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                  disabled={isProcessing}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Query History */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">질의 기록</h2>
            <div className="space-y-4">
              {queries.length === 0 ? (
                <Card>
                  <div className="text-center py-8">
                    <i className="ri-question-line text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">질의 기록이 없습니다</h3>
                    <p className="text-gray-600">첫 번째 질의를 입력해보세요.</p>
                  </div>
                </Card>
              ) : (
                queries.map((query) => (
                  <Card
                    key={query.id}
                    className={`cursor-pointer transition-all ${
                      activeQuery?.id === query.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => setActiveQuery(query)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900 line-clamp-2 flex-1 mr-4">
                        {query.originalQuery}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(query.status)}`}>
                        {getStatusText(query.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(query.createdAt)}</span>
                      {query.results && (
                        <span>{query.results.length}개 결과</span>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Query Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">질의 상세</h2>
            {activeQuery ? (
              <div className="space-y-6">
                {/* Original Query */}
                <Card>
                  <h3 className="font-medium text-gray-900 mb-2">원본 질의</h3>
                  <p className="text-gray-700">{activeQuery.originalQuery}</p>
                </Card>

                {/* Refinement Process */}
                {activeQuery.refinedQueries.length > 0 && (
                  <Card>
                    <h3 className="font-medium text-gray-900 mb-4">질의 구체화 과정</h3>
                    <div className="space-y-3">
                      {activeQuery.refinedQueries.map((refinedQuery, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-sm text-gray-700 flex-1">{refinedQuery}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Results */}
                {activeQuery.results && (
                  <Card>
                    <h3 className="font-medium text-gray-900 mb-4">분석 결과</h3>
                    <div className="space-y-4">
                      {activeQuery.results.map((result, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{result.title}</h4>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">신뢰도</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${result.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 ml-2">
                                {result.confidence}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{result.data}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Processing Status */}
                {activeQuery.status !== 'completed' && (
                  <Card>
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin">
                        <i className="ri-loader-4-line text-blue-600"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">처리 중...</p>
                        <p className="text-sm text-gray-600">{getStatusText(activeQuery.status)}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <i className="ri-file-search-line text-4xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">질의를 선택하세요</h3>
                  <p className="text-gray-600">왼쪽에서 질의를 선택하면 상세 정보를 확인할 수 있습니다.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}