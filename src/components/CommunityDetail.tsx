import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CommunityDetail.css";
import defaultProfile from "../assets/img/user.png";
import heartIcon from "../assets/img/heart.png";
import heartHoverIcon from "../assets/img/heart-filled.png";
import eyeIcon from "../assets/img/eye.png";
import commentIcon from "../assets/img/comment.png";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FiArrowLeft, FiShare2 } from "react-icons/fi";
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Viewer } from '@toast-ui/react-editor';

export default function CommunityDetail() {
  const location = useLocation();
  const { id } = location.state || {};
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [views, setViews] = useState([]);
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
        console.log("게시물 조회", res.data);
        setPost(res.data);
        setViews(res.data.boardView || 0);
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

      <button className="back-icon-button" onClick={() => navigate(-1)}>
        <FiArrowLeft size={25} color="#555" />
      </button>
      <button className="share-icon-button">
        <FiShare2 size={22} color="#555" />
      </button>
      
      <div className="community-detail-header">
        <span className="community-detail-subcategory">
          {post.boardCategory}
        </span>
        <h1 className="community-detail-title">{post.boardTitle}</h1>
        <div className="writer-info">
          <img
            src={`data:image/png;base64,${post.profile || defaultProfile}`}
            alt="프로필"
            className="community-write-profile"
          />
          <span className="writer-name">{post.username}</span>
          <span className="writer-date">{post.boardRegDate}</span>
        </div>
      </div>


        <div className="community-detail-content">
          <Viewer initialValue={post.boardContent} />
        </div>

      <div className="community-detail-actions">
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
          <img src={commentIcon} alt="댓글 수" className="icon" />
          <span>{comments.length}</span>
        </div>
        <div className="icon-info">
          <img src={eyeIcon} alt="댓글 수" className="icon" />
          <span>{views}</span>
        </div>
      </div>
      <div className="community-detail-comments">
        <div className="comment-tooltip-container">
          <HiOutlineExclamationCircle className="tooltip-icon" />
          <div className="tooltip-box">
            댓글은 작성하면 수정·삭제가 어려우며, <br/> 부적절한 내용은 삭제될 수 있습니다.
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
            <img
              src={`data:image/png;base64,${comment.profile || defaultProfile}`}
              alt="프로필"
              className="comment-avatar"
            />
            <div className="comment-content-box">
              <div className="comment-header">
                <strong className="comment-author">{comment.username}</strong>
                <span className="comment-date">{comment.replyRegDate}</span>
              </div>
              <p className="comment-text">{comment.replyContent}</p>
            </div>
          </li>
        ))}
      </ul>

      </div>
    </div>
  );
}
