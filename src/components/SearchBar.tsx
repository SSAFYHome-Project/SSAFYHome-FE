import { useState, useEffect, useRef } from "react";
import { FaSearch, FaSubway, FaSchool, FaCoffee, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import "../styles/SearchBar.css";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

interface Props {
  onFilterChange?: (filters: { sido: string; gugun: string; dong: string; regionCode: string; yyyymm: string }) => void;
}

const SearchBar = ({ onFilterChange }: Props) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [filters, setFilters] = useState<any | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
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
        setSelectedIndex(-1);
      } catch (err) {
        console.error("자동완성 실패:", err);
      }
    };

    fetchSuggestions();
  }, [query]);

  const getCategoryIcon = (category: string, placeName: string) => {
    if (category.includes("교통") || placeName.includes("역"))
      return <FaSubway style={{ marginRight: 6, color: "#3478f6" }} />;
    if (category.includes("학교")) return <FaSchool style={{ marginRight: 6, color: "#2c974b" }} />;
    if (category.includes("카페")) return <FaCoffee style={{ marginRight: 6, color: "#a06b4f" }} />;
    return <FaMapMarkerAlt style={{ marginRight: 6, color: "#999" }} />;
  };

  const getSimpleCategory = (category: string) => {
    const parts = category.split(">").map((p) => p.trim());
    return parts[0] || "";
  };

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
      const filterObj = {
        sido: region.region_1depth_name,
        gugun: region.region_2depth_name,
        dong: region.region_3depth_name,
        regionCode: region.code.slice(0, -2),
        yyyymm: "202501",
      };

      setFilters(filterObj);
    } catch (err) {
      console.error("좌표 → 행정동 변환 실패:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleSearch = () => {
    if (filters && onFilterChange) {
      onFilterChange(filters);
    } else {
      alert("지역을 먼저 선택해주세요.");
    }
  };

  return (
    <div className="search-bar-container" style={{ position: "relative" }}>
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          ref={inputRef}
          className="search-input"
          placeholder="지역, 건물명으로 검색하세요."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="search-button" onClick={handleSearch}>
          검색
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestion-list">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              className={`suggestion-item ${idx === selectedIndex ? "selected" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {getCategoryIcon(item.category_name, item.place_name)}
                <strong>{item.place_name}</strong>
              </div>
              <small>{getSimpleCategory(item.category_name)}</small>
              <span>{item.road_address_name || item.address_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
