import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import {
  BookReview,
  bookRating,
  removeBookRating,
  addBookReview,
  reviewsRef,
  db,
  editReview,
  SubReview,
  sentSubReview,
  likeSubReview,
  upperReview,
  lowerReview,
  MemberInfo,
  sentNotice,
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
  collection,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "next/router";
import like from "../../public/img/like.svg";
import liked from "../../public/img/liked.svg";
interface RatingProps {
  index: number;
  hover: number;
  rating: number;
}
const BookReviewsBox = styled.div`
  padding: 10px;
  width: 100%;
  border-radius: 10px;
`;
const BookReviewBox = styled.div`
  padding: 50px 0;

  border-bottom: 1px solid #bbb;
  padding-left: 50px;
  position: relative;
`;
const MemberData = styled.div`
  margin-left: 10px;
  width: 80%;
`;

const ReviewTitle = styled.h2`
  margin: 10px 0;
`;
const ReviewContent = styled.p`
  line-height: 22px;
`;

const ShowReviewBtn = styled.button`
  margin-top: 15px;
  position: relative;
  cursor: pointer;
  padding: 5px 50px;
  color: #999;
  &::before {
    content: "";
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 10px;
    width: 30px;
    transform: translateY(-50%);
    border-top: solid 2px #999;
  }
`;

const LeaveRatingBox = styled.div`
  margin-bottom: 20px;
`;
const LeaveRatingButton = styled.button<RatingProps>`
  color: ${(props) =>
    props.index <= (props.hover || props.rating) ? "#ffcc00" : "#999"};

  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
`;
const LeaveRatingStar = styled.span``;
const SentRatingButton = styled.button`
  cursor: pointer;
  margin: 0 30px;
  padding: 5px 10px;
  border-radius: 30px;
  background-color: #b3c7f3;
  & + & {
    margin: 0px;
  }
`;

const ReviewMemberBox = styled.div`
  display: flex;
`;
const ReviewMemberName = styled.h3`
  margin-bottom: 10px;
  min-width: 100px;
  font-size: 16px;
  font-weight: 700;
  color: #888;
`;

const SignMessage = styled.h2``;

const MemberReview = styled.div`
  border-bottom: 3px solid #eee;
  padding: 10px 10px;
`;
const EditReviewButton = styled.button`
  cursor: pointer;
  margin-top: 10px;
  font-size: 16px;
  padding: 5px 10px;
  color: #444;
  border: solid 1px #ccc;
  border-radius: 10px;
  background-color: #eee;
  &:hover {
    background-color: #444;
    color: #eee;
  }
  & + & {
    margin-left: 20px;
  }
`;
const ShowSubReviewButton = styled(ShowReviewBtn)``;

const SubReviewsBox = styled.div`
  max-height: 200px;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`;
const SubReviewBox = styled.div`
  margin: 15px 0;
`;

const SubReviewLikes = styled.div`
  display: inline-block;
  display: flex;
  align-items: center;
  padding: 5px 0;
  margin-left: 25px;
`;
const SubReviewContent = styled.p`
  margin: 10px 25px;
`;
const SubReviewTime = styled.p`
  font-size: 12px;
  display: inline-block;
`;
const SubReviewInput = styled.input`
  padding: 10px 10px;
  width: 100%;
  outline: none;
  border: 1px solid #ccc;
  border-radius: 5px;
`;
const LikeButton = styled.button`
  height: 20px;
  cursor: pointer;
`;

const RatingReviewBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 50px 0;
  text-align: center;
  position: absolute;
  top: 0;
  left: 0;
`;
const RatingCount = styled.p`
  padding: 20px 0;
`;
const RatingReviewButtonUp = styled.div`
  cursor: pointer;
  display: inline-block;
  height: 40px;
  width: 40px;
  background-color: #ffcc00;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  &:hover {
    opacity: 0.5;
  }
