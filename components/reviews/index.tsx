import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  getBookReviews,
  BookReview,
  getMemberData,
} from "../../utils/firebaseFuncs";
import { UserState } from "../../slices/userInfoSlice";

const BookReviewsBox = styled.div``;
const BookReviewBox = styled.div``;
const ReviewTitle = styled.h2``;
const ReviewContent = styled.h2``;
const ReviewRating = styled.p``;

const LeaveReviewBox = styled.div``;
const LeaveInputBox = styled.div``;
const LeaveReviewTitle = styled.h3``;
const LeaveReviewContent = styled.input``;
const LeaveReviewTextContent = styled.textarea``;
const SentReviewButton = styled.button`
  cursor: pointer;
  border: solid 1px;
  padding: 5px 10px;
`;

const LeaveRatingBox = styled.div``;
const LeaveRatingButton = styled.button<{
  index: number;
  hover: number;
  rating: number;
}>`
  color: ${(props) =>
    props.index <= (props.hover || props.rating) ? "#000" : "#ccc"};

  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
`;
const LeaveRatingStart = styled.span``;
const SentRatingButton = styled(SentReviewButton)``;

const ReviewMemberBox = styled.div``;
const ReviewMemberName = styled.h3``;

export function LeaveRatingComponent({ bookIsbn }: { bookIsbn: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  return (
    <LeaveRatingBox>
      {[...Array(5)].map((_, index) => {
        index += 1;
        return (
          <LeaveRatingButton
            type="button"
            key={`start-${index}`}
            index={index}
            hover={hover}
            rating={rating}
            onClick={() => setRating(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(rating)}
            onDoubleClick={() => {
              setRating(0);
              setHover(0);
            }}
          >
            <LeaveRatingStart>&#9733;</LeaveRatingStart>
          </LeaveRatingButton>
        );
      })}
      <SentRatingButton>送出評價</SentRatingButton>
      <SentRatingButton>編輯評價</SentRatingButton>
    </LeaveRatingBox>
  );
}

export function LeaveCommentComponent({ bookIsbn }: { bookIsbn: string }) {
  return (
    <LeaveReviewBox>
      <LeaveInputBox>
        <LeaveReviewTitle>評論標題</LeaveReviewTitle>
        <LeaveReviewContent />
      </LeaveInputBox>
      <LeaveInputBox>
        <LeaveReviewTitle>評論內容</LeaveReviewTitle>
        <LeaveReviewTextContent />
      </LeaveInputBox>
      <SentReviewButton>送出評論</SentReviewButton>
      <SentReviewButton>編輯評論</SentReviewButton>
    </LeaveReviewBox>
  );
}

export function ReviewsComponent({ bookIsbn }: { bookIsbn: string }) {
  const [reviews, setReviews] = useState<BookReview[]>([]);

  useEffect(() => {
    const getReviewsData = async () => {
      const reviews = await getBookReviews(bookIsbn);
      console.log(reviews);
      setReviews(reviews);
    };
    getReviewsData();
  }, [bookIsbn]);
  return (
    <BookReviewsBox>
      {reviews.map((review) => {
        const ReviewDate = new Date(
          review.time ? review.time?.seconds * 1000 : ""
        );
        const year = ReviewDate.getFullYear();
        const month = ReviewDate.getMonth() + 1;
        const date = ReviewDate.getDate();

        return (
          <BookReviewBox key={review.reviewId}>
            <ReviewMemberBox>
              <ReviewMemberName>
                用戶名：{review.memberData && review.memberData.name}
              </ReviewMemberName>
            </ReviewMemberBox>
            <ReviewTitle>評價標題：{review.title}</ReviewTitle>
            <ReviewContent>評價內容：{review.content}</ReviewContent>
            <ReviewRating>評價星星：{review.rating}</ReviewRating>
            <ReviewRating>評價時間：{`${year}-${month}-${date}`}</ReviewRating>
          </BookReviewBox>
        );
      })}
    </BookReviewsBox>
  );
}
