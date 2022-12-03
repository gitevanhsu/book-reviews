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
import Swal from "sweetalert2";
import { useRouter } from "next/router";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
interface RatingProps {
  index: number;
  hover: number;
  rating: number;
}
const BookReviewsBox = styled.div`
  padding-top: 10px;
  width: 100%;
  border-radius: 10px;
`;
const EmptyReview = styled.h2`
  font-size: ${(props) => props.theme.fz4};
`;

const ShowReviewBtn = styled.button`
  margin-top: 15px;
  position: relative;
  cursor: pointer;
  color: ${(props) => props.theme.black};
`;

const LeaveRatingBox = styled.div`
  display: flex;
  align-items: center;
  padding-top: 20px;
  margin-top: 50px;
  margin-bottom: 20px;
`;
const LeaveRatingButton = styled.button<RatingProps>`
  color: ${(props) =>
    props.index <= (props.hover || props.rating)
      ? props.theme.starYellow
      : props.theme.black};
  font-size: ${(props) => props.theme.fz5};
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  & + & {
    margin-left: 5px;
  }
`;
const LeaveRatingStar = styled.span``;
const RemoveRatingButton = styled.button`
  cursor: pointer;
  margin: 0 30px;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.yellow};
  &:hover {
    color: ${(props) => props.theme.white};
    background-color: ${(props) => props.theme.red};
  }
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
  font-size: ${(props) => props.theme.fz4};
  font-weight: 700;
  color: ${(props) => props.theme.black};
`;
const SubReviewMemberName = styled(ReviewMemberName)`
  display: inline-block;
  margin-left: 10px;
  min-width: 50px;
`;

const SignMessage = styled.h2`
  font-size: ${(props) => props.theme.fz4};
`;
const SignButton = styled(Link)`
  display: inline-block;
  cursor: pointer;
  font-size: ${(props) => props.theme.fz5};
  padding: 5px 10px;
  margin-left: 20px;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.greyBlue};
`;

const MemberReviewBox = styled.div`
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fz4};
  width: 60px;
`;
const TitleContent = styled.h3`
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.fz3};
  font-weight: 600;
`;
interface ContentProps {
  showMore: boolean;
}
const Content = styled.div<ContentProps>`
  letter-spacing: 2px;
  width: 100%;
  font-size: ${(props) => props.theme.fz4};
  line-height: ${(props) => props.theme.fz4};
  max-height: ${(props) => (props.showMore ? "auto" : "150px")};
  overflow: hidden;
  & > p {
    margin-top: 5px;
  }
`;
const MemberReviewTitleBox = styled.div`
  display: flex;
`;

const MemberReviewContentBox = styled.div`
  margin-top: 20px;
  display: flex;
`;
const EditReviewButton = styled.button`
  cursor: pointer;
  margin: 10px 20px 10px 0;
  font-size: ${(props) => props.theme.fz5};
  padding: 5px 10px;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.greyBlue};
  & + & {
    margin-left: 20px;
  }
`;
const ShowSubReviewButton = styled(ShowReviewBtn)``;

const SubReviewsBox = styled.div`
  margin-left: 50px;
  max-height: 200px;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`;
const SubReviewBox = styled.div`
  position: relative;
  margin-top: 15px;
  margin-bottom: 20px;
`;

const SubReviewLikes = styled.div`
  padding-bottom: 10px;
  margin-left: 30px;
  display: flex;
  align-items: center;
`;
const SubReviewContent = styled.div`
  font-size: ${(props) => props.theme.fz4};
  margin-left: 34px;
`;
const SubReviewTime = styled.div`
  position: absolute;
  font-size: 12px;
  right: 0;
  top: 0;
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
  display: flex;
  align-items: center;
  cursor: pointer;
`;
const SubMemberImg = styled(Image)`
  display: inline-block;
  border-radius: 50%;
`;
const LikeCount = styled.div`
  padding: 15px 10px;
`;
const LeaveReviewBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
`;
const LeaveInputBox = styled.div`
  width: 100%;
  display: flex;
  align-items: start;
  margin: 10px 0;
  @media screen and (max-width: 576px) {
    flex-direction: column;
  }
`;
const LeaveReviewTitle = styled.h3`
  min-width: 55px;
  font-size: ${(props) => props.theme.fz4};

  @media screen and (max-width: 576px) {
    margin-bottom: 10px;
  }
`;
const LeaveReviewContentTitle = styled(ReactQuill)`
  width: 100%;
  border: 1px solid ${(props) => props.theme.black};
  border-radius: 5px;
