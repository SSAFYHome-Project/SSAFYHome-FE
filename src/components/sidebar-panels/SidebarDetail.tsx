import { useEffect, useState } from 'react'
import '../../styles/SideBarPanel.css'

import heartFilledIcon from '../../assets/img/heart-filled.png'
import heartEmptyIcon from '../../assets/img/heart.png'
import PriceChart from './PriceChart'

interface SidebarDetailProps {
  aptCode: string
}

interface ChartItem {
  date: string
  price: number
}

const SidebarDetail = ({ aptCode }: SidebarDetailProps) => {
  const [selectedType, setSelectedType] = useState<'매매' | '전원세'>('매매')
  const [isFavorited, setIsFavorited] = useState(false)
  const [chartData, setChartData] = useState<ChartItem[]>([])

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const res = await fetch(`/api/map/search/${aptCode}`)
        const data = await res.json()
        setIsFavorited(data.isFavorited)
      } catch (err) {
        console.error('관심 여부 확인 실패', err)
      }
    }

    // ★ Dummy chart data for testing
    const dummyChartData = [
      { date: '24.11', price: 30.2 },
      { date: '24.12', price: 32.5 },
      { date: '25.01', price: 33.1 },
      { date: '25.02', price: 34.0 },
      { date: '25.03', price: 36.5 },
      { date: '25.04', price: 37.2 }
    ]
    setChartData(dummyChartData)

    fetchFavoriteStatus()
  }, [aptCode])

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <h2>롯데캐슬프레미어</h2>
        <div className="favorite-box">
          <img
            src={isFavorited ? heartFilledIcon : heartEmptyIcon}
            alt="즐겨찾기"
            className="heart-img"
          />
          <span>{isFavorited ? '삭제하기' : '추가하기'}</span>
        </div>
      </div>

      <p className="panel-subtitle">서울특별시 강남구 삼성동 11</p>
      <p className="panel-meta">건물 11동 · 713세대 · 최저 13F / 최고 22F · 2007년</p>

      <div className="panel-select-row">
        <button
          className={`btn-type ${selectedType === '매매' ? 'active' : ''}`}
          onClick={() => setSelectedType('매매')}
        >
          매매
        </button>
        <button
          className={`btn-type ${selectedType === '전원세' ? 'active' : ''}`}
          onClick={() => setSelectedType('전원세')}
        >
          전·월세
        </button>
        <select className="size-select">
          <option>전용 25.56평</option>
        </select>
      </div>

      <div className="panel-summary">
        <div className="summary-item">
          <div className="summary-label">
            <span className="summary-title">최근 실거래</span>
            <span className="summary-date">25.05.03</span>
          </div>
          <div className="price-row">
            <strong>37.2억</strong>
            <span className="summary-floor">(12층)</span>
          </div>
        </div>

        <div className="vertical-divider" />

        <div className="summary-item">
          <div className="summary-label">
            <span className="summary-title">매물 최저가</span>
            <span className="summary-date">25.05.03</span>
          </div>
          <div className="price-row">
            <strong>37.2억</strong>
            <span className="summary-floor">(12층)</span>
          </div>
        </div>
      </div>

      <div className="panel-chart">
        {chartData.length > 0 ? (
          <PriceChart data={chartData} />
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>차트 데이터 없음</p>
        )}
      </div>

      <div className="panel-table">
        <table>
          <thead>
            <tr>
              <th>거래일</th>
              <th>정보</th>
              <th>가격</th>
              <th>층</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, idx) => (
              <tr key={idx}>
                <td>2025.05.03</td>
                <td>매매</td>
                <td>37억 2000만원</td>
                <td>12층</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">&lt; 1 2 3 4 5 &gt;</div>
      </div>

      <p className="data-source">2025.05 국토교통부 기준</p>
    </div>
  )
}

export default SidebarDetail
