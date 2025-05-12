import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import "../styles/SearchBar.css";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

interface Props {
  onFilterChange?: (filters: { sido: string; gugun: string; dong: string; regionCode: string; yyyymm: string }) => void;
}

const SearchBar = ({ onFilterChange }: Props) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await axios.get(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
            },
          }
        );
        setSuggestions(res.data.documents);
      } catch (err) {
        console.error("자동완성 실패:", err);
      }
    });

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (place: any) => {
    setQuery(place.place_name);
    setSuggestions([]);

    try {
      const { x: lng, y: lat } = place;
      const regionRes = await axios.get(`https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`, {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      });

      const region = regionRes.data.documents[0];
      const filters = {
        sido: region.region_1depth_name,
        gugun: region.region_2depth_name,
        dong: region.region_3depth_name,
        regionCode: region.code.slice(0, -2),
        yyyymm: "202501",
      };

      console.log("선택된 지역 필터:", filters);
      if (onFilterChange) onFilterChange(filters);
    } catch (err) {
      console.error("좌표 → 행정동 변환 실패:", err);
    }
  };

  return (
    <div className="search-bar-container" style={{ position: "relative" }}>
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="지역, 건물명으로 검색하세요."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search-button" onClick={() => setQuery(query)}>
          검색
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestion-list">
          {suggestions.map((item, idx) => (
            <li key={idx} onClick={() => handleSelect(item)} className="suggestion-item">
              {item.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
