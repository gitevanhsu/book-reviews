import styled from "styled-components";
import { doc, onSnapshot } from "firebase/firestore";
import {
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
  LeaveRatingComponent,
} from "../../components/reviews";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import Link from "next/link";
import add from "../../public/img/add.svg";
import inshelf from "../../public/img/bookshelf.svg";
import chat from "../../public/img/chat.svg";
interface StartProps {
  rating: boolean;
}
const BookPage = styled.div`
  width: 100%;
  min-height: calc(100vh - 50px);
  background-color: #ffe;
  padding: 50px 30px;
`;
const BookBox = styled.div`
  display: flex;
  align-items: start;
  position: relative;
  margin: 0 0 10px;
`;
const BookImg = styled(Image)`
  margin-right: 20px;
`;
const BookDetail = styled.div`
  border: solid 1px #ccc;
  padding: 10px 20px;
  border-radius: 20px;
`;
const ItemBox = styled.div`
  display: flex;
  align-items: start;
  margin-top: 10px;
  &:nth-child(2) {
    margin-top: 0;
  }
`;
const ItemTitle = styled.h2`
  min-width: 90px;
`;
const ItemContent = styled.p`
  line-height: 20px;
`;
const BookRating = styled.div`
  line-height: 20px;
  margin-top: 10px;
  display: flex;
  align-items: center;
`;
const BookRatingStart = styled.div`
  color: #000;
  min-width: 90px;
  display: flex;
  align-items: center;
`;
const BookRatingNum = styled.p`
  font-size: 8px;
  align-self: end;
`;

const Start = styled.div<StartProps>`
  display: inline-block;
  color: ${(props) => (props.rating ? "red" : "black")};
`;
const Wrap = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

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
const ToChatWrap = styled.div`
  display: flex;
  align-items: center;
  margin: 0 10px;
`;
const ChatLink = styled(Link)``;
const AddToShelf = styled.div`
  display: flex;
  align-items: center;
`;
const AddToShelfImg = styled(Image)`
  margin-left: 5px;
  background-color: #ff7ffc;
  cursor: pointer;
`;
const InShelfImg = styled(AddToShelfImg)`
  background-color: #aaa;
  cursor: none;
`;
const ToChatRoom = styled(AddToShelfImg)`
  background-color: #ffe;
`;
const P = styled.p`
  display: inline-block;
  margin-left: 5px;
  font-size: 14px;
`;
const SeeMoreBtn = styled.button`
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #eef;
`;

export function BookComponent({ data }: { data: BookInfo }) {
  const [showMore, setShowMore] = useState(false);
  return data ? (
    <BookBox>
      <BookImg
        src={data.smallThumbnail ? data.smallThumbnail : bookcover}
        alt={`${data.title}`}
        width={128}
        height={193}
        priority
      />
      {!data.smallThumbnail && <NoimgTitle>{data.title}</NoimgTitle>}
      <BookDetail>
        <ItemBox>
          <ItemTitle>Title：</ItemTitle>
          <ItemContent>{data.title}</ItemContent>
        </ItemBox>
        {data.subtitle && (
          <ItemBox>
            <ItemTitle />
            <ItemContent>{data.subtitle}</ItemContent>
          </ItemBox>
        )}
        {data.authors && (
          <ItemBox>
            <ItemTitle>Author:</ItemTitle>
            {data.authors?.map((author: string) => (
              <ItemContent key={author}>{author}</ItemContent>
            ))}
          </ItemBox>
        )}
        {data.ratingMember && data.ratingMember.length > 0 && data.ratingCount && (
          <BookRating>
            <ItemTitle>Rating:</ItemTitle>
            <BookRatingStart>
              {[...Array(5)].map((_, index) => {
                return (
                  <Start
                    key={index}
                    rating={
                      index <
                      Math.round(data.ratingCount! / data.ratingMember!.length)
                    }
                  >
                    &#9733;
                  </Start>
                );
              })}
              <BookRatingNum>
                {Math.round(
                  (data.ratingCount / data.ratingMember.length) * 100
                ) / 100}
              </BookRatingNum>
              ({data.ratingMember!.length})
            </BookRatingStart>
          </BookRating>
        )}
        {data.categories && data.categories?.length > 0 && (
          <ItemBox>
            <ItemTitle>Cat：</ItemTitle>
            {data.categories?.map((category: string) => (
              <ItemContent key={category}>{category}</ItemContent>
            ))}
          </ItemBox>
        )}
        {data.publisher && data.publisher.length > 0 && (
          <ItemBox>
            <ItemTitle>Publisher：</ItemTitle>
            <ItemContent>{data.publisher}</ItemContent>
          </ItemBox>
        )}
        {data.publishedDate && (
          <ItemBox>
            <ItemTitle>Date：</ItemTitle>
            <ItemContent> {data.publishedDate}</ItemContent>
          </ItemBox>
        )}
        <ItemBox>
          <ItemTitle>ISBN：</ItemTitle>
          <ItemContent>{data.isbn}</ItemContent>
        </ItemBox>
        {data.description && data.description.length > 0 && (
          <ItemBox>
            <ItemTitle>Describe：</ItemTitle>
            <ItemContent>
              {showMore ? data.description : data.description.substring(0, 250)}
              <SeeMoreBtn
                className="btn"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Show less" : "Show more"}
              </SeeMoreBtn>
            </ItemContent>
          </ItemBox>
        )}
      </BookDetail>
    </BookBox>
  ) : (
    <BookBox>
      <ItemTitle>查無書籍資料</ItemTitle>
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
    let unsub1: Function;
    if (typeof id === "string") {
      unsub1 = onSnapshot(
        doc(db, "books", `${id.replace("id:", "")}`),
        (doc) => {
          const bookData = doc.data() as BookInfo;
          setBookData(bookData);
        }
      );
    }
    let unsub2: Function;
    if (userInfo.uid) {
      unsub2 = onSnapshot(doc(db, "members", userInfo.uid!), (doc) => {
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
    }
    return () => {
      if (unsub1) unsub1();
      if (unsub2) unsub2();
    };
  }, [dispatch, id, userInfo]);

  return (
    <BookPage>
      <BookComponent data={bookData} />
      <Wrap>
        {userInfo.isSignIn &&
          (inShelf ? (
            <AddToShelf>
              <InShelfImg src={inshelf} alt="add" width={20} height={20} />
              <P>已收藏</P>
            </AddToShelf>
          ) : (
            <AddToShelf>
              {inShelf || (
                <AddToShelfImg
                  src={add}
                  alt="add"
                  width={20}
                  height={20}
                  onClick={() => {
                    if (typeof id === "string" && userInfo && userInfo.uid)
                      addToshelf(id.replace("id:", ""), userInfo.uid);
                  }}
                />
              )}
              <P>加入書櫃</P>
            </AddToShelf>
          ))}
        {userInfo.isSignIn && typeof id === "string" && (
          <ToChatWrap>
            <ChatLink href={`/group/id:${id.replace("id:", "")}`}>
              <ToChatRoom src={chat} alt="add" width={20} height={20} />
            </ChatLink>
            <P>進入會員討論區</P>
          </ToChatWrap>
        )}
      </Wrap>
      <LeaveRatingComponent
        memberReview={memberReviews}
        bookIsbn={typeof id === "string" ? id.replace("id:", "") : ""}
      />

      <ReviewsComponent
        bookIsbn={typeof id === "string" ? id.replace("id:", "") : ""}
      />
    </BookPage>
  );
}
