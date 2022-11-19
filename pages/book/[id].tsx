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
interface StarProps {
  rating: boolean;
}
const BookPage = styled.div`
  width: 100%;
  min-height: calc(100vh - 50px);
  background-color: ${(props) => props.theme.lightWhite};
  padding: 50px 30px;
`;
const BookPageWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;
const BookBox = styled.div`
  display: flex;
  align-items: star;
  position: relative;
  margin: 0 0 10px;
  @media screen and (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
`;
const BookImgBox = styled.div`
  margin-right: 20px;
  @media screen and (max-width: 576px) {
    margin: 0 0 50px;
  }
`;
const BookImg = styled(Image)`
  box-shadow: 5px 5px 5px ${(props) => props.theme.black};
`;
const BookDetail = styled.div`
  border: solid 1px ${(props) => props.theme.greyBlue};
  padding: 10px 20px;
  border-radius: 10px;
`;
interface ItemBoxProps {
  hasSub?: boolean;
}
interface TitleProps {
  isTitle?: boolean;
}
const ItemBox = styled.div<ItemBoxProps>`
  display: flex;
  align-items: star;
  margin-top: ${(props) => (props.hasSub ? "0px" : "15px")};
`;
const ItemTitle = styled.h2<TitleProps>`
  min-width: 90px;
  line-height: ${(props) => props.theme.fz * 1.5}px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  @media screen and (max-width: 768px) {
    line-height: ${(props) => props.theme.fz * 1.5}px;
    font-size: ${(props) => props.theme.fz * 1}px;
  }
  @media screen and (max-width: 576px) {
    min-width: 70px;
  }
`;
const ItemContent = styled.p<TitleProps>`
  line-height: ${(props) =>
    props.isTitle ? props.theme.fz * 3 : props.theme.fz * 1.5}px;
  font-size: ${(props) =>
    props.isTitle ? props.theme.fz * 3 : props.theme.fz * 1.5}px;

  @media screen and (max-width: 768px) {
    line-height: ${(props) =>
      props.isTitle ? props.theme.fz * 2.5 : props.theme.fz * 1.5}px;
    font-size: ${(props) =>
      props.isTitle ? props.theme.fz * 2.5 : props.theme.fz * 1}px;
  }
  @media screen and (max-width: 576px) {
    line-height: ${(props) =>
      props.isTitle ? props.theme.fz * 2 : props.theme.fz * 1.5}px;
    font-size: ${(props) =>
      props.isTitle ? props.theme.fz * 2 : props.theme.fz * 1}px;
  }
`;
const SubItemBox = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
  & > ${ItemContent} {
    line-height: ${(props) => props.theme.fz * 1}px;
    font-size: ${(props) => props.theme.fz * 1}px;
  }
`;

const DeskDescript = styled(ItemContent)`
  display: block;
  @media screen and (max-width: 576px) {
    display: none;
  }
`;
const MobileDescript = styled(ItemContent)`
  display: none;
  @media screen and (max-width: 576px) {
    display: block;
  }
`;
const BookRating = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 15px;
`;
const BookRatingStar = styled.div`
  color: #000;
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.fz * 1.5}px;
`;
const BookRatingNum = styled.p`
  line-height: 24px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
`;

const Star = styled.div<StarProps>`
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
  font-size: ${(props) => props.theme.fz * 2}px;
  width: 220px;
  height: 331px;
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
const ChatLink = styled(Link)`
  display: inline-block;
  display: flex;
  align-items: center;
  color: #000;
`;

const InShelf = styled.div`
  display: flex;
  align-items: center;
`;
const AddToShelf = styled(InShelf)`
  cursor: pointer;
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
  font-size: ${(props) => props.theme.fz}px;
  padding: 5px 10px;
  margin: 0 10px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.yellow};
  cursor: pointer;
`;

export function BookComponent({ data }: { data: BookInfo }) {
  const [showMore, setShowMore] = useState(false);
  return data ? (
    <BookBox>
      <BookImgBox>
        <BookImg
          src={data.smallThumbnail ? data.smallThumbnail : bookcover}
          alt={`${data.title}`}
          width={220}
          height={331}
          priority
        />
        {data.ratingMember && data.ratingMember.length > 0 && data.ratingCount && (
          <BookRating>
            <BookRatingStar>
              {[...Array(5)].map((_, index) => {
                return (
                  <Star
                    key={index}
                    rating={
                      index <
                      Math.round(data.ratingCount! / data.ratingMember!.length)
                    }
                  >
                    &#9733;
                  </Star>
                );
              })}
              <BookRatingNum>
                {Math.round(
                  (data.ratingCount / data.ratingMember.length) * 100
                ) / 100}
              </BookRatingNum>
              ({data.ratingMember!.length})
            </BookRatingStar>
          </BookRating>
        )}
        {data.categories && data.categories?.length > 0 && (
          <SubItemBox>
            {data.categories?.map((category: string) => (
              <ItemContent key={category}>{category}</ItemContent>
            ))}
          </SubItemBox>
        )}
      </BookImgBox>
      {!data.smallThumbnail && <NoimgTitle>{data.title}</NoimgTitle>}
      <BookDetail>
        <ItemBox>
          <ItemContent isTitle={true}>{data.title}</ItemContent>
        </ItemBox>
        {data.subtitle && (
          <ItemBox hasSub={true}>
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
        <ItemBox>
          <ItemTitle>ISBN：</ItemTitle>
          <ItemContent>{data.isbn}</ItemContent>
        </ItemBox>
        {data.description && data.description.length > 0 && (
          <ItemBox>
            <ItemTitle>Describe：</ItemTitle>
            <DeskDescript>
              {showMore
                ? data.description
                : `${data.description.substring(0, 250)}......`}
              <SeeMoreBtn
                className="btn"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Show less" : "Show more"}
              </SeeMoreBtn>
            </DeskDescript>
            <MobileDescript>
              {showMore
                ? data.description
                : `${data.description.substring(0, 150)}......`}
              <SeeMoreBtn
                className="btn"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Show less" : "Show more"}
              </SeeMoreBtn>
            </MobileDescript>
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
      <BookPageWrap>
        <BookComponent data={bookData} />
        <Wrap>
          {userInfo.isSignIn &&
            (inShelf ? (
              <InShelf>
                <InShelfImg src={inshelf} alt="add" width={20} height={20} />
                <P>已收藏</P>
              </InShelf>
            ) : (
              <AddToShelf
                onClick={() => {
                  if (typeof id === "string" && userInfo && userInfo.uid)
                    addToshelf(id.replace("id:", ""), userInfo.uid);
                }}
              >
                {inShelf || (
                  <AddToShelfImg src={add} alt="add" width={20} height={20} />
                )}
                <P>加入書櫃</P>
              </AddToShelf>
            ))}
          {userInfo.isSignIn && typeof id === "string" && (
            <ToChatWrap>
              <ChatLink href={`/group/id:${id.replace("id:", "")}`}>
                <ToChatRoom src={chat} alt="add" width={20} height={20} />
                <P>進入會員討論區</P>
              </ChatLink>
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
      </BookPageWrap>
    </BookPage>
  );
}
