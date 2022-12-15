import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.bubble.css";
import { useSelector } from "react-redux";
import styled from "styled-components";
import parse from "html-react-parser";
import Swal from "sweetalert2";
import {
  getDoc,
  onSnapshot,
  query,
  doc,
  collection,
  orderBy,
  Unsubscribe,
} from "firebase/firestore";

import { RootState } from "../../store";
import { male, like, liked } from "../../utils/imgs";
import {
  BookReview,
  db,
  SubReview,
  sentSubReview,
  likeSubReview,
  MemberInfo,
  sentNotice,
} from "../../utils/firebaseFuncs";

const ShowReviewBtn = styled.button`
  margin-top: 15px;
  position: relative;
  cursor: pointer;
  color: ${(props) => props.theme.black};
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
const GotoMemberPage = styled(Link)`
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
const SubmitReviewBtn = styled.button`
  margin-top: 10px;
  align-self: end;
  cursor: pointer;
  border: solid 1px ${(props) => props.theme.grey};
  padding: 5px 10px;
  text-align: center;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.darkYellow};
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

export default function SubReviewComponent({ review }: { review: BookReview }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [showSubReviews, setShowSubReviews] = useState<boolean>(false);
  const [subReviews, setSubReviews] = useState<SubReview[]>();
  const [reviewValue, setReviewValue] = useState("");
  useEffect(() => {
    let unsubscribe: Unsubscribe;
    const getSubReviewsData = async () => {
      const reviewId = review.reviewId;
      const reviewQuery = query(
        collection(db, `book_reviews/${reviewId}/subreviews`),
        orderBy("likeCount", "desc")
      );
      unsubscribe = onSnapshot(reviewQuery, async (querySnapshot) => {
        const subReviewsArr: SubReview[] = [];
        const userIds: string[] = [];
        querySnapshot.forEach((doc) => {
          subReviewsArr.push(doc.data());
          userIds.push(doc.data().commentUser);
        });
        const requests = userIds.map(async (userId) => {
          const docData = await getDoc(doc(db, "members", userId));
          return docData.data();
        });
        const allMemberInfo = (await Promise.all(requests)) as MemberInfo[];
        const newSubReview = subReviewsArr.map((subReview) => {
          const userData = allMemberInfo.find(
            (member) => member.uid === subReview.commentUser
          );
          return { ...subReview, memberData: userData };
        });
        setSubReviews(newSubReview);
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
          subReviews.map((subReview) => {
            const ReviewDate = new Date(subReview.time!.seconds * 1000);
            const year = ReviewDate.getFullYear();
            const month = ReviewDate.getMonth() + 1;
            const date = ReviewDate.getDate();
            return (
              <SubReviewBox key={subReview.reviewId}>
                <GotoMemberPage
                  href={
                    subReview.memberData!.uid === userInfo.uid!
                      ? "/profile"
                      : `/member/id:${subReview.memberData!.uid}`
                  }
                >
                  <SubMemberImg
                    src={subReview.memberData?.img || male}
                    alt="member Img"
                    width={25}
                    height={25}
                  />
                  <SubReviewMemberName>
                    {subReview.memberData?.name}
                  </SubReviewMemberName>
                </GotoMemberPage>
                <SubReviewContent>{parse(subReview.content!)}</SubReviewContent>
                <SubReviewLikes>
                  <LikeButton
                    onClick={() => {
                      userInfo.uid &&
                        likeSubReview(review, subReview, userInfo.uid);
                    }}
                  >
                    {userInfo.uid ? (
                      <Image
                        src={
                          subReview.like?.includes(userInfo.uid) ? liked : like
                        }
                        alt="likeBtn"
                        width={20}
                        height={20}
                      />
                    ) : (
                      <Image src={like} alt="likeBtn" width={20} height={20} />
                    )}
                  </LikeButton>
                  <LikeCount>{subReview.likeCount}</LikeCount>
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
