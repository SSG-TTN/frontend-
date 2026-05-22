import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Home as HomeIcon, Library, RefreshCw, Star, Search, ShieldAlert, Award } from 'lucide-react';
import './App.css';

// Cấu hình URL cơ sở gọi API Backend
const API_BASE_URL = 'http://localhost:5000/api';

// --- COMPONENT BỐ CỤC CHUNG (LAYOUT) ---
function Layout({ children }) {
  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="logo">
          <BookOpen size={28} className="logo-icon" />
          <span>Antigravity Books</span>
        </Link>
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <HomeIcon size={18} />
              Trang Chủ
            </NavLink>
          </li>
          <li>
            <NavLink to="/books" className={({ isActive }) => isActive ? 'active' : ''}>
              <Library size={18} />
              Tủ Sách
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} <span>Antigravity Books</span>. Nền tảng đọc sách thế hệ mới.</p>
      </footer>
    </div>
  );
}

// --- TRANG CHỦ (HOME PAGE) ---
function Home() {
  const [serverStatus, setServerStatus] = useState({ loading: true, online: false, data: null });

  const checkStatus = async () => {
    setServerStatus(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);
      setServerStatus({
        loading: false,
        online: true,
        data: response.data
      });
    } catch (error) {
      console.error('Lỗi khi gọi API Backend:', error);
      setServerStatus({
        loading: false,
        online: false,
        data: null
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Nền Tảng Đọc Sách <span>Hiện Đại & Mượt Mà</span></h1>
        <p>
          Chào mừng đến với thư viện trực tuyến thế hệ mới của bạn. 
          Hỗ trợ đọc truyện tốc độ cao, giao diện tối ưu trải nghiệm người dùng tối đa.
        </p>
        <Link to="/books" className="cta-button">
          <Library size={20} />
          Khám Phá Tủ Sách Ngay
        </Link>
      </div>

      <div className="status-card">
        <div className="status-header">
          <div className="status-title">
            <RefreshCw size={18} style={{ cursor: 'pointer' }} onClick={checkStatus} className={serverStatus.loading ? 'spin' : ''} />
            Kiểm tra kết nối API Backend
          </div>
          <div className={`status-badge ${serverStatus.online ? 'online' : 'offline'}`}>
            <span className={`pulse-dot ${serverStatus.online ? '' : 'offline'}`}></span>
            {serverStatus.online ? 'Hoạt động' : 'Ngoại tuyến'}
          </div>
        </div>

        {serverStatus.loading ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Đang kết nối...</p>
          </div>
        ) : serverStatus.online ? (
          <div className="status-details">
            <div className="status-row">
              <span>Nội dung phản hồi:</span>
              <span className="status-value">{serverStatus.data?.message}</span>
            </div>
            <div className="status-row">
              <span>Đường dẫn (URL):</span>
              <span className="status-value">{`${API_BASE_URL}/status`}</span>
            </div>
            <div className="status-row">
              <span>Môi trường chạy:</span>
              <span className="status-value" style={{ textTransform: 'capitalize' }}>{serverStatus.data?.environment}</span>
            </div>
            <div className="status-row">
              <span>Thời gian phản hồi:</span>
              <span className="status-value">{new Date(serverStatus.data?.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ) : (
          <div className="status-details" style={{ color: '#ef4444', textAlign: 'center', padding: '1rem 0' }}>
            <ShieldAlert size={36} style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: '600' }}>Không thể kết nối đến Backend!</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Hãy khởi chạy Express Server bằng lệnh <strong>npm run dev</strong> tại thư mục <code>/backend</code> ở Port 5000.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- TRANG DANH SÁCH TRUYỆN (BOOK LIST PAGE) ---
function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/books`);
        setBooks(response.data);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải danh sách sách:', err);
        setError('Không thể kết nối với Backend hoặc cơ sở dữ liệu chưa sẵn sàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Lấy các thể loại duy nhất để đưa vào bộ lọc
  const categories = ['all', ...new Set(books.map(book => book.category))];

  // Lọc sách theo từ khóa tìm kiếm và thể loại
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
        <h3>Đang tải kho sách...</h3>
        <p>Vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-wrapper">
        <ShieldAlert size={48} className="error-icon" />
        <h3>Lỗi kết nối ứng dụng</h3>
        <p>{error}</p>
        <button className="cta-button" style={{ marginTop: '1.5rem' }} onClick={() => window.location.reload()}>
          Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="booklist-page">
      <div className="booklist-header">
        <div className="booklist-title-area">
          <h2>Kho Sách Đặc Sắc</h2>
          <p>Tìm kiếm cuốn sách yêu thích của bạn và bắt đầu hành trình đọc ngay hôm nay.</p>
        </div>

        <div className="search-filter-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên sách hoặc tên tác giả..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Tất cả thể loại' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredBooks.length > 0 ? (
        <div className="book-grid">
          {filteredBooks.map(book => (
            <div key={book.id} className="book-card">
              <div className="book-cover-wrapper">
                <img src={book.coverUrl} alt={book.title} className="book-cover" />
                <span className="book-category">{book.category}</span>
              </div>
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <span className="book-author">Tác giả: {book.author}</span>
                <p className="book-description">{book.description}</p>
                <div className="book-footer">
                  <div className="book-rating">
                    <Star size={16} fill="currentColor" />
                    <span>{book.rating.toFixed(1)}</span>
                  </div>
                  <button className="read-button">Đọc Sách</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-wrapper">
          <Award size={48} className="empty-icon" />
          <h3>Không tìm thấy cuốn sách nào</h3>
          <p>Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc thể loại xem sao.</p>
        </div>
      )}
    </div>
  );
}

// --- KHỞI CHẠY ĐỊNH TUYẾN ROUTING CHÍNH (APP ROUTER) ---
export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookList />} />
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <ShieldAlert size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
              <h2>404 - Không tìm thấy trang</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Đường dẫn bạn truy cập hiện tại không khả dụng.</p>
              <Link to="/" className="cta-button" style={{ marginTop: '1.5rem' }}>Quay về Trang chủ</Link>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