`;
const LeaveReviewTextContent = styled(ReactQuill)`
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

const ToLogin = styled(Link)`
  margin-left: 50px;
  @media screen and (max-width: 576px) {
    margin-left: 30px;
  }
  & > ${SubmitReviewBtn} {
    background-color: transparent;
    border: none;
  }
`;

const MemberReviewTitle = styled.h3`
  min-width: 100px;
  font-size: ${(props) => props.theme.fz4};
  line-height: ${(props) => props.theme.fz4};
  font-weight: 700;
  color: ${(props) => props.theme.black};
  @media screen and (max-width: 480px) {
    min-width: 70px;
  }
`;

function LeaveRatingComponent({
  bookIsbn,
  memberReview,
  setMemberReview,
}: {
  bookIsbn: string;
  memberReview: BookReview | undefined;
  setMemberReview: Function;
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
        <MemberReviewTitle>您的評價</MemberReviewTitle>
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
          <>
            <RemoveRatingButton
              onClick={() => {
                Swal.fire({
                  title: "確定要刪除嗎？",
                  text: "評價 / 評論會一起刪除喔！",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "確認刪除",
                  cancelButtonText: "取消",
                }).then((result) => {
                  if (result.isConfirmed) {
                    Swal.fire({
                      icon: "success",
                      title: "刪除成功！",
                      text: "成功刪除評價 / 評論。",
                      showConfirmButton: false,
                      timer: 1500,
                    });
                    if (userInfo.uid && memberReview) {
                      removeBookRating(
                        userInfo.uid,
                        bookIsbn,
                        rating,
                        memberReview
                      );
                      setRating(0);
                      setHover(0);
                      setMemberReview(undefined);
                    }
                  }
                });
              }}
            >
              刪除評論
            </RemoveRatingButton>
          </>
        )}
      </LeaveRatingBox>
    </>
  ) : (
    <LeaveRatingBox>
      <SignMessage>加入會員分享你的想法！</SignMessage>
      <SignButton href="/profile">加入會員</SignButton>
    </LeaveRatingBox>
  );
}

