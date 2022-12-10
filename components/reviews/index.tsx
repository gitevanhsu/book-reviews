import { useEffect, useState } from "react";

import "react-quill/dist/quill.bubble.css";
import { useSelector } from "react-redux";
import styled from "styled-components";
import {
  getDoc,
  onSnapshot,
  query,
  where,
  doc,
  DocumentData,
  orderBy,
} from "firebase/firestore";

import { RootState } from "../../store";
import {
  BookReview,
  reviewsRef,
  db,
  BookInfo,
} from "../../utils/firebaseFuncs";
import LeaveRatingComponent from "./leaveRating";
import MemberReviewComponent from "./memberReview";
import LeaveCommentComponent from "./leaveComment";
import ReviewComponent from "./review";

const BookReviewsBox = styled.div`
  padding-top: 10px;
  width: 100%;
  border-radius: 10px;
`;
const EmptyReview = styled.h2`
  font-size: ${(props) => props.theme.fz4};
`;

export function ReviewsComponent({
  bookIsbn,
  firstReview,
  bookData,
}: {
  bookIsbn: string;
  firstReview: BookReview[];
  bookData: BookInfo;
}) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [reviews, setReviews] = useState<BookReview[]>(firstReview);
  const [memberReview, setMemberReview] = useState<BookReview>();

  useEffect(() => {
    const reviewQuery = query(
      reviewsRef,
      where("reviewRating", ">", -999999),
      orderBy("reviewRating", "desc")
    );
    const unsubscribeReviews = onSnapshot(
      reviewQuery,
      async (querySnapshot) => {
        const reviewsArr: BookReview[] = [];
        const userIds: string[] = [];
        querySnapshot.forEach((review) => {
          review.data().booksIsbn === bookIsbn &&
            reviewsArr.push(review.data());
          userIds.push(review.data().memberId);
        });
        const requests = userIds.map(async (userId) => {
          const docData = await getDoc(doc(db, "members", userId));
          return docData.data();
        });
        const allMemberInfo = (await Promise.all(requests)) as DocumentData[];
        const newReviewsArr = reviewsArr.map((review) => {
          const userData = allMemberInfo.find(
            (member) => member.uid === review.memberId
          );
          review.memberId == userInfo.uid &&
            setMemberReview({ ...review, memberData: userData });
          return { ...review, memberData: userData };
        });
        setReviews(newReviewsArr);
      }
    );

    return () => {
      unsubscribeReviews();
    };
  }, [bookIsbn, userInfo.uid]);
  return (
    <>
      <LeaveRatingComponent
        memberReview={memberReview}
        bookIsbn={bookIsbn}
        setMemberReview={setMemberReview}
      />
      {memberReview?.title && memberReview.title.length > 0 ? (
        <MemberReviewComponent memberReview={memberReview} />
      ) : (
        <LeaveCommentComponent bookIsbn={bookIsbn} />
      )}
      <BookReviewsBox>
        {reviews.length > 0 && bookData.reviewCount! > 0 ? (
          reviews.map((review) => {
            const ReviewDate = new Date(review.time?.seconds! * 1000);
            const year = ReviewDate.getFullYear();
            const month = ReviewDate.getMonth() + 1;
            const date = ReviewDate.getDate();
            if (review.title?.length === 0) return;
            return (
              <ReviewComponent
                key={review.reviewId}
                review={review}
                year={year}
                month={month}
                date={date}
              />
            );
          })
        ) : (
          <EmptyReview>留下第一則評論吧！</EmptyReview>
        )}
      </BookReviewsBox>
    </>
  );
}
