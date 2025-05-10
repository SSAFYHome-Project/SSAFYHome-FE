import { useEffect, useState } from 'react'
import '../styles/FilterBar.css'

// 지역 데이터를 담는 타입 정의
type Region = { code: string; name: string }

interface Props {
  onFilterChange?: (filters: {
    sido: string;
    gugun: string;
    dong: string;
    yyyymm: string;
  }) => void;
}

const FilterBar = ({ onFilterChange }: Props) => {
  const [sidoList, setSidoList] = useState<Region[]>([])
  const [gugunList, setGugunList] = useState<Region[]>([])
  const [dongList, setDongList] = useState<Region[]>([])

  const [selectedSido, setSelectedSido] = useState('')
  const [selectedGugun, setSelectedGugun] = useState('')
  const [selectedDong, setSelectedDong] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  // 시도 불러오기
  useEffect(() => {
    fetch('/api/map/sido')
      .then(res => res.json())
      .then(data => {
        const sidoArray = data?.admVOList?.admVOList || []
        const formatted = sidoArray.map((item: any) => ({
          code: item.admCode,
          name: item.admCodeNm
        }))
        setSidoList(formatted)
      })
      .catch(err => {
        console.error('시도 데이터를 불러오지 못했습니다.', err)
        setSidoList([])
      })
  }, [])

  // 구군 불러오기
  useEffect(() => {
    if (!selectedSido) {
      setGugunList([])
      setSelectedGugun('')
      setDongList([])
      setSelectedDong('')
      return
    }

    fetch(`/api/map/gugun?sidoCode=${selectedSido}`)
      .then(res => res.json())
      .then(data => {
        const gugunArray = data?.admVOList?.admVOList || []
        const formatted = gugunArray.map((item: any) => ({
          code: item.admCode,
          name: item.lowestAdmCodeNm
        }))
        setGugunList(formatted)
      })
      .catch(err => {
        console.error('구군 데이터를 불러오지 못했습니다.', err)
        setGugunList([])
      })
  }, [selectedSido])

  // 동 불러오기
  useEffect(() => {
    if (!selectedGugun) {
      setDongList([])
      setSelectedDong('')
      return
    }

    fetch(`/api/map/dong?gugunCode=${selectedGugun}`)
      .then(res => res.json())
      .then(data => {
        const dongArray = data?.admVOList?.admVOList || []
        const formatted = dongArray.map((item: any) => ({
          code: item.admCode,
          name: item.lowestAdmCodeNm
        }))
        setDongList(formatted)
      })
      .catch(err => {
        console.error('읍면동 데이터를 불러오지 못했습니다.', err)
        setDongList([])
      })
  }, [selectedGugun])

  // ✅ 필터 전달
  const handleFilter = () => {
    const filters = {
      sido: selectedSido,
      gugun: selectedGugun,
      dong: selectedDong,
      yyyymm: selectedMonth
    }

    console.log('선택한 필터:', filters)

    if (onFilterChange) {
      onFilterChange(filters)
    }
  }

  return (
    <div className="filter-bar-container">
      <div className="filter-box">
        {/* 시도 선택 */}
        <select
          className="filter-select"
          value={selectedSido}
          onChange={e => setSelectedSido(e.target.value)}
        >
          <option value="">시도 선택</option>
          {sidoList.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>

        {/* 구군 선택 */}
        <select
          className="filter-select"
          value={selectedGugun}
          onChange={e => setSelectedGugun(e.target.value)}
          disabled={!selectedSido}
        >
          <option value="">구군 선택</option>
          {gugunList.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>

        {/* 읍면동 선택 */}
        <select
          className="filter-select"
          value={selectedDong}
          onChange={e => setSelectedDong(e.target.value)}
          disabled={!selectedGugun}
        >
          <option value="">읍면동 선택</option>
          {dongList.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>

        {/* 날짜 선택 */}
        <input
          type="month"
          className="filter-select"
          value={
            selectedMonth
              ? `${selectedMonth.slice(0, 4)}-${selectedMonth.slice(4, 6)}`
              : ''
          }
          onChange={e => setSelectedMonth(e.target.value.replace('-', ''))}
        />

        {/* 조회 버튼 */}
        <button className="filter-button" onClick={handleFilter}>
          조회
        </button>
      </div>
    </div>
  )
}

export default FilterBar
