import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CommunityDetail.css";
import heartIcon from "../assets/img/heart.png";
import heartHoverIcon from "../assets/img/heart-filled.png";
import eyeIcon from "../assets/img/eye.png";
import { HiOutlineExclamationCircle } from "react-icons/hi";

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
  const myUserEmail = localStorage.getItem("userEmail");

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
        setLiked(res.data.recommended || false);
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

  const handleEdit = () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    if (post.userEmail?.toString() !== myUserEmail) {
      alert("본인이 작성한 게시글만 수정할 수 있습니다.");
      return;
    }
    navigate(`/community-edit/${id}`, { state: { post } });
  };

  const handleDelete = async () => {
    const confirm = window.confirm("정말 삭제하시겠습니까?");
    if (!confirm) return;

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (post.userEmail?.toString() !== myUserEmail) {
      alert("본인이 작성한 게시글만 삭제할 수 있습니다.");
      return;
    }

    try {
      await axios.delete(`/api/community/board/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("삭제가 완료되었습니다.");
      navigate("/community");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleLikeToggle = async () => {
    if (post.userEmail?.toString() === myUserEmail) {
      alert("자신의 게시글에는 좋아요를 누를 수 없습니다.");
      return;
    }

    try {
      const url = `/api/community/board/${id}/recommend`;
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

      const response = await axios.post(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (typeof response.data === "boolean") {
        setLiked(response.data);
        setLikeCount((prev) => (response.data ? Math.max(prev, likeCount + 1) : Math.max(0, likeCount - 1)));
      }
    } catch (err) {
      console.error("좋아요 처리 실패:", err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  if (!post) return <div className="community-detail-loading">로딩 중...</div>;

  return (
    <div className="community-detail-container">
      <div className="community-detail-header">
        <h1 className="community-detail-title">{post.boardTitle}</h1>

        <div className="writer-info">
          <span className="writer-name">{post.username}</span>
          <span className="writer-date">{post.boardRegDate}</span>
        </div>
      </div>

      <div className="community-detail-content">{post.boardContent}</div>

      <div className="community-detail-actions">
        <button onClick={() => navigate("/community")} className="action-button">
          뒤로가기
        </button>
        {post.userEmail?.toString() === myUserEmail && (
          <>
            <button onClick={handleEdit} className="action-button edit">
              수정
            </button>
            <button onClick={handleDelete} className="action-button delete">
              삭제
            </button>
          </>
        )}
      </div>
      <div className="interaction-row">
        <div
          className={`icon-info ${post.userEmail?.toString() === myUserEmail ? "disabled" : ""}`}
          onClick={post.userEmail?.toString() === myUserEmail ? undefined : handleLikeToggle}
        >
          <img src={liked ? heartHoverIcon : heartIcon} alt="좋아요" className="icon" />
          <span>{likeCount}</span>
        </div>
        <div className="icon-info">
          <img src={eyeIcon} alt="댓글 수" className="icon" />
          <span>{comments.length}</span>
        </div>
        <button className="share-button">📤 공유</button>
      </div>
      <div className="community-detail-comments">
        <div className="comment-tooltip-container">
          <HiOutlineExclamationCircle className="tooltip-icon" />
          <div className="tooltip-box">
            댓글은 작성하면 수정·삭제가 어려우며, 부적절한 내용은 삭제될 수 있습니다.
            <br />
            다른 이용자에게 불편함을 줄 수 있는 내용은 피해주세요.
          </div>
        </div>
        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="댓글을 입력하세요" />
        <button onClick={handleCommentSubmit} className="comment-submit">
          댓글 남기기
        </button>

        <ul className="comment-list">
          {comments.map((comment: any) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-profile">
                <div className="comment-header">
                  <strong>{comment.username}</strong>
                  <span className="comment-date">{comment.replyRegDate}</span>
                </div>
                <p>{comment.replyContent}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
