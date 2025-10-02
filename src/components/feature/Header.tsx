
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '대시보드', icon: 'ri-dashboard-line' },
    { path: '/channels', label: '채널 관리', icon: 'ri-youtube-line' },
    { path: '/mindmap', label: '마인드맵', icon: 'ri-mind-map' },
    { path: '/analysis', label: '분석', icon: 'ri-bar-chart-line' },
    { path: '/query', label: '질의 시스템', icon: 'ri-question-line' },
    { path: '/connect', label: '계정 연결', icon: 'ri-link' }
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-youtube-fill text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                YouTube 분석 시스템
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  location.pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
            >
              <i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-lg`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  location.pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