`;
const RatingReviewButtonDown = styled(RatingReviewButtonUp)`
  clip-path: polygon(0 0, 50% 100%, 100% 0);
`;

const Gotomember = styled(Link)`
  display: inline-block;
  cursor: pointer;
`;
const SubMemberImg = styled(Image)`
  border-radius: 50%;
`;
const LikeCount = styled.p`
  display: inline-block;
  width: 20px;
`;
const LeaveReviewBox = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  width: 860px;
`;
const LeaveInputBox = styled.div`
  width: 860px;
  display: flex;
  align-items: start;
  & + & {
    margin-top: 10px;
  }
`;
const LeaveReviewTitle = styled.h3`
  min-width: 100px;
`;
const LeaveReviewContent = styled.input`
  width: 100%;
  padding: 4px 10px;
`;
const LeaveReviewTextContent = styled.textarea`
  padding: 4px 10px;
  width: 100%;
  font-family: Arial;
  height: 100px;
`;
const SubmitReviewBtn = styled.button`
  margin-top: 10px;
  align-self: end;
  cursor: pointer;
  border: solid 1px #ccc;
  padding: 5px 10px;
  text-align: center;
  border-radius: 5px;
  color: #444;
  &:hover {
    color: #fff;
    background-color: #7382d4;
  }
`;
const ItemBox = styled.div`
  display: flex;
  align-content: center;
  & + & {
    margin-top: 5px;
  }
`;
const ReviewStar = styled.span`
  color: #ff0000;
`;
const ReviewUserImage = styled(Image)`
  border-radius: 50%;
`;
const MemberName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  padding: 10px 0;
`;
const MainReviewTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
`;
const MainReviewContent = styled.p`
  font-size: 16px;
`;
const MainReviewStar = styled.div`
  display: inline-block;
  margin: 0 20px;
  font-size: 8px;
`;
const MainReviewDate = styled.span`
  font-size: 8px;
`;
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
    <>
      <LeaveRatingBox>
        <ReviewMemberName>Rate this book</ReviewMemberName>
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
              <LeaveRatingStar>&#9733;</LeaveRatingStar>
            </LeaveRatingButton>
          );
        })}

        <SentRatingButton
          onClick={() => {
            userInfo.uid && bookRating(userInfo.uid, bookIsbn, rating);
          }}
        >
          Rate
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
          Remove
        </SentRatingButton>
      </LeaveRatingBox>
    </>
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
        <LeaveReviewTitle>Title</LeaveReviewTitle>
        <LeaveReviewContent ref={titleInputRef} />
      </LeaveInputBox>
      <LeaveInputBox>
        <LeaveReviewTitle>Content</LeaveReviewTitle>
        <LeaveReviewTextContent ref={contentInputRef} />
      </LeaveInputBox>
      <SubmitReviewBtn
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
      </SubmitReviewBtn>
    </LeaveReviewBox>
  ) : (
    <></>
  );
}