function MemberReviewComponent({ memberReview }: { memberReview: BookReview }) {
  const [isEdit, setIsEdit] = useState(false);
  const [titlevalue, setTitleValue] = useState(memberReview.title);
  const [contentvalue, setContentValue] = useState(memberReview.content);
  const [showMore, setShowMore] = useState(false);

  return isEdit ? (
    <MemberReviewBox>
      <MemberReviewTitleBox>
        <Title>標題</Title>
        <EditTitle theme="bubble" value={titlevalue} onChange={setTitleValue} />
      </MemberReviewTitleBox>
      <MemberReviewContentBox>
        <LeaveReviewTitle>內容</LeaveReviewTitle>
        <EditContent
          theme="bubble"
          value={contentvalue}
          onChange={setContentValue}
        />
      </MemberReviewContentBox>
      <EditReviewButton
        onClick={() => {
          if (
            memberReview.title === titlevalue &&
            contentvalue === memberReview.content
          ) {
            setIsEdit(false);
          } else if (
            titlevalue!.replace(/<(.|\n)*?>/g, "").trim().length > 0 &&
            contentvalue!.replace(/<(.|\n)*?>/g, "").trim().length > 0
          ) {
            editReview(memberReview, titlevalue!, contentvalue!);
            Swal.fire({
              title: "感謝您的評論",
              icon: "success",
              timer: 1000,
              showConfirmButton: false,
            });
            setIsEdit(false);
          } else {
            Swal.fire({
              title: "請勿留下空白內容！",
              icon: "warning",
              timer: 1000,
              showConfirmButton: false,
            });
            setIsEdit(false);
          }
        }}
      >
        送出
      </EditReviewButton>
      <EditReviewButton
        onClick={() => {
          setIsEdit(false);
        }}
      >
        取消
      </EditReviewButton>
    </MemberReviewBox>
  ) : (
    <MemberReviewBox>
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
        編輯
      </EditReviewButton>
      {memberReview?.content!.split("<p>").length > 8 && (
        <SeeMoreBtn
          onClick={() => {
            setShowMore((prev) => !prev);
          }}
        >
          {showMore ? "Show less" : "Show more"}
        </SeeMoreBtn>
      )}
    </MemberReviewBox>
  );
}
function LeaveCommentComponent({ bookIsbn }: { bookIsbn: string }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [titlevalue, setTitleValue] = useState("");
  const [contentvalue, setContentValue] = useState("");

  return userInfo.isSignIn ? (
    <LeaveReviewBox>
      <LeaveInputBox>
        <LeaveReviewTitle>標題</LeaveReviewTitle>
        <LeaveReviewContentTitle
          theme="bubble"
          value={titlevalue}
          onChange={setTitleValue}
        />
      </LeaveInputBox>
      <LeaveInputBox>
        <LeaveReviewTitle>內容</LeaveReviewTitle>
        <LeaveReviewTextContent
          theme="bubble"
          value={contentvalue}
          onChange={setContentValue}
        />
      </LeaveInputBox>
      <SubmitReviewBtn
        onClick={() => {
          if (
            titlevalue.replace(/<(.|\n)*?>/g, "").trim().length > 0 &&
            contentvalue.replace(/<(.|\n)*?>/g, "").trim().length > 0 &&
            userInfo.uid
          ) {
            addBookReview(
              userInfo.uid,
              bookIsbn,
              titlevalue.trim(),
              contentvalue.trim()
            );
          } else {
            Swal.fire({
              title: "請勿留下空白內容！",
              icon: "warning",
              timer: 1000,
              showConfirmButton: false,
            });
          }
        }}
      >
        送出
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
                  <SubReviewMemberName>
                    {subreview.memberData?.name}
                  </SubReviewMemberName>
                </Gotomember>
                <SubReviewContent>{parse(subreview.content!)}</SubReviewContent>
                <SubReviewLikes>
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
                      <Image src={like} alt="likeBtn" width={20} height={20} />
                    )}
                  </LikeButton>
                  <LikeCount>{subreview.likeCount}</LikeCount>
                </SubReviewLikes>
                <SubReviewTime>{`${year}-${month}-${date}`}</SubReviewTime>
              </SubReviewBox>
            );
          })}
      </SubReviewsBox>
      {userInfo.uid ? (
        <>
          <SubReviewInput
            theme="bubble"
            value={reviewValue}
            onChange={setReviewValue}
            placeholder="leave comment...."
          />
          <SubmitReviewBtn
            onClick={() => {
              if (
                reviewValue.replace(/<(.|\n)*?>/g, "").trim().length > 0 &&
                userInfo.uid
              ) {
                sentSubReview(review, reviewValue, userInfo.uid);
                sentNotice(review, reviewValue, userInfo.uid);
                setReviewValue("");
                Swal.fire({
                  title: "感謝您的回應",
                  icon: "success",
                  timer: 1000,
                  showConfirmButton: false,
                });
              } else {
                Swal.fire({
                  title: "請勿留下空白內容！",
                  icon: "warning",
                  timer: 1000,
                  showConfirmButton: false,
                });
              }
            }}
          >
            Submit
          </SubmitReviewBtn>
        </>
      ) : (
        <ToLogin href="/profile">
          <SubmitReviewBtn>趕快登入一起討論吧！</SubmitReviewBtn>
        </ToLogin>
      )}
    </>
  ) : (
    <ShowSubReviewButton
      onClick={() => {
        setShowSubReviews(true);
      }}
    >
      {review.subReviewsNumber === 0
        ? "留下您的回應"
        : `查看其他${review.subReviewsNumber}則回應`}
    </ShowSubReviewButton>
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
const BookReviewMemberWrap = styled.div`
  position: relative;
  width: 100%;
`;
const BookReviewMemberImgWrap = styled.div``;
const BookReviewMemberImg = styled(Image)`
  border-radius: 50%;
  width: 80px;
  height: 80px;
  @media screen and (max-width: 576px) {
    width: 50px;
    height: 50px;
  }
`;
const BookReviewMemberLink = styled(Link)`
  padding: 0 10px;
`;
const BookReviewMemberName = styled.h4`
  display: inline-block;
  margin-right: 20px;
  font-size: ${(props) => props.theme.fz3};
  font-weight: 600;
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz4};
  }
`;
const BookReviewMemberRate = styled.div`
  display: inline-block;
  font-size: ${(props) => props.theme.fz4};
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz5};
  }
`;
const BookReviewMemberRateStart = styled.span`
  display: inline-block;
  font-size: ${(props) => props.theme.fz4};
  color: ${(props) => props.theme.starYellow};
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz5};
  }
`;
const BookReviewMemberDate = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  display: block;
  margin-left: auto;
  font-size: ${(props) => props.theme.fz5};
  @media screen and (max-width: 480px) {
    display: none;
  }
`;
const BookReviewTitle = styled.div`
  font-size: ${(props) => props.theme.fz4};
  margin-top: 30px;
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz4};
  }
