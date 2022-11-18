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
import like from "../../public/img/like.svg";
import liked from "../../public/img/liked.svg";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.bubble.css";
import parse from "html-react-parser";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
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
  @media screen and (max-width: 576px) {
    padding-left: 20px;
  }
`;
const MemberData = styled.div`
  margin-left: 10px;
  width: 100%;
`;

const ReviewTitle = styled.h2`
  margin: 10px 0;
  font-size: ${(props) => props.theme.fz * 1.5}px;
`;
const ReviewContent = styled.p`
  line-height: 22px;
`;

const ShowReviewBtn = styled.button`
  margin-top: 15px;
  position: relative;
  cursor: pointer;
  padding: 5px 50px;
  color: ${(props) => props.theme.black};
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
  padding: 20px 10px 0;

  border-top: 1px solid ${(props) => props.theme.black};
  margin-bottom: 20px;
`;
const LeaveRatingButton = styled.button<RatingProps>`
  color: ${(props) =>
    props.index <= (props.hover || props.rating)
      ? props.theme.red
      : props.theme.black};
  font-size: ${(props) => props.theme.fz * 1.5}px;
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
`;
const LeaveRatingStar = styled.span``;
const RemoveRatingButton = styled.button`
  cursor: pointer;
  margin: 0 30px;
  padding: 5px 10px;
  border-radius: 5px;
  color: ${(props) => props.theme.white};
  background-color: ${(props) => props.theme.red};
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
  color: ${(props) => props.theme.black};
`;

const SignMessage = styled.h2``;

const MemberReviewBox = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.black};
  padding: 10px 10px;
`;
const MemberReviewNotice = styled.h3`
  margin-bottom: 10px;
  min-width: 100px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  font-weight: 700;
  color: ${(props) => props.theme.black};
`;
const Title = styled.h3``;
const TitleContent = styled.h3`
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  font-weight: 600;
`;
interface ContentProps {
  showMore: boolean;
}
const Content = styled.p<ContentProps>`
  width: 100%;
  font-size: ${(props) => props.theme.fz * 1}px;
  max-height: ${(props) => (props.showMore ? "auto" : "150px")};
  overflow: hidden;
`;
const MemberReviewTitleBox = styled.div`
  display: flex;
  & > ${Title} {
    min-width: 100px;
    font-size: ${(props) => props.theme.fz * 1.5}px;
    margin-top: 10px;
    @media screen and (max-width: 576px) {
      margin-bottom: 10px;
    }
  }
  & > ${Content} {
    margin: 10px 0;
    font-size: ${(props) => props.theme.fz * 1.5}px;
    @media screen and (max-width: 576px) {
      font-size: ${(props) => props.theme.fz * 1}px;
    }
  }
  & + & {
    margin-top: 40px;
  }
`;

const MemberReviewContentBox = styled.div`
  display: flex;
  margin-top: 15px;
  & > ${Title} {
    min-width: 100px;
    font-size: ${(props) => props.theme.fz * 1.5}px;
    margin-top: 20px;
    @media screen and (max-width: 576px) {
      margin-bottom: 10px;
    }
  }
  & > ${Content} {
    margin: 10px 0;
    font-size: ${(props) => props.theme.fz * 1.5}px;
    @media screen and (max-width: 576px) {
      font-size: ${(props) => props.theme.fz * 1}px;
    }
  }
`;
const EditReviewButton = styled.button`
  cursor: pointer;
  margin: 10px 20px 10px 0;
  font-size: ${(props) => props.theme.fz}px;
  padding: 5px 10px;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.greyBlue};

  & + & {
    margin-left: 20px;
  }
`;
const SeeMoreBtn = styled.button`
  font-size: ${(props) => props.theme.fz * 1}px;
  padding: 5px 10px;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.yellow};
  cursor: pointer;
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
const SubReviewInput = styled(ReactQuill)`
  width: 100%;
  outline: none;
  border: 1px solid ${(props) => props.theme.black};
  border-radius: 5px;
