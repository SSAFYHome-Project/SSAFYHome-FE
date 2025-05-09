import '../styles/SearchBar.css'
import { useState } from 'react'
import { FaSearch } from 'react-icons/fa'

interface Props {
  onSearchComplete?: () => void
}

const SearchBar = ({ onSearchComplete }: Props) => {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (onSearchComplete) onSearchComplete()

    if (!query.trim()) return

    // ✅ 백엔드에 GET 요청
    fetch(`/api/search?keyword=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        console.log('검색 결과:', data)
        // 👉 필요 시 결과 상태 업데이트 또는 부모에 전달 가능
        if (onSearchComplete) onSearchComplete()
      })
      .catch(err => {
        console.error('검색 실패:', err)
      })

  }

  return (
    <div className="search-bar-container">
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="지역, 건물명으로 검색하세요."
        />
        <button className="search-button" onClick={handleSearch}>
          검색
        </button>
      </div>
    </div>
  )
}

export default SearchBar