`;
interface BookReviewContentProps {
  showMore: boolean;
}
const BookReviewContent = styled.div<BookReviewContentProps>`
  max-height: ${(props) => (props.showMore ? "auto" : "160px")};
  overflow: hidden;
  padding: 20px 0 0 60px;
  font-size: ${(props) => props.theme.fz4};
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz4};
    padding-left: 50px;
  }
  & > p {
    line-height: 20px;
  }
`;
const BookReviewRatingWrap = styled.div`
  width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const BookReviewRatingUpper = styled.div`
  clip-path: polygon(50% 40%, 0% 100%, 100% 100%);
  cursor: pointer;
  display: inline-block;
  height: 30px;
  width: 40px;
  background-color: ${(props) => props.theme.greyBlue};
`;
const BookReviewRatingLower = styled(BookReviewRatingUpper)`
  clip-path: polygon(0 0, 50% 60%, 100% 0);
`;
const BookReviewRatingNumber = styled.p`
  padding: 10px 0;
  font-size: ${(props) => props.theme.fz * 1.5}px;
`;
const SeeMoreBtn = styled.button`
  font-size: ${(props) => props.theme.fz * 1}px;
  padding: 5px 10px;
  margin-right: 20px;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.yellow};
  cursor: pointer;
  margin-top: 20px;
`;

const ButtonsWrap = styled.div`
  margin-left: 60px;
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz4};
    margin-left: 50px;
  }
`;

function ReviewComponent({ review, year, month, date }: ReviewProps) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();
  return (
    <>
      <BookReviewWrap key={review.reviewId}>
        <BookReviewHead>
          <BookReviewRatingWrap>
            <BookReviewRatingUpper
              onClick={() => {
                if (userInfo && !userInfo.isSignIn) {
                  Swal.fire({
                    icon: "info",
                    title: "請先登入喔！",
                    confirmButtonText: "前往登入",
                  }).then((result) => {
                    result.isConfirmed && router.push("/profile");
                  });
                } else if (
                  review.liked?.includes(userInfo.uid!) ||
                  review.disliked?.includes(userInfo.uid!)
                ) {
                  Swal.fire({
                    icon: "warning",
                    title: "已經評分過了喔！",
                    showConfirmButton: false,
                    timer: 1000,
                  });
                } else if (userInfo.uid && review) {
                  Swal.fire({
                    icon: "success",
                    title: "成功評分！",
                    showConfirmButton: false,
                    timer: 1000,
                  });
                  upperReview(userInfo.uid, review);
                }
              }}
            />
            <BookReviewRatingNumber>
              {review.reviewRating}
            </BookReviewRatingNumber>
            <BookReviewRatingLower
              onClick={() => {
                if (userInfo && !userInfo.isSignIn) {
                  Swal.fire({
                    icon: "info",
                    title: "請先登入喔！",
                    confirmButtonText: "前往登入",
                  }).then((result) => {
                    result.isConfirmed && router.push("/profile");
                  });
                } else if (
                  review.liked?.includes(userInfo.uid!) ||
                  review.disliked?.includes(userInfo.uid!)
                ) {
                  Swal.fire({
                    icon: "warning",
                    title: "已經評分過了喔！",
                    showConfirmButton: false,
                    timer: 1000,
                  });
                } else if (userInfo.uid && review) {
                  Swal.fire({
                    icon: "success",
                    title: "成功評分！",
                    showConfirmButton: false,
                    timer: 1000,
                  });
                  lowerReview(userInfo.uid, review);
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
        <ButtonsWrap>
          {review.content!.split("<p>").length > 5 && (
            <SeeMoreBtn
              onClick={() => {
                setShowMore((prev) => !prev);
              }}
            >
              {showMore ? "顯示較少" : "顯示全部"}
            </SeeMoreBtn>
          )}
          <SubReviewComponent review={review} />
        </ButtonsWrap>
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
      <LeaveRatingComponent
        memberReview={memberReview}
        bookIsbn={bookIsbn}
        setMemberReview={setMemberReview}
      />

      {memberReview && memberReview.title && memberReview.title.length > 0 ? (
        <MemberReviewComponent memberReview={memberReview} />
      ) : (
        <LeaveCommentComponent bookIsbn={bookIsbn} />
      )}
      <BookReviewsBox>
        {reviews.length > 0 && reviews[0]?.title?.length! > 0 ? (
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
          <EmptyReview>留下第一則評論吧！</EmptyReview>
        )}
      </BookReviewsBox>
    </>
  );
}