`;
const LikeButton = styled.button`
  height: 20px;
  cursor: pointer;
`;

const RatingReviewBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  height: 100%;
  padding: 50px 0;
  margin-top: 50px;
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
  background-color: ${(props) => props.theme.greyBlue};
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  &:hover {
    opacity: 0.5;
  }
  @media screen and (max-width: 576px) {
    height: 30px;
    width: 30px;
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
  width: 100%;
`;
const LeaveInputBox = styled.div`
  width: 100%;
  display: flex;
  align-items: start;
  margin: 10px 0;
  & > ${ReviewContent} {
    font-size: ${(props) => props.theme.fz * 1.5}px;
  }
  @media screen and (max-width: 576px) {
    flex-direction: column;
  }
`;
const LeaveReviewTitle = styled.h3`
  min-width: 100px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  margin-top: 10px;
  @media screen and (max-width: 576px) {
    margin-bottom: 10px;
  }
`;
const LeaveReviewContentTitle = styled(ReactQuill)`
  width: 100%;
  border: 1px solid ${(props) => props.theme.black};
  font-size: ${(props) => props.theme.fz * 1.5}px;
  border-radius: 5px;
`;
const LeaveReviewTextContent = styled(ReactQuill)`
  padding: 4px 10px;
  width: 100%;
  height: 100px;
  border: 1px solid ${(props) => props.theme.black};
  border-radius: 5px;
`;
const EditTitle = styled(ReactQuill)`
  width: 100%;
  border: solid 1px ${(props) => props.theme.black};
  border-radius: 5px;
`;
const EditContent = styled(ReactQuill)`
  margin-top: 10px;
  width: 100%;
  height: 100px;
  border: solid 1px ${(props) => props.theme.black};
  border-radius: 5px;
`;

const SubmitReviewBtn = styled.button`
  margin-top: 10px;
  align-self: end;
  cursor: pointer;
  border: solid 1px #ccc;
  padding: 5px 10px;
  text-align: center;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.greyBlue};
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
  color: #000;
`;
const MainReviewTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
`;
const MainReviewContent = styled.p<ContentProps>`
  margin: 10px 0;
  max-height: ${(props) => (props.showMore ? "auto" : "100px")};
  width: 100%;
  font-size: 16px;
  overflow: hidden;
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz * 1}px;
  }
`;
const MainReviewStar = styled.div`
  display: inline-block;
  margin: 0 20px;
  font-size: 8px;
`;
const MainReviewDate = styled.span`
  font-size: 8px;
  @media screen and (max-width: 576px) {
    display: block;
    margin-bottom: 10px;
  }
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
              onClick={() => {
                setRating(index);
                userInfo.uid && bookRating(userInfo.uid, bookIsbn, index);
              }}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(rating)}
            >
              <LeaveRatingStar>&#9733;</LeaveRatingStar>
            </LeaveRatingButton>
          );
        })}
        {rating > 0 && (
          <RemoveRatingButton
            onClick={() => {
              if (userInfo.uid) {
                removeBookRating(userInfo.uid, bookIsbn, rating, memberReview);
                setRating(0);
                setHover(0);
              }
            }}
          >
            Remove
          </RemoveRatingButton>
        )}
      </LeaveRatingBox>
    </>
  ) : (
    <LeaveRatingBox>
      <SignMessage>加入會員分享你的想法！</SignMessage>
    </LeaveRatingBox>
  );
}

