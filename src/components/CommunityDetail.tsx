import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CommunityDetail.css";
import heartIcon from "../assets/img/heart.png";
import heartHoverIcon from "../assets/img/heart-filled.png";
import eyeIcon from "../assets/img/eye.png";

export default function CommunityDetail() {
  const location = useLocation();
  const { id } = location.state || {};
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!id) {
      alert("잘못된 접근입니다.");
      navigate("/community");
      return;
    }

    axios
      .get(`/api/community/board/${id}`)
      .then((res) => {
        setPost(res.data);
        setLikeCount(res.data.boardRecommendCnt || 0);
      })
      .catch((err) => {
        console.error("글 불러오기 실패:", err);
        alert("게시글을 불러오는 데 실패했습니다.");
        navigate("/community");
      });

    axios
      .get(`/api/community/board/${id}/reply`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error("댓글 불러오기 실패:", err));
  }, [id, navigate]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(
        `/api/community/board/${id}/reply`,
        { replyContent: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      const res = await axios.get(`/api/community/board/${id}/reply`);
      setComments(res.data);
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("정말 삭제하시겠습니까?");
    if (!confirm) return;
    try {
      await axios.delete(`/api/community/board/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/community");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  //   const handleEdit = () => {
  //     navigate(`/community/edit/${id}`);
  //   };

  const handleLikeToggle = async () => {
    try {
      const url = `/api/community/board/${id}/recommand`;
      if (!liked) {
        await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        setLikeCount((prev) => prev + 1);
      } else {
        await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
        setLikeCount((prev) => prev - 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error("좋아요 처리 실패:", err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  if (!post) return <div className="community-detail-loading">로딩 중...</div>;

  return (
    <div className="community-detail-container">
      <div className="community-detail-header">
        <div className="interaction-row">
          <div className="icon-info" onClick={handleLikeToggle}>
            <img src={liked ? heartHoverIcon : heartIcon} alt="좋아요" className="icon" />
            <span>{likeCount}</span>
          </div>
          <div className="icon-info">
            <img src={eyeIcon} alt="본 사람 수" className="icon" />
            {/* <img src="/assets/img/comment.png" alt="댓글 수" className="icon" /> */}
            <span>{comments.length}</span>
          </div>
          <button className="share-button">📤 여기를 눌러 공유해보세요.</button>
        </div>

        <h1 className="community-detail-title">{post.boardTitle}</h1>

        <div className="writer-info">
          <span className="writer-name">{post.userName}</span>
          <span className="writer-date">{post.boardRegDate}</span>
        </div>
      </div>

      <div className="community-detail-content">{post.boardContent}</div>

      <div className="community-detail-actions">
        <button onClick={() => navigate("/community")} className="action-button">
          뒤로가기
        </button>
        <button onClick={handleDelete} className="action-button delete">
          삭제
        </button>
      </div>

      <div className="community-detail-comments">
        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="댓글을 입력하세요" />
        <button onClick={handleCommentSubmit} className="comment-submit">
          댓글 남기기
        </button>

        <ul className="comment-list">
          {comments.map((comment: any) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-profile">
                <div>
                  <strong>{comment.username}</strong>
                  <span className="comment-date">{comment.replyRegDate}</span>
                </div>
              </div>
              <p>{comment.replyContent}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
