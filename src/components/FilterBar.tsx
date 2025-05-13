import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/FilterBar.css";

type Region = { code: string; name: string };

interface Props {
  onFilterChange?: (filters: { sido: string; gugun: string; dong: string; regionCode: string; yyyymm: string }) => void;
}

const FilterBar = ({ onFilterChange }: Props) => {
  const [sidoList, setSidoList] = useState<Region[]>([]);
  const [gugunList, setGugunList] = useState<Region[]>([]);
  const [dongList, setDongList] = useState<Region[]>([]);

  const [selectedSido, setSelectedSido] = useState("");
  const [selectedGugun, setSelectedGugun] = useState("");
  const [selectedDong, setSelectedDong] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const getSidoList = async () => {
      try {
        const response = await axios.get(`/api/map/sido`);
        const sidoArray = response.data?.admVOList?.admVOList || [];

        const formatted = sidoArray.map((item: any) => ({
          code: item.admCode,
          name: item.admCodeNm,
        }));

        setSidoList(formatted);
      } catch (error) {
        console.error("시도 데이터를 불러오지 못했습니다.", error);
        setSidoList([]);
      }
    };
    getSidoList();
  }, []);

  useEffect(() => {
    if (!selectedSido) {
      setGugunList([]);
      setSelectedGugun("");
      setDongList([]);
      setSelectedDong("");
      return;
    }

    const getGugunList = async () => {
      try {
        const response = await axios.get(`/api/map/gugun?sidoCode=${selectedSido}`);
        const gugunArray = response.data?.admVOList?.admVOList || [];
        const formatted = gugunArray.map((item: any) => ({
          code: item.admCode,
          name: item.lowestAdmCodeNm,
        }));
        setGugunList(formatted);
      } catch (error) {
        console.error("구군 데이터를 불러오지 못했습니다.", error);
        setGugunList([]);
      }
    };
    getGugunList();
  }, [selectedSido]);

  useEffect(() => {
    if (!selectedGugun) {
      setDongList([]);
      setSelectedDong("");
      return;
    }

    const getDongList = async () => {
      try {
        const response = await axios.get(`/api/map/dong?gugunCode=${selectedGugun}`);
        const dongArray = response.data?.admVOList?.admVOList || [];
        const formatted = dongArray.map((item: any) => ({
          code: item.admCode,
          name: item.lowestAdmCodeNm,
        }));
        setDongList(formatted);
      } catch (error) {
        console.error("읍면동 데이터를 불러오지 못했습니다.", error);
        setDongList([]);
      }
    };
    getDongList();
  }, [selectedGugun]);

  const handleFilter = () => {
    const sidoName = sidoList.find((item) => item.code === selectedSido)?.name || "";
    const gugunName = gugunList.find((item) => item.code === selectedGugun)?.name || "";
    const dongName = dongList.find((item) => item.code === selectedDong)?.name || "";

    const filters = {
      sido: sidoName,
      gugun: gugunName,
      dong: dongName,
      regionCode: selectedDong,
      yyyymm: selectedMonth,
    };

    console.log("선택한 필터:", filters);

    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  return (
    <div className="filter-bar-container">
      <div className="filter-box">
        <select className="filter-select" value={selectedSido} onChange={(e) => setSelectedSido(e.target.value)}>
          <option value="">시도 선택</option>
          {sidoList.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedGugun}
          onChange={(e) => setSelectedGugun(e.target.value)}
          disabled={!selectedSido}
        >
          <option value="">구군 선택</option>
          {gugunList.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedDong}
          onChange={(e) => setSelectedDong(e.target.value)}
          disabled={!selectedGugun}
        >
          <option value="">읍면동 선택</option>
          {dongList.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>

        <input
          type="month"
          className="filter-select"
          value={selectedMonth ? `${selectedMonth.slice(0, 4)}-${selectedMonth.slice(4, 6)}` : ""}
          onChange={(e) => setSelectedMonth(e.target.value.replace("-", ""))}
        />

        <button className="filter-button" onClick={handleFilter}>
          조회
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
