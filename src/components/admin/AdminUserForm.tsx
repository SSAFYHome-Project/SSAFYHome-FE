import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaEnvelope } from "react-icons/fa";
import schoolMarker from "../../assets/img/school.png";
import companyMarker from "../../assets/img/company.png";
import "../../styles/AuthBox.css";

interface AddressDto {
  title: string;
  address: string;
  detailAddress: string;
  x: string;
  y: string;
}

interface UserSummary {
  name: string;
  email: string;
  role: string;
  profile?: string;
  address: AddressDto[];
}

const AdminUserForm = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [keyword, setKeyword] = useState("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users/all", getAuthHeader());
      setUsers(res.data);
    } catch (err) {
      console.error("전체 회원 정보 불러오기 실패:", err);
    }
  };

  const fetchUsersByKeyword = async () => {
    try {
      const res = await axios.get(`/api/admin/users?keyword=${keyword}`, getAuthHeader());
      setUsers(res.data);
    } catch (err) {
      console.error("검색 실패:", err);
    }
  };

  const handleSearch = () => {
    keyword.trim() ? fetchUsersByKeyword() : fetchAllUsers();
  };

  const handleDelete = async (email: string) => {
    if (!window.confirm(`정말 ${email} 회원을 삭제하시겠습니까?`)) return;
    try {
      await axios.delete(`/api/admin/users/${email}`, getAuthHeader());
      alert("삭제되었습니다.");
      fetchAllUsers();
    } catch (err) {
      alert("삭제 실패: " + (err.response?.data?.message || "오류 발생"));
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const getMarkerIcon = (title: string) => {
    if (title === "SCHOOL") return schoolMarker;
    if (title === "COMPANY") return companyMarker;
    return null;
  };

  const getAddressLabel = (title: string) => {
    if (title === "COMPANY") return "직장";
    if (title === "SCHOOL") return "학교";
    return title;
  };

  return (
    <div className="admin-user-wrapper">
      <h2>회원정보 관리</h2>

      <div className="admin-user-search">
        <input
          type="text"
          placeholder="이름·이메일 포함 키워드로 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={handleSearch}>
          <FaSearch />
          검색
        </button>
      </div>

      <div className="admin-user-list">
        {users.length === 0 ? (
          <p>회원 정보가 없습니다.</p>
        ) : (
          users.map((user, idx) => (
            <div key={idx} className="admin-user-card">
              <div className="profile-section">
                {user.profile ? (
                  <img src={`data:image/png;base64,${user.profile}`} alt="프로필" className="profile-img" />
                ) : (
                  <div className="profile-placeholder" />
                )}
              </div>

              <div className="info-section">
                <div className="info-header">
                  <strong>{user.name}</strong>
                  <span className={`role-badge ${user.role === "ROLE_ADMIN" ? "admin" : "user"}`}>
                    {user.role === "ROLE_ADMIN" ? "ADMIN" : "USER"}
                  </span>
                </div>

                <div className="info-email">
                  <FaEnvelope style={{ marginRight: "6px", color: "#666" }} />
                  {user.email}
                </div>

                <div className="info-address">
                  {user.address.length === 0 ? (
                    <span className="no-address">-</span>
                  ) : (
                    user.address.map((addr, i) => (
                      <div key={i} className="address-item">
                        {getMarkerIcon(addr.title) && (
                          <img src={getMarkerIcon(addr.title)!} alt={addr.title} className="address-icon" />
                        )}
                        <span>
                          <strong>[{getAddressLabel(addr.title)}]</strong>
                          &nbsp;&nbsp;{addr.address} {addr.detailAddress}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="delete-section">
                <button className="delete-btn" onClick={() => handleDelete(user.email)}>
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUserForm;
