import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import {
  getBookReviews,
  BookReview,
  bookRating,
  removeBookRating,
  addBookReview,
  reviewsRef,
  db,
  editReview,
  showSubReview,
  SubReview,
  sentSubReview,
  likeSubReview,
} from "../../utils/firebaseFuncs";
import { RootState } from "../../store";

import male from "/public/img/reading-male.png";
import { useSelector } from "react-redux";
import {
  getDoc,
  onSnapshot,
  query,
  where,
  doc,
  DocumentData,
} from "firebase/firestore";

const BookReviewsBox = styled.div``;
const BookReviewBox = styled.div``;
const ReviewTitle = styled.h2``;
const ReviewContent = styled.h2``;
const ReviewRating = styled.p``;

const LeaveReviewBox = styled.div``;
const LeaveInputBox = styled.div``;
const LeaveReviewTitle = styled.h3``;
const LeaveReviewContent = styled.input``;
const LeaveReviewTextContent = styled.textarea`
  font-family: Arial;
`;
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

const SignMessage = styled.h2``;

const MemberReview = styled.div`
  border: solid 1px;
  display: inline-block;
`;
const EditReviewButton = styled(SentReviewButton)``;

const SubReviewsCount = styled.p``;
const ShowSubReviewButton = styled.button``;

const SubReviewsBox = styled.div``;
const SubReviewBox = styled.div``;

const SubReviewLikes = styled.p``;
const SubReviewContent = styled.p``;
const SubReviewTime = styled.p``;
const SubReviewInput = styled.input``;
const SubReviewSubmit = styled(SentReviewButton)``;
const SubReviewLikeButton = styled(SentReviewButton)``;

export function LeaveRatingComponent({
  bookIsbn,
  memberReview,
}: {
  bookIsbn: string;
  memberReview: BookReview;
}) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    memberReview?.rating && setRating(+memberReview.rating);
  }, [memberReview]);
  return userInfo.isSignIn ? (
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
          >
            <LeaveRatingStart>&#9733;</LeaveRatingStart>
          </LeaveRatingButton>
        );
      })}
      <SentRatingButton
        onClick={() => {
          userInfo.uid && bookRating(userInfo.uid, bookIsbn, rating);
        }}
      >
        送出評價
      </SentRatingButton>
      <SentRatingButton
        onClick={() => {
          if (userInfo.uid) {
            removeBookRating(userInfo.uid, bookIsbn, rating, memberReview);
            setRating(0);
            setHover(0);
          }
        }}
      >
        移除評價/評論
      </SentRatingButton>
    </LeaveRatingBox>
  ) : (
    <LeaveRatingBox>
      <SignMessage>登入才能留下評價喔！</SignMessage>
    </LeaveRatingBox>
  );
}

export function LeaveCommentComponent({ bookIsbn }: { bookIsbn: string }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);

  return userInfo.isSignIn ? (
    <LeaveReviewBox>
      <LeaveInputBox>
        <LeaveReviewTitle>評論標題</LeaveReviewTitle>
        <LeaveReviewContent ref={titleInputRef} />
      </LeaveInputBox>
      <LeaveInputBox>
        <LeaveReviewTitle>評論內容</LeaveReviewTitle>
        <LeaveReviewTextContent ref={contentInputRef} />
      </LeaveInputBox>
      <SentReviewButton
        onClick={() => {
          if (
            titleInputRef &&
            contentInputRef &&
            titleInputRef.current &&
            contentInputRef.current &&
            userInfo.uid
          )
            addBookReview(
              userInfo.uid,
              bookIsbn,
              titleInputRef.current.value,
              contentInputRef.current.value
            );
        }}
      >
        送出評論
      </SentReviewButton>
      <SentReviewButton>編輯評論</SentReviewButton>
    </LeaveReviewBox>
  ) : (
    <LeaveReviewBox>
      <SignMessage>登入才能留下評論喔！</SignMessage>
    </LeaveReviewBox>
  );
}

function SentSubReviewComponent({ review }: { review: BookReview }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <SubReviewInput ref={inputRef} />
      <SubReviewSubmit
        onClick={() => {
          inputRef &&
            inputRef.current &&
            userInfo.uid &&
            sentSubReview(review, inputRef.current.value, userInfo.uid);
        }}
      >
        送出
      </SubReviewSubmit>
    </>
  );
}

function SubReviewComponent({ review }: { review: BookReview }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [showSubReviews, setShowSubReviews] = useState<boolean>(false);
  const [subReviews, setSubReviews] = useState<SubReview[]>();

  useEffect(() => {
    if (showSubReviews) {
      showSubReview(review).then((data) => setSubReviews(data));
    }
  }, [showSubReviews, review]);
  return showSubReviews ? (
    <SubReviewsBox>
      <SubReviewsCount>回應 {review.subReviewsNumber} 則</SubReviewsCount>
      {subReviews &&
        subReviews.map((subreview) => {
          const ReviewDate = new Date(
            subreview.time ? subreview.time?.seconds * 1000 : ""
          );
          const year = ReviewDate.getFullYear();
          const month = ReviewDate.getMonth() + 1;
          const date = ReviewDate.getDate();
          return (
            <SubReviewBox key={subreview.reviewId}>
              <Image
                src={
                  subreview.memberData && subreview.memberData.url
                    ? subreview.memberData.url
                    : male
                }
                alt={
                  subreview.memberData && subreview.memberData.name
                    ? subreview.memberData.name
                    : "user Img"
                }
                width={25}
                height={25}
              ></Image>
              <ReviewMemberName>{subreview.memberData?.name}</ReviewMemberName>
              <SubReviewContent>{subreview.content}</SubReviewContent>
              <SubReviewTime>
                評價時間：{`${year}-${month}-${date}`}
              </SubReviewTime>
              <SubReviewLikes>
                {subreview.like?.length} Likes{" "}
                <SubReviewLikeButton
                  onClick={() => {
                    userInfo.uid &&
                      likeSubReview(review, subreview, userInfo.uid);
                  }}
                >
                  喜歡
                </SubReviewLikeButton>
              </SubReviewLikes>
            </SubReviewBox>
          );
        })}
      <SentSubReviewComponent review={review} />
    </SubReviewsBox>
  ) : (
    <>
      <SubReviewsCount>回應 {review.subReviewsNumber} 則</SubReviewsCount>
      <ShowSubReviewButton
        onClick={() => {
          setShowSubReviews(true);
        }}
      >
        顯示回應
      </ShowSubReviewButton>
    </>
  );
}

