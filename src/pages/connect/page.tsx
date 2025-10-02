
import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import { syncChannelData, loadChannelsFromStorage, syncWithMockData } from '../../utils/youtubeApi';
import { getOAuthUrl, exchangeCodeForToken, saveTokens, getValidAccessToken, clearTokens, isAuthenticated } from '../../utils/youtubeOAuth';
import type { YouTubeChannel } from '../../utils/youtubeApi';

export default function Connect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [categories, setCategories] = useState<{ [category: string]: YouTubeChannel[] }>({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Get API key from environment variable or localStorage
    const envApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const savedApiKey = localStorage.getItem('youtube_api_key');

    const apiKeyToUse = envApiKey || savedApiKey;

    if (apiKeyToUse) {
      setApiKey(apiKeyToUse);
    }

    // OAuth 콜백 처리 (Implicit Flow - URL fragment에서 token 받기)
    const handleOAuthCallback = async () => {
      // URL fragment(#)에서 access token 파싱
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const expiresIn = params.get('expires_in');

      if (accessToken) {
        setIsConnecting(true);
        setConnectionStatus('connecting');

        try {
          // Access token 저장
          const tokens: any = {
            access_token: accessToken,
            expires_in: parseInt(expiresIn || '3600'),
            token_type: 'Bearer',
            scope: params.get('scope') || ''
          };
          saveTokens(tokens);

          // YouTube 데이터 동기화
          const { channels: fetchedChannels, categories: fetchedCategories } = await syncChannelData(
            apiKeyToUse || '',
            accessToken
          );

          setChannels(fetchedChannels);
          setCategories(fetchedCategories);
          setIsConnected(true);
          setConnectionStatus('success');

          // URL에서 fragment 제거
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('OAuth callback error:', error);
          setConnectionStatus('error');
          setErrorMessage(`인증 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : ''}`);
        } finally {
          setIsConnecting(false);
        }
        return;
      }

      // 기존 인증 상태 확인
      isAuthenticated().then(authenticated => {
        if (authenticated) {
          // Load existing channel data
          const { channels: savedChannels, categories: savedCategories } = loadChannelsFromStorage();

          if (savedChannels && savedChannels.length > 0) {
            setIsConnected(true);
            setConnectionStatus('success');
            setChannels(savedChannels);
            setCategories(savedCategories);
          }
        }
      });
    };

    handleOAuthCallback();
  }, []);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('YouTube API キーを入力してください。');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');
    setErrorMessage('');

    try {
      // OAuth access token 가져오기
      const accessToken = await getValidAccessToken();

      // Call real YouTube API with OAuth token
      const { channels: fetchedChannels, categories: fetchedCategories } = await syncChannelData(apiKey, accessToken || undefined);

      setChannels(fetchedChannels);
      setCategories(fetchedCategories);
      setIsConnected(true);
      setConnectionStatus('success');

      // Save to localStorage
      localStorage.setItem('youtube_api_key', apiKey);

    } catch (error) {
      console.error('YouTube API接続エラー:', error);

      // If OAuth error (401), use mock data as fallback
      if (error instanceof Error && error.message.includes('OAuth 2.0')) {
        console.log('Falling back to mock data for development...');
        const { channels: mockChannels, categories: mockCategories } = await syncWithMockData();
        setChannels(mockChannels);
        setCategories(mockCategories);
        setIsConnected(true);
        setConnectionStatus('success');
        setErrorMessage('OAuth認証が必要なため、デモデータを使用しています。');
      } else {
        setConnectionStatus('error');
        setErrorMessage(`API接続に失敗しました。APIキーを確認してください。${error instanceof Error ? error.message : ''}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionStatus('idle');
    setApiKey('');
    setChannels([]);
    setCategories({});
    setErrorMessage('');
    clearTokens();
    localStorage.removeItem('youtube_channels');
    localStorage.removeItem('youtube_api_key');
    localStorage.removeItem('youtube_last_sync');
    localStorage.removeItem('youtube_categories');
  };

  const handleOAuthConnect = async () => {
    // Google OAuth 인증 페이지로 리다이렉트
    const oauthUrl = await getOAuthUrl();
    window.location.href = oauthUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">YouTube アカウント接続</h1>
          <p className="text-gray-600">YouTube APIを通じて購読チャンネル情報を取得し、自動的に分類します。</p>
        </div>

        {!isConnected ? (
          <div className="space-y-6">
            {/* OAuth Connection */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <i className="ri-google-line mr-2 text-red-500"></i>
                Google アカウントで接続（推奨）
              </h2>
              <p className="text-gray-600 mb-4">
                Google アカウントで安全にログインして、YouTube 購読情報にアクセスします。
              </p>
              <Button
                onClick={handleOAuthConnect}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isConnecting}
                loading={isConnecting && connectionStatus === 'connecting'}
              >
                <i className="ri-google-line mr-2"></i>
                Google で接続
              </Button>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">または</span>
              </div>
            </div>

            {/* API Key Connection */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">API キーで接続</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube Data API v3 キー
                  </label>
                  <Input
                    type="password"
                    placeholder="AIzaSyC-dK_x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isConnecting}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Google Cloud Console で YouTube Data API v3 キーを発行して入力してください。
                  </p>
                </div>
                
                <Button
                  onClick={handleConnect}
                  disabled={!apiKey.trim() || isConnecting}
                  loading={isConnecting}
                  className="w-full"
                >
                  <i className="ri-link mr-2"></i>
                  YouTube アカウント接続
                </Button>

                {connectionStatus === 'connecting' && (
                  <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                    <div className="animate-spin mr-3">
                      <i className="ri-loader-4-line text-blue-600"></i>
                    </div>
                    <span className="text-blue-700">YouTube API 接続中...</span>
                  </div>
                )}

                {connectionStatus === 'error' && errorMessage && (
                  <div className="flex items-center p-4 bg-red-50 rounded-lg">
                    <i className="ri-error-warning-line text-red-600 mr-3"></i>
                    <span className="text-red-700">{errorMessage}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Instructions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API キー発行方法</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p>Google Cloud Console (console.cloud.google.com) にアクセスします。</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p>新しいプロジェクトを作成するか、既存のプロジェクトを選択します。</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p>API とサービス → ライブラリで「YouTube Data API v3」を検索して有効化します。</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <p>API とサービス → 認証情報で「認証情報を作成」→「API キー」を選択します。</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    5
                  </div>
                  <p>生成された API キーをコピーして上記の入力欄に貼り付けます。</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Success */}
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-check-line text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">接続完了</h3>
                    <p className="text-gray-600">YouTube アカウントが正常に接続されました。</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                >
                  接続解除
                </Button>
              </div>
            </Card>

            {/* Account Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アカウント情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {channels.length}
                  </div>
                  <div className="text-sm text-gray-600">購読チャンネル</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.keys(categories).length}
                  </div>
                  <div className="text-sm text-gray-600">自動分類カテゴリ</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">今</div>
                  <div className="text-sm text-gray-600">最終同期</div>
                </div>
              </div>
            </Card>

            {/* Auto Classification Status */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">自動分類状況</h3>
              <div className="space-y-3">
                {Object.entries(categories).length > 0 ? (
                  Object.entries(categories).map(([categoryName, categoryChannels], index) => {
                    const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo', 'red', 'yellow'];
                    const color = colors[index % colors.length];
                    const percentage = channels.length > 0 ? (categoryChannels.length / channels.length) * 100 : 0;

                    return (
                      <div key={categoryName} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{categoryName}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className={`bg-${color}-600 h-2 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{categoryChannels.length}個</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">カテゴリ情報がありません</p>
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">次のステップ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => window.REACT_APP_NAVIGATE('/mindmap')}
                  className="flex items-center justify-center"
                >
                  <i className="ri-mind-map mr-2"></i>
                  マインドマップで表示
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.REACT_APP_NAVIGATE('/channels')}
                  className="flex items-center justify-center"
                >
                  <i className="ri-list-check mr-2"></i>
                  チャンネル一覧を表示
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