function SubReviewComponent({ review }: { review: BookReview }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [showSubReviews, setShowSubReviews] = useState<boolean>(false);
  const [subReviews, setSubReviews] = useState<SubReview[]>();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let unsubscribe: Function;
    const getSubReviewsData = async () => {
      const reviewId = review.reviewId;
      const reviewQuery = query(
        collection(db, `book_reviews/${reviewId}/subreviews`),
        orderBy("likeCount", "desc")
      );
      unsubscribe = onSnapshot(reviewQuery, async (querySnapshot) => {
        const subreviewsArr: SubReview[] = [];
        const userIds: string[] = [];
        querySnapshot.forEach((doc) => {
          subreviewsArr.push(doc.data());
          userIds.push(doc.data().commentUser);
        });
        const requests = userIds.map(async (userId) => {
          const docData = await getDoc(doc(db, "members", userId));
          return docData.data();
        });
        const allMemberInfo = (await Promise.all(requests)) as MemberInfo[];
        const newSubreviews = subreviewsArr.map((subreview) => {
          const userData = allMemberInfo.find(
            (member) => member.uid === subreview.commentUser
          );
          return { ...subreview, memberData: userData };
        });
        setSubReviews(newSubreviews);
      });
    };
    getSubReviewsData();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [review.reviewId]);

  return showSubReviews ? (
    <>
      <ShowSubReviewButton
        onClick={() => {
          setShowSubReviews(false);
        }}
      >
        隱藏回應
      </ShowSubReviewButton>
      <SubReviewsBox>
        {subReviews &&
          subReviews.map((subreview) => {
            const ReviewDate = new Date(
              subreview.time ? subreview.time.seconds * 1000 : ""
            );
            const year = ReviewDate.getFullYear();
            const month = ReviewDate.getMonth() + 1;
            const date = ReviewDate.getDate();
            return (
              <SubReviewBox key={subreview.reviewId}>
                <Gotomember
                  href={
                    subreview.memberData!.uid === userInfo.uid!
                      ? "/profile"
                      : `/member/id:${subreview.memberData!.uid}`
                  }
                >
                  <SubMemberImg
                    src={
                      subreview.memberData && subreview.memberData.img
                        ? subreview.memberData.img
                        : male
                    }
                    alt={
                      subreview.memberData && subreview.memberData.name
                        ? subreview.memberData.name
                        : "user Img"
                    }
                    width={25}
                    height={25}
                  />
                  <ReviewMemberName>
                    {subreview.memberData?.name}
                  </ReviewMemberName>
                </Gotomember>
                <SubReviewTime>{`${year}-${month}-${date}`}</SubReviewTime>
                <SubReviewContent>{subreview.content}</SubReviewContent>
                <SubReviewLikes>
                  <LikeCount>{subreview.likeCount}</LikeCount>
                  <LikeButton
                    onClick={() => {
                      userInfo.uid &&
                        likeSubReview(review, subreview, userInfo.uid);
                    }}
                  >
                    {userInfo.uid ? (
                      <Image
                        src={
                          subreview.like?.includes(userInfo.uid) ? liked : like
                        }
                        alt="likeBtn"
                        width={20}
                        height={20}
                      />
                    ) : (
                      <Image src={liked} alt="likeBtn" width={20} height={20} />
                    )}
                  </LikeButton>
                </SubReviewLikes>
              </SubReviewBox>
            );
          })}
      </SubReviewsBox>
      {userInfo.uid && (
        <SubReviewInput
          ref={inputRef}
          placeholder="leave comment...."
          onKeyDown={(e) => {
            if (
              e.code === "Enter" &&
              inputRef &&
              inputRef.current &&
              userInfo.uid
            ) {
              sentSubReview(review, inputRef.current.value, userInfo.uid);
              sentNotice(review, inputRef.current.value, userInfo.uid);
              inputRef.current.value = "";
            }
          }}
        />
      )}
    </>
  ) : (
    <ShowSubReviewButton
      onClick={() => {
        setShowSubReviews(true);
      }}
    >
      查看其他{review.subReviewsNumber}則回應
    </ShowSubReviewButton>
  );
}