function MemberReviewComponent({ memberReview }: { memberReview: BookReview }) {
  const [isEdit, setIsEdit] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  return isEdit ? (
    <MemberReview>
      <Image
        src={
          memberReview.memberData && memberReview.memberData.url
            ? memberReview.memberData.url
            : male
        }
        alt={
          memberReview.memberData && memberReview.memberData.name
            ? memberReview.memberData.name
            : "user Img"
        }
        width={50}
        height={50}
      ></Image>
      <ReviewMemberName>您的評論</ReviewMemberName>
      <LeaveInputBox>
        <LeaveReviewTitle>評論標題</LeaveReviewTitle>
        <LeaveReviewContent
          ref={titleInputRef}
          defaultValue={memberReview.title}
        />
      </LeaveInputBox>
      <LeaveInputBox>
        <LeaveReviewTitle>評論內容</LeaveReviewTitle>
        <LeaveReviewTextContent
          ref={contentInputRef}
          defaultValue={memberReview.content}
        />
      </LeaveInputBox>
      <EditReviewButton
        onClick={() => {
          setIsEdit(false);
        }}
      >
        取消編輯
      </EditReviewButton>
      <EditReviewButton
        onClick={() => {
          titleInputRef &&
            contentInputRef &&
            titleInputRef.current &&
            contentInputRef.current &&
            editReview(
              memberReview,
              titleInputRef.current.value,
              contentInputRef.current.value
            );
        }}
      >
        送出評論
      </EditReviewButton>
    </MemberReview>
  ) : (
    <MemberReview>
      <Image
        src={
          memberReview.memberData && memberReview.memberData.url
            ? memberReview.memberData.url
            : male
        }
        alt={
          memberReview.memberData && memberReview.memberData.name
            ? memberReview.memberData.name
            : "user Img"
        }
        width={50}
        height={50}
      ></Image>
      <ReviewMemberName>您的評論</ReviewMemberName>
      <ReviewTitle>評價標題：{memberReview.title}</ReviewTitle>
      <ReviewContent>評價內容：{memberReview.content}</ReviewContent>
      <EditReviewButton
        onClick={() => {
          setIsEdit(true);
        }}
      >
        編輯評論
      </EditReviewButton>
    </MemberReview>
  );
}

export function ReviewsComponent({ bookIsbn }: { bookIsbn: string }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [memberReview, setMemberReview] = useState<BookReview>();

  useEffect(() => {
    let unsubscribe: Function;
    const getReviewsData = async () => {
      const reviewQuery = query(reviewsRef, where("booksIsbn", "==", bookIsbn));
      unsubscribe = onSnapshot(reviewQuery, async (querySnapshot) => {
        setMemberReview(undefined);
        const reviewsArr: BookReview[] = [];
        const userIds: string[] = [];

        querySnapshot.forEach((review) => {
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
      });
    };
    getReviewsData();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [bookIsbn, userInfo.uid]);

  return (
    <BookReviewsBox>
      {memberReview && memberReview.title && memberReview.title.length > 0 ? (
        <MemberReviewComponent memberReview={memberReview} />
      ) : (
        <LeaveCommentComponent bookIsbn={bookIsbn} />
      )}

      {reviews.length > 0 ? (
        reviews.map((review) => {
          const ReviewDate = new Date(
            review.time ? review.time?.seconds * 1000 : ""
          );
          const year = ReviewDate.getFullYear();
          const month = ReviewDate.getMonth() + 1;
          const date = ReviewDate.getDate();
          if (review.title?.length === 0) return;
          return (
            <BookReviewBox key={review.reviewId}>
              <ReviewMemberBox>
                <Image
                  src={
                    review.memberData && review.memberData.url
                      ? review.memberData.url
                      : male
                  }
                  alt={
                    review.memberData && review.memberData.name
                      ? review.memberData.name
                      : "user Img"
                  }
                  width={50}
                  height={50}
                ></Image>
                <ReviewMemberName>
                  用戶名：{review.memberData && review.memberData.name}
                </ReviewMemberName>
              </ReviewMemberBox>
              <ReviewTitle>評價標題：{review.title}</ReviewTitle>
              <ReviewContent>評價內容：{review.content}</ReviewContent>
              <ReviewRating>評價星星：{review.rating}</ReviewRating>
              <ReviewRating>
                評價時間：{`${year}-${month}-${date}`}
              </ReviewRating>
              <SubReviewComponent review={review} />
            </BookReviewBox>
          );
        })
      ) : (
        <ReviewTitle>留下第一則評論吧！</ReviewTitle>
      )}
    </BookReviewsBox>
  );
}
