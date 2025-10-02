
import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../components/feature/Header';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { mockChannels, mockCategories } from '../../mocks/channels';

interface Node {
  id: string;
  label: string;
  type: 'root' | 'category' | 'channel';
  x: number;
  y: number;
  color: string;
  channels?: any[];
  subscriberCount?: number;
  videoCount?: number;
  radius?: number;
}

interface Connection {
  from: string;
  to: string;
}

export default function MindMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<Node | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'full' | 'category' | 'top'>('full');

  useEffect(() => {
    generateMindMapData();
  }, [viewMode]);

  useEffect(() => {
    if (nodes.length > 0) {
      drawMindMap();
    }
  }, [nodes, connections, scale, offset, selectedNode]);

  const generateMindMapData = useCallback(() => {
    const centerX = 400;
    const centerY = 300;
    const categoryRadius = 200;
    const channelRadius = 120;

    // 루트 노드
    const rootNode: Node = {
      id: 'root',
      label: 'YouTube 구독',
      type: 'root',
      x: centerX,
      y: centerY,
      color: '#EF4444',
      radius: 50
    };

    const newNodes: Node[] = [rootNode];
    const newConnections: Connection[] = [];

    // 카테고리 노드들
    const categoriesToShow = viewMode === 'category' ? mockCategories.slice(0, 4) : mockCategories;
    
    categoriesToShow.forEach((category, index) => {
      const angle = (index * 2 * Math.PI) / categoriesToShow.length;
      const categoryX = centerX + Math.cos(angle) * categoryRadius;
      const categoryY = centerY + Math.sin(angle) * categoryRadius;

      const categoryChannels = mockChannels.filter(channel => channel.category === category.name);

      const categoryNode: Node = {
        id: `category-${category.id}`,
        label: category.name,
        type: 'category',
        x: categoryX,
        y: categoryY,
        color: category.color,
        channels: categoryChannels,
        radius: 35
      };

      newNodes.push(categoryNode);
      newConnections.push({
        from: 'root',
        to: `category-${category.id}`
      });

      // 각 카테고리의 채널들
      const channelsToShow = viewMode === 'top' 
        ? categoryChannels.sort((a, b) => b.subscriberCount - a.subscriberCount).slice(0, 2)
        : categoryChannels.slice(0, viewMode === 'category' ? 5 : 3);

      channelsToShow.forEach((channel, channelIndex) => {
        const channelAngle = angle + (channelIndex - (channelsToShow.length - 1) / 2) * 0.4;
        const channelX = categoryX + Math.cos(channelAngle) * channelRadius;
        const channelY = categoryY + Math.sin(channelAngle) * channelRadius;

        // 구독자 수에 따른 노드 크기 조정
        const subscriberRatio = channel.subscriberCount / 1000000; // 백만 단위
        const nodeRadius = Math.max(15, Math.min(25, 15 + subscriberRatio * 5));

        const channelNode: Node = {
          id: `channel-${channel.id}`,
          label: channel.title.length > 12 ? channel.title.substring(0, 12) + '...' : channel.title,
          type: 'channel',
          x: channelX,
          y: channelY,
          color: category.color,
          subscriberCount: channel.subscriberCount,
          videoCount: channel.videoCount,
          radius: nodeRadius
        };

        newNodes.push(channelNode);
        newConnections.push({
          from: `category-${category.id}`,
          to: `channel-${channel.id}`
        });
      });
    });

    setNodes(newNodes);
    setConnections(newConnections);
  }, [viewMode]);

  const drawMindMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 배경 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 변환 적용
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // 연결선 그리기
    connections.forEach(connection => {
      const fromNode = nodes.find(n => n.id === connection.from);
      const toNode = nodes.find(n => n.id === connection.to);

      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        
        // 곡선 연결선
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        const controlX = midX + (fromNode.y - toNode.y) * 0.1;
        const controlY = midY + (toNode.x - fromNode.x) * 0.1;
        
        ctx.quadraticCurveTo(controlX, controlY, toNode.x, toNode.y);
        ctx.strokeStyle = selectedNode && (selectedNode.id === connection.from || selectedNode.id === connection.to) 
          ? '#3B82F6' : '#E5E7EB';
        ctx.lineWidth = selectedNode && (selectedNode.id === connection.from || selectedNode.id === connection.to) ? 3 : 2;
        ctx.stroke();
      }
    });

    // 노드 그리기
    nodes.forEach(node => {
      const radius = node.radius || (node.type === 'root' ? 40 : node.type === 'category' ? 30 : 20);
      
      // 그림자 효과
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // 노드 원
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 선택된 노드 하이라이트
      if (selectedNode?.id === node.id) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // 펄스 효과
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 8, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 호버 효과 (마우스 위치 기반)
      // 실제 구현에서는 마우스 위치를 추적해야 함

      // 텍스트
      ctx.fillStyle = node.type === 'root' ? '#FFFFFF' : 
                     node.type === 'category' ? '#FFFFFF' : '#FFFFFF';
      ctx.font = `${node.type === 'root' ? 'bold 14' : node.type === 'category' ? 'bold 12' : '10'}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 텍스트가 노드 안에 들어가도록 조정
      const maxWidth = radius * 1.8;
      const text = node.label;
      const textWidth = ctx.measureText(text).width;
      
      if (textWidth > maxWidth && node.type === 'channel') {
        const fontSize = Math.max(8, (maxWidth / textWidth) * 10);
        ctx.font = `${fontSize}px sans-serif`;
      }
      
      ctx.fillText(text, node.x, node.y);

      // 채널 노드에 구독자 수 표시
      if (node.type === 'channel' && node.subscriberCount) {
        ctx.font = '8px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const subscriberText = formatNumber(node.subscriberCount);
        ctx.fillText(subscriberText, node.x, node.y + radius + 12);
      }
    });

    ctx.restore();
  }, [nodes, connections, scale, offset, selectedNode]);

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x) / scale;
    const y = (event.clientY - rect.top - offset.y) / scale;

    // 클릭된 노드 찾기
    const clickedNode = nodes.find(node => {
      const radius = node.radius || (node.type === 'root' ? 40 : node.type === 'category' ? 30 : 20);
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= radius;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      setIsDragging(true);
      setDragNode(clickedNode);
      setDragOffset({
        x: x - clickedNode.x,
        y: y - clickedNode.y
      });
    } else {
      setSelectedNode(null);
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging && dragNode) {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - offset.x) / scale;
      const y = (event.clientY - rect.top - offset.y) / scale;

      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === dragNode.id 
            ? { ...node, x: x - dragOffset.x, y: y - dragOffset.y }
            : node
        )
      );
    } else if (isPanning) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDragNode(null);
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
    generateMindMapData();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">구독 채널 마인드맵</h1>
          <p className="text-gray-600">카테고리별로 자동 분류된 구독 채널을 시각적으로 탐색하세요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mind Map Canvas */}
          <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full h-96 lg:h-[600px] cursor-grab active:cursor-grabbing"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
                
                {/* Controls */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  <Button
                    size="sm"
                    onClick={handleZoomIn}
                    className="w-10 h-10 p-0 rounded-full"
                    title="확대"
                  >
                    <i className="ri-add-line"></i>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleZoomOut}
                    className="w-10 h-10 p-0 rounded-full"
                    title="축소"
                  >
                    <i className="ri-subtract-line"></i>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReset}
                    className="w-10 h-10 p-0 rounded-full"
                    title="초기화"
                  >
                    <i className="ri-refresh-line"></i>
                  </Button>
                </div>

                {/* View Mode Toggle */}
                <div className="absolute top-4 left-4 flex space-x-1 bg-white/90 backdrop-blur-sm rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('full')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      viewMode === 'full' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setViewMode('category')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      viewMode === 'category' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    카테고리
                  </button>
                  <button
                    onClick={() => setViewMode('top')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      viewMode === 'top' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    인기
                  </button>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                      <span>루트</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span>카테고리</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                      <span>채널</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    드래그: 노드 이동 | 우클릭 드래그: 화면 이동
                  </div>
                </div>

                {/* Scale Indicator */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-xs text-gray-600">{Math.round(scale * 100)}%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Node Details */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">선택된 노드</h3>
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: selectedNode.color }}
                    ></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedNode.label}</h4>
                      <p className="text-sm text-gray-500 capitalize">{selectedNode.type}</p>
                    </div>
                  </div>

                  {selectedNode.type === 'category' && selectedNode.channels && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        채널 수: {selectedNode.channels.length}개
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedNode.channels.slice(0, 5).map((channel) => (
                          <div key={channel.id} className="flex items-center space-x-2 text-sm">
                            <img
                              src={channel.thumbnailUrl}
                              alt={channel.title}
                              className="w-6 h-6 rounded-full object-cover object-top"
                            />
                            <span className="text-gray-700 truncate flex-1">{channel.title}</span>
                            <span className="text-xs text-gray-500">
                              {formatNumber(channel.subscriberCount)}
                            </span>
                          </div>
                        ))}
                        {selectedNode.channels.length > 5 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{selectedNode.channels.length - 5}개 더
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'channel' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">구독자:</span>
                        <span className="font-medium">
                          {formatNumber(selectedNode.subscriberCount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">영상 수:</span>
                        <span className="font-medium">
                          {selectedNode.videoCount || 0}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'root' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 카테고리:</span>
                        <span className="font-medium">{mockCategories.length}개</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 채널:</span>
                        <span className="font-medium">{mockChannels.length}개</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="ri-cursor-line text-3xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500 text-sm">노드를 클릭하여 상세 정보를 확인하세요</p>
                </div>
              )}
            </Card>

            {/* Statistics */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">통계</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">총 카테고리</span>
                  <span className="font-medium">{mockCategories.length}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">총 채널</span>
                  <span className="font-medium">{mockChannels.length}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">평균 채널/카테고리</span>
                  <span className="font-medium">
                    {Math.round(mockChannels.length / mockCategories.length)}개
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">총 구독자</span>
                  <span className="font-medium">
                    {formatNumber(mockChannels.reduce((sum, channel) => sum + channel.subscriberCount, 0))}
                  </span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">작업</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.REACT_APP_NAVIGATE('/channels')}
                >
                  <i className="ri-list-check mr-2"></i>
                  채널 목록 보기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.REACT_APP_NAVIGATE('/analysis')}
                >
                  <i className="ri-bar-chart-line mr-2"></i>
                  분석 보기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => generateMindMapData()}
                >
                  <i className="ri-refresh-line mr-2"></i>
                  새로고침
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.REACT_APP_NAVIGATE('/connect')}
                >
                  <i className="ri-settings-line mr-2"></i>
                  연결 설정
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