export function LeaveCommentComponent({ bookIsbn }: { bookIsbn: string }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [titlevalue, setTitleValue] = useState("");
  const [contentvalue, setContentValue] = useState("");

  return userInfo.isSignIn ? (
    <LeaveReviewBox>
      <LeaveInputBox>
        <LeaveReviewTitle>Title</LeaveReviewTitle>
        <LeaveReviewContentTitle
          theme="bubble"
          value={titlevalue}
          onChange={setTitleValue}
        />
      </LeaveInputBox>
      <LeaveInputBox>
        <LeaveReviewTitle>Content</LeaveReviewTitle>
        <LeaveReviewTextContent
          theme="bubble"
          value={contentvalue}
          onChange={setContentValue}
        />
      </LeaveInputBox>
      <SubmitReviewBtn
        onClick={() => {
          if (titlevalue && contentvalue && userInfo.uid)
            addBookReview(userInfo.uid, bookIsbn, titlevalue, contentvalue);
        }}
      >
        Submit
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
  const [reviewValue, setReviewValue] = useState("");
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
                <SubReviewContent>{parse(subreview.content!)}</SubReviewContent>
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
        <>
          <SubReviewInput
            theme="bubble"
            value={reviewValue}
            onChange={setReviewValue}
            placeholder="leave comment...."
          />
          <SubmitReviewBtn
            onClick={() => {
              if (reviewValue && userInfo.uid) {
                sentSubReview(review, reviewValue, userInfo.uid);
                sentNotice(review, reviewValue, userInfo.uid);
                setReviewValue("");
              }
            }}
          >
            Submit
          </SubmitReviewBtn>
        </>
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
  const [titlevalue, setTitleValue] = useState(memberReview.title);
  const [contentvalue, setContentValue] = useState(memberReview.content);
  const [showMore, setShowMore] = useState(false);
  return isEdit ? (
    <MemberReviewBox>
      <MemberReviewNotice>Your review</MemberReviewNotice>
      <MemberReviewTitleBox>
        <Title>Title</Title>
        <EditTitle theme="bubble" value={titlevalue} onChange={setTitleValue} />
      </MemberReviewTitleBox>
      <MemberReviewContentBox>
        <LeaveReviewTitle>Content</LeaveReviewTitle>
        <EditContent
          theme="bubble"
          value={contentvalue}
          onChange={setContentValue}
        />
      </MemberReviewContentBox>
      <EditReviewButton
        onClick={() => {
          titlevalue &&
            contentvalue &&
            editReview(memberReview, titlevalue, contentvalue);
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
    </MemberReviewBox>
  ) : (
    <MemberReviewBox>
      <MemberReviewNotice>Your review</MemberReviewNotice>
      <MemberReviewTitleBox>
        <TitleContent>{parse(memberReview.title!)}</TitleContent>
      </MemberReviewTitleBox>
      <MemberReviewContentBox>
        <Content showMore={showMore}>{parse(memberReview?.content!)}</Content>
      </MemberReviewContentBox>
      <EditReviewButton
        onClick={() => {
          setIsEdit(true);
        }}
      >
        Edit
      </EditReviewButton>
      <SeeMoreBtn
        onClick={() => {
          setShowMore((prev) => !prev);
        }}
      >
        {showMore ? "Show less" : "Show more"}
      </SeeMoreBtn>
    </MemberReviewBox>
  );
}
interface ReviewProps {
  review: BookReview;
  year: number;
  month: number;
  date: number;
}
function ReviewComponent({ review, year, month, date }: ReviewProps) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [showMore, setShowMore] = useState(false);

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
            <MainReviewTitle>{parse(review.title!)}</MainReviewTitle>
          </ItemBox>
          <ItemBox>
            <MainReviewContent showMore={showMore}>
              {parse(review.content!)}
            </MainReviewContent>
          </ItemBox>
          <SeeMoreBtn
            onClick={() => {
              setShowMore((prev) => !prev);
            }}
          >
            {showMore ? "Show less" : "Show more"}
          </SeeMoreBtn>
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
}

export function ReviewsComponent({ bookIsbn }: { bookIsbn: string }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [memberReview, setMemberReview] = useState<BookReview>();

  useEffect(() => {
    let unsubscribe: Function;
    const getReviewsData = async () => {
      const reviewQuery = query(
        reviewsRef,
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
          <ReviewTitle>留下第一則評論吧！</ReviewTitle>
        )}
      </BookReviewsBox>
    </>
  );
}
