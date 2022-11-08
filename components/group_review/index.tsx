import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  upperReview,
  lowerReview,
  MemberInfo,
  leaveGroupReview,
  GroupReview,
  getMemberData,
  likeGroupReview,
  editGroupReview,
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
import { async } from "@firebase/util";

const ReviewBox = styled.div``;
const Title = styled.h2``;
const TitleInput = styled.input``;
const Content = styled.p``;
const ContentInput = styled.textarea``;

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
const Review = styled.div``;
const LikeCount = styled.p``;
const LikeButton = styled.button`
  cursor: pointer;
  padding: 5px 10px;
  border: solid 1px;
`;
const EditButton = styled(LikeButton)``;

const Member = styled.div`
  display: flex;
  align-items: center;
`;
const MemberImg = styled(Image)``;
const MemberName = styled.p``;

const SubReviewBox = styled.div``;

function SubReviewComponent() {
  return <SubReviewBox></SubReviewBox>;
}

function ReviewComponent({ id, review }: { id: string; review: GroupReview }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Review key={review.reviewId}>
      <Member>
        <MemberImg
          src={
            review.userData && review.userData.img ? review.userData.img : male
          }
          alt={
            review.userData && review.userData.name
              ? review.userData.name
              : "user Img"
          }
          width={25}
          height={25}
        ></MemberImg>
        <MemberName>{review.userData?.name}</MemberName>
      </Member>
      {isEdit ? (
        <>
          <Title>標題</Title>
          <TitleInput ref={titleRef} defaultValue={review.title}></TitleInput>
          <br />
          <Content>內容</Content>
          <ContentInput
            ref={contentRef}
            defaultValue={review.content}
          ></ContentInput>
          <br />
          <EditButton
            onClick={() => {
              setIsEdit(false);
            }}
          >
            取消編輯
          </EditButton>
          <EditButton
            onClick={() => {
              if (
                titleRef.current &&
                titleRef.current.value &&
                contentRef.current &&
                contentRef.current.value
              )
                editGroupReview(
                  id,
                  review,
                  userInfo,
                  titleRef.current.value,
                  contentRef.current.value
                );
              setIsEdit(false);
            }}
          >
            送出編輯
          </EditButton>
        </>
      ) : (
        <>
          <Title>標題：{review.title}</Title>
          <Content>內容：{review.content}</Content>
          <LikeCount>喜歡：{review.likeCount}</LikeCount>
          <LikeButton
            onClick={() => {
              likeGroupReview(id, review, userInfo);
            }}
          >
            喜歡
          </LikeButton>
          {review.uid === userInfo.uid && (
            <EditButton
              onClick={() => {
                setIsEdit(true);
              }}
            >
              編輯
            </EditButton>
          )}
        </>
      )}
    </Review>
  );
}

function ReviewsComponent({ id }: { id: string }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [reviewData, setReviewData] = useState<GroupReview[]>();

  useEffect(() => {
    let unsub;
    if (id) {
      unsub = onSnapshot(
        query(collection(db, `books/${id}/group_reviews`)),
        async (querySnapshot) => {
          const ids: string[] = [];
          const reviewDatas = querySnapshot.docs.map((doc) => {
            ids.push(doc.data().uid);
            return doc.data() as GroupReview;
          });
          const requests = ids.map(async (id) => {
            const docData = await getMemberData(id);
            return docData;
          });
          const allMemberInfo = (await Promise.all(requests)) as MemberInfo[];

          const newReviewDatas = reviewDatas.map((review) => {
            const userData = allMemberInfo.find(
              (member) => member.uid === review.uid
            );
            return { ...review, userData };
          });
          setReviewData(newReviewDatas);
        }
      );
    }
  }, [id]);

  return (
    <ReviewBox>
      {reviewData ? (
        reviewData.map((review) => (
          <ReviewComponent key={review.reviewId} review={review} id={id} />
        ))
      ) : (
        <Review>目前尚未有人留言討論喔</Review>
      )}
    </ReviewBox>
  );
}

function LeaveGroupCommentComponent({ id }: { id: string }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
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
              typeof userInfo.uid === "string"
            ) {
              leaveGroupReview(
                id,
                userInfo.uid,
                titleInputRef.current.value,
                contentInputRef.current.value
              );
            }
          }}
        >
          送出評論
        </SentReviewButton>
      </LeaveReviewBox>
      <ReviewsComponent id={id} />
    </>
  );
}

export default function GroupReviewComponent({ id }: { id: string }) {
  return (
    <>
      <LeaveGroupCommentComponent id={id} />
      <LeaveReviewBox>
        <Title></Title>
        <Content></Content>
      </LeaveReviewBox>
    </>
  );
}