function MemberReviewComponent({ memberReview }: { memberReview: BookReview }) {
  const [isEdit, setIsEdit] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);

  return isEdit ? (
    <MemberReview>
      <ReviewMemberName>Your review</ReviewMemberName>
      <LeaveInputBox>
        <LeaveReviewTitle>Title</LeaveReviewTitle>
        <LeaveReviewContent
          ref={titleInputRef}
          defaultValue={memberReview.title}
        />
      </LeaveInputBox>
      <LeaveInputBox>
        <LeaveReviewTitle>Content</LeaveReviewTitle>
        <LeaveReviewTextContent
          ref={contentInputRef}
          defaultValue={memberReview.content}
        />
      </LeaveInputBox>
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
        Submit
      </EditReviewButton>
      <EditReviewButton
        onClick={() => {
          setIsEdit(false);
        }}
      >
        Cancle
      </EditReviewButton>
    </MemberReview>
  ) : (
    <MemberReview>
      <ReviewMemberName>Your review</ReviewMemberName>
      <LeaveInputBox>
        <LeaveReviewTitle>Title</LeaveReviewTitle>
        <ReviewTitle>{memberReview.title}</ReviewTitle>
      </LeaveInputBox>
      <LeaveInputBox>
        <LeaveReviewTitle>Content</LeaveReviewTitle>
        <ReviewContent>
          {memberReview?.content?.substring(0, 250)} ......
        </ReviewContent>
      </LeaveInputBox>
      <EditReviewButton
        onClick={() => {
          setIsEdit(true);
        }}
      >
        Edit
      </EditReviewButton>
    </MemberReview>
  );
}

export function ReviewsComponent({ bookIsbn }: { bookIsbn: string }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [memberReview, setMemberReview] = useState<BookReview>();
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: Function;
    const getReviewsData = async () => {
      const reviewQuery = query(
        reviewsRef,
        // where("booksIsbn", "==", bookIsbn)
        where("reviewRating", ">", -999999),
        orderBy("reviewRating", "desc")
      );
      unsubscribe = onSnapshot(reviewQuery, async (querySnapshot) => {
        setMemberReview(undefined);
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
    <>
      {memberReview && memberReview.title && memberReview.title.length > 0 ? (
        <MemberReviewComponent memberReview={memberReview} />
      ) : (
        <LeaveCommentComponent bookIsbn={bookIsbn} />
      )}
      <BookReviewsBox>
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
                  <Gotomember
                    href={
                      review.memberId! === userInfo.uid!
                        ? "/profile"
                        : `/member/id:${review.memberId}`
                    }
                  >
                    <ReviewUserImage
                      src={
                        review.memberData && review.memberData.img
                          ? review.memberData.img
                          : male
                      }
                      alt={
                        review.memberData && review.memberData.name
                          ? review.memberData.name
                          : "user Img"
                      }
                      width={30}
                      height={30}
                    ></ReviewUserImage>
                  </Gotomember>
                  <MemberData>
                    <Gotomember
                      href={
                        review.memberId! === userInfo.uid!
                          ? "/profile"
                          : `/member/id:${review.memberId}`
                      }
                    >
                      <MemberName>
                        {review.memberData && review.memberData.name}
                      </MemberName>
                    </Gotomember>
                    <MainReviewStar>
                      <ReviewStar>&#9733;</ReviewStar>
                      {review.rating}
                    </MainReviewStar>
                    <MainReviewDate>{`${year}-${month}-${date}`}</MainReviewDate>
                    <ItemBox>
                      <MainReviewTitle>{review.title}</MainReviewTitle>
                    </ItemBox>
                    <ItemBox>
                      <MainReviewContent>{review.content}</MainReviewContent>
                    </ItemBox>
                  </MemberData>
                </ReviewMemberBox>
                <RatingReviewBox>
                  <RatingReviewButtonUp
                    onClick={() => {
                      if (userInfo.uid && review) {
                        upperReview(userInfo.uid, review);
                      } else {
                        alert("請先登入喔");
                      }
                    }}
                  ></RatingReviewButtonUp>
                  <RatingCount>{review.reviewRating}</RatingCount>
                  <RatingReviewButtonDown
                    onClick={() => {
                      if (userInfo.uid && review) {
                        lowerReview(userInfo.uid, review);
                      } else {
                        alert("請先登入喔");
                      }
                    }}
                  ></RatingReviewButtonDown>
                </RatingReviewBox>
                <SubReviewComponent review={review} />
              </BookReviewBox>
            );
          })
        ) : (
          <ReviewTitle>留下第一則評論吧！</ReviewTitle>
        )}
      </BookReviewsBox>
    </>
  );
}
