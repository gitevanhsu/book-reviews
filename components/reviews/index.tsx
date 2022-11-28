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
const ReviewTitle = styled.h2`
  margin: 10px 0;
  font-size: ${(props) => props.theme.fz * 1.5}px;
`;
const ReviewContent = styled.div`
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
    border-top: solid 2px ${(props) => props.theme.grey};
  }
`;

const LeaveRatingBox = styled.div`
  padding: 20px 10px 0;

  border-top: 1px solid ${(props) => props.theme.grey};
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
  margin-left: 5px;
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
  @media screen and (max-width: 480px) {
    margin: 0 10px;
  }
`;

const ReviewMemberName = styled.h3`
  margin-bottom: 10px;
  min-width: 100px;
  font-size: 16px;
  font-weight: 700;
  color: ${(props) => props.theme.black};
`;
const SUbReviewMemberName = styled(ReviewMemberName)`
  display: inline-block;
  margin-left: 10px;
  min-width: 50px;
`;

const SignMessage = styled.h2`
  font-size: ${(props) => props.theme.fz * 1.5}px;
`;

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
const Content = styled.div<ContentProps>`
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
const ShowSubReviewButton = styled(ShowReviewBtn)`
  margin-left: 50px;
  @media screen and (max-width: 576px) {
    margin-left: 0px;
  }
`;

const SubReviewsBox = styled.div`
  margin-left: 50px;
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
  margin-left: 35px;
`;
const SubReviewContent = styled.div`
  margin: 10px 36px;
`;
const SubReviewTime = styled.div`
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

const Gotomember = styled(Link)`
  display: inline-block;
  cursor: pointer;
`;
const SubMemberImg = styled(Image)`
  display: inline-block;
  border-radius: 50%;
`;
const LikeCount = styled.div`
  display: inline-block;
  width: 20px;
`;
const LeaveReviewBox = styled.div`
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.grey};
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
  border: solid 1px ${(props) => props.theme.grey};
  padding: 5px 10px;
  text-align: center;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.greyBlue};
`;
const RemoveOverlay = styled.div`
  background-color: #000;
  opacity: 0.5;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
`;
const RemoveAlertBox = styled.div`
  z-index: 5;
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translatex(-50%);
  width: 300px;
  height: 200px;
  background-color: ${(props) => props.theme.white};
  border-radius: 20px;
  text-align: center;
`;
const RemoveAlert = styled.p`
  font-size: ${(props) => props.theme.fz * 1.5}px;
  margin: 50px 0;
`;
const RemoveBtn = styled.button`
  padding: 5px 10px;
  border: 1px solid ${(props) => props.theme.grey};
  border-radius: 10px;
  background-color: ${(props) => props.theme.yellow};
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
  }
  & + & {
    margin-left: 30px;
    &:hover {
      background-color: ${(props) => props.theme.red};
    }
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
  const [deleteAlert, setDeleteAlert] = useState(false);

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
        {deleteAlert && (
          <>
            <RemoveOverlay
              onClick={() => {
                setDeleteAlert(false);
              }}
            />
            <RemoveAlertBox>
              <RemoveAlert>評價跟留言會一起被刪除喔！</RemoveAlert>
              <RemoveBtn
                onClick={() => {
                  setDeleteAlert(false);
                }}
              >
                取消
              </RemoveBtn>
              <RemoveBtn
                onClick={() => {
                  if (userInfo.uid) {
                    removeBookRating(
                      userInfo.uid,
                      bookIsbn,
                      rating,
                      memberReview
                    );
                    setRating(0);
                    setHover(0);
                  }
                  setDeleteAlert(false);
                }}
              >
                刪除
              </RemoveBtn>
            </RemoveAlertBox>
          </>
        )}
        {rating > 0 && (
          <>
            <RemoveRatingButton
              onClick={() => {
                setDeleteAlert(true);
              }}
            >
              Remove
            </RemoveRatingButton>
          </>
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
                  <SUbReviewMemberName>
                    {subreview.memberData?.name}
                  </SUbReviewMemberName>
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

const BookReviewWrap = styled.div`
  width: 100%;
  padding: 15px 0;
  margin-bottom: 15px;
  border-bottom: 1px solid ${(props) => props.theme.grey};
`;
const BookReviewHead = styled.div`
  display: flex;
  align-items: center;
`;
const BookReviewMemberWrap = styled.div``;
const BookReviewMemberImgWrap = styled.div``;
const BookReviewMemberImg = styled(Image)`
  border-radius: 50%;
  width: 80px;
  height: 80px;
  @media screen and (max-width: 576px) {
    width: 50px;
    height: 50px;
  }
  @media screen and (max-width: 480px) {
    width: 30px;
    height: 30px;
  }
