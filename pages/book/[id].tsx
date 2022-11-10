import styled from "styled-components";
import { doc, onSnapshot } from "firebase/firestore";
import {
  getBookInfo,
  BookInfo,
  getMemberReviews,
  BookReview,
  db,
  addToshelf,
  MemberInfo,
} from "../../utils/firebaseFuncs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import bookcover from "/public/img/bookcover.jpeg";

import {
  ReviewsComponent,
  LeaveCommentComponent,
  LeaveRatingComponent,
} from "../../components/reviews";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import Link from "next/link";
import { userSignIn } from "../../slices/userInfoSlice";

const BookBox = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;
const BookDetail = styled.div``;
const BookTitle = styled.h2``;
const BookSubTitle = styled.h3``;
const BookIsbn = styled.p``;
const BookPublisher = styled.p``;
const BookPublishedDate = styled.p``;
const BookDescription = styled.p``;
const BookAuthor = styled.h4``;
const Categories = styled.p``;
const NoimgTitle = styled.h2`
  position: absolute;
  color: #fff;
  font-size: 16px;
  width: 128px;
  height: 193px;
  overflow: hidden;
  padding: 20px 10px;
  text-align: center;
  letter-spacing: 2px;
  top: 0;
  left: 0;
  pointer-events: none;
`;
const StartGroup = styled(Link)`
  display: inline-block;
  padding: 5px 10px;
  border: solid 1px;
`;
const AddToShelf = styled.button`
  cursor: pointer;
  border: solid 1px;
  padding: 5px 10px;
`;
const P = styled.p`
  display: inline-block;
  border: solid 1px;
  padding: 5px 10px;
`;

export function BookComponent({ data }: { data: BookInfo }) {
  return data ? (
    <BookBox>
      <Image
        src={data.smallThumbnail ? data.smallThumbnail : bookcover}
        alt={`${data.title}`}
        width={128}
        height={193}
        priority
      />
      {!data.smallThumbnail && <NoimgTitle>{data.title}</NoimgTitle>}
      <BookDetail>
        <BookTitle>書名：{data.title}</BookTitle>
        {data.subtitle && <BookSubTitle>{data.subtitle}</BookSubTitle>}
        {data.authors?.map((author: string) => (
          <BookAuthor key={author}>作者:{author}</BookAuthor>
        ))}
        {data.categories &&
          data.categories?.length > 0 &&
          data.categories?.map((category: string) => (
            <Categories key={category}>分類：{category}</Categories>
          ))}
        <BookPublisher>
          出版社：{data.publisher?.length === 0 && "NO DATA"}
        </BookPublisher>
        <BookPublishedDate>出版日期：{data.publishedDate}</BookPublishedDate>
        <BookIsbn>ISBN：{data.isbn}</BookIsbn>
        <BookDescription>
          簡介：
          {data.description?.length === 0 && data.textSnippet?.length === 0
            ? "NO DATA"
            : data.textSnippet}
        </BookDescription>
      </BookDetail>
    </BookBox>
  ) : (
    <BookBox>
      <BookTitle>查無書籍資料</BookTitle>
    </BookBox>
  );
}

export default function Post() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [bookData, setBookData] = useState<BookInfo>({});
  const [memberReviews, setMemberReviews] = useState<BookReview>({});
  const [inShelf, setInShelf] = useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  useEffect(() => {
    if (typeof id === "string") {
      getBookInfo(id.replace("id:", "")).then(
        (data: BookInfo | undefined) => data && setBookData(data)
      );
    }

    if (userInfo.isSignIn && userInfo.uid && typeof id === "string") {
      getMemberReviews(userInfo.uid, id.replace("id:", "")).then((res) => {
        setMemberReviews(res);
      });
    }
    if (
      typeof id === "string" &&
      (userInfo.books?.includes(id.replace("id:", "")) ||
        userInfo.reading?.includes(id.replace("id:", "")) ||
        userInfo.finish?.includes(id.replace("id:", "")))
    ) {
      setInShelf(true);
    }
    let unsub: Function;
    if (userInfo.uid) {
      unsub = onSnapshot(doc(db, "members", userInfo.uid!), (doc) => {
        const userData = doc.data() as MemberInfo;
        if (
          typeof id === "string" &&
          (userData.books?.includes(id.replace("id:", "")) ||
            userData.reading?.includes(id.replace("id:", "")) ||
            userData.finish?.includes(id.replace("id:", "")))
        ) {
          setInShelf(true);
        }
      });
    }
    return () => {
      if (unsub) unsub();
    };
  }, [dispatch, id, userInfo]);

  return (
    <>
      <BookComponent data={bookData} />
      {userInfo.isSignIn &&
        (inShelf ? (
          <P>已收藏 </P>
        ) : (
          <AddToShelf
            onClick={() => {
              if (typeof id === "string" && userInfo && userInfo.uid)
                addToshelf(id.replace("id:", ""), userInfo.uid);
            }}
          >
            加入書櫃
          </AddToShelf>
        ))}
      <br />
      {userInfo.isSignIn && typeof id === "string" && (
        <StartGroup href={`/group/id:${id.replace("id:", "")}`}>
          Start a Group
        </StartGroup>
      )}
      <LeaveRatingComponent
        memberReview={memberReviews}
        bookIsbn={typeof id === "string" ? id.replace("id:", "") : ""}
      />

      <ReviewsComponent
        bookIsbn={typeof id === "string" ? id.replace("id:", "") : ""}
      />
    </>
  );
}