`;
const BookReviewMemberLink = styled(Link)`
  padding: 0 10px;
`;
const BookReviewMemberName = styled.p`
  display: inline-block;
  margin-right: 20px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 1.2}px;
  }
`;
const BookReviewMemberRate = styled.div`
  display: inline-block;
  font-size: ${(props) => props.theme.fz * 1.2}px;
  margin-right: 20px;
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 1}px;
  }
`;
const BookReviewMemberRateStart = styled.span`
  display: inline-block;
  font-size: ${(props) => props.theme.fz * 1.2}px;
  color: ${(props) => props.theme.red};
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 1}px;
  }
`;
const BookReviewMemberDate = styled.div`
  display: inline-block;
`;
const BookReviewTitle = styled.div`
  font-size: ${(props) => props.theme.fz * 2}px;
  margin-top: 30px;
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz * 1.5}px;
  }
`;
interface BookReviewContentProps {
  showMore: boolean;
}
const BookReviewContent = styled.div<BookReviewContentProps>`
  max-height: ${(props) => (props.showMore ? "auto" : "150px")};
  overflow: hidden;
  padding: 20px 0 0 50px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz * 1.2}px;
    padding-left: 30px;
  }
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 1}px;
  }
`;
const BookReviewRatingWrap = styled.div`
  width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const BookReviewRatingUpper = styled.div`
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  cursor: pointer;
  display: inline-block;
  height: 30px;
  width: 30px;
  background-color: ${(props) => props.theme.greyBlue};
`;
const BookReviewRatingLower = styled(BookReviewRatingUpper)`
  clip-path: polygon(0 0, 50% 100%, 100% 0);
`;
const BookReviewRatingNumber = styled.p`
  padding: 10px 0;
  font-size: ${(props) => props.theme.fz * 1.5}px;
`;
const SeeMoreBtn = styled.button`
  font-size: ${(props) => props.theme.fz * 1}px;
  padding: 5px 10px;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.yellow};
  cursor: pointer;
  margin-left: 50px;
  margin-top: 20px;
  @media screen and (max-width: 576px) {
    margin-left: 30px;
  }
`;

function ReviewComponent({ review, year, month, date }: ReviewProps) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <BookReviewWrap key={review.reviewId}>
        <BookReviewHead>
          <BookReviewRatingWrap>
            <BookReviewRatingUpper
              onClick={() => {
                if (userInfo.uid && review) {
                  upperReview(userInfo.uid, review);
                } else {
                  alert("請先登入喔");
                }
              }}
            />
            <BookReviewRatingNumber>
              {review.reviewRating}
            </BookReviewRatingNumber>
            <BookReviewRatingLower
              onClick={() => {
                if (userInfo.uid && review) {
                  lowerReview(userInfo.uid, review);
                } else {
                  alert("請先登入喔");
                }
              }}
            />
          </BookReviewRatingWrap>
          <BookReviewMemberImgWrap>
            <BookReviewMemberLink
              href={
                review.memberId! === userInfo.uid!
                  ? "/profile"
                  : `/member/id:${review.memberId}`
              }
            >
              <BookReviewMemberImg
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
                width={80}
                height={80}
              />
            </BookReviewMemberLink>
          </BookReviewMemberImgWrap>
          <BookReviewMemberWrap>
            <BookReviewMemberName>
              {review.memberData && review.memberData.name}
            </BookReviewMemberName>
            <BookReviewMemberRate>
              <BookReviewMemberRateStart>&#9733;</BookReviewMemberRateStart>
              {review.rating}
            </BookReviewMemberRate>
            <BookReviewMemberDate>
              {`${year}-${month}-${date}`}
            </BookReviewMemberDate>
            <BookReviewTitle>{parse(review.title!)}</BookReviewTitle>
          </BookReviewMemberWrap>
        </BookReviewHead>
        <BookReviewContent showMore={showMore}>
          {parse(review.content!)}
        </BookReviewContent>
        <SeeMoreBtn
          onClick={() => {
            setShowMore((prev) => !prev);
          }}
        >
          {showMore ? "Show less" : "Show more"}
        </SeeMoreBtn>
        <SubReviewComponent review={review} />
      </BookReviewWrap>
    </>
  );
}

export function ReviewsComponent({
  bookIsbn,
  firstReview,
}: {
  bookIsbn: string;
  firstReview: BookReview[];
}) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [reviews, setReviews] = useState<BookReview[]>(firstReview);
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
