import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";

import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";

import { ReviewsComponent } from "../../components/reviews";
import { RootState } from "../../store";
import { mark, yellowMark, chat } from "../../utils/imgs";
import {
  BookInfo,
  db,
  addBookToShelf,
  MemberInfo,
  getFirstBook,
  getFirstReview,
} from "../../utils/firebaseFuncs";
import BookComponent from "../../components/book";

const BookPage = styled.div`
  width: 100%;
  min-height: calc(100vh - 50px);
  background-color: ${(props) => props.theme.grey};
  padding: 50px 30px;
`;
const BookPageWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;
const Wrap = styled.div`
  top: 25%;
  right: 5px;
  position: fixed;
  margin-left: 20px;
  margin-bottom: 20px;
  background-color: ${(props) => props.theme.darkYellow};
  opacity: 0.9;
  padding: 20px 10px;
  border-radius: 10px;
  color: ${(props) => props.theme.black};
`;
const ToChatWrap = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
`;
const ChatLink = styled(Link)`
  display: inline-block;
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.black};
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
  cursor: pointer;
`;
const InShelfImg = styled(AddToShelfImg)`
  cursor: unset;
`;
const ToChatRoom = styled(AddToShelfImg)``;
const P = styled.p`
  display: inline-block;
  margin-left: 5px;
  font-size: ${(props) => props.theme.fz4};
`;

interface PostProps {
  firstData: BookInfo;
  firstReview: string;
}

export default function Post({ firstData, firstReview }: PostProps) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [bookData, setBookData] = useState<BookInfo>(firstData);
  const [inShelf, setInShelf] = useState<boolean>(false);
  const dispatch = useDispatch();
  useEffect(() => {
    const unSubscriptBookData = onSnapshot(
      doc(db, "books", `${firstData.isbn}`),
      (doc) => {
        const bookData = doc.data() as BookInfo;
        setBookData(bookData);
      }
    );
    let unScriptBookInShelf: Unsubscribe;
    if (userInfo?.uid) {
      unScriptBookInShelf = onSnapshot(
        doc(db, "members", userInfo?.uid!),
        (doc) => {
          const userData = doc.data() as MemberInfo;
          if (
            typeof firstData.isbn === "string" &&
            (userData.books?.includes(firstData.isbn) ||
              userData.reading?.includes(firstData.isbn) ||
              userData.finish?.includes(firstData.isbn))
          ) {
            setInShelf(true);
          }
        }
      );
    }

    return () => {
      unSubscriptBookData();
      unScriptBookInShelf && unScriptBookInShelf();
    };
  }, [dispatch, firstData.isbn, userInfo]);

  return (
    <BookPage>
      <BookPageWrap>
        <BookComponent data={bookData} />
        <ReviewsComponent
          bookIsbn={firstData.isbn!}
          firstReview={JSON.parse(firstReview)}
          bookData={bookData}
        />
      </BookPageWrap>
      {userInfo.isSignIn && (
        <Wrap>
          {inShelf ? (
            <InShelf>
              <InShelfImg src={yellowMark} alt="add" width={20} height={20} />
              <P>已收藏</P>
            </InShelf>
          ) : (
            <AddToShelf
              onClick={() => {
                if (
                  typeof firstData.isbn === "string" &&
                  userInfo &&
                  userInfo.uid
                )
                  addBookToShelf(firstData.isbn, userInfo.uid);
              }}
            >
              {inShelf || (
                <AddToShelfImg src={mark} alt="add" width={20} height={20} />
              )}
              <P>加入書櫃</P>
            </AddToShelf>
          )}
          {typeof firstData.isbn === "string" && (
            <ToChatWrap>
              <ChatLink href={`/group/id:${firstData.isbn}`}>
                <ToChatRoom src={chat} alt="add" width={20} height={20} />
                <P>會員討論區</P>
              </ChatLink>
            </ToChatWrap>
          )}
        </Wrap>
      )}
    </BookPage>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const url = (params as ParsedUrlQuery).id as string;
  const bookIsbn = url.split("id:")[1];
  const firstData = await getFirstBook(bookIsbn);
  const firstReview = await getFirstReview(bookIsbn);
  if (firstData) {
    return {
      props: { firstData, firstReview: JSON.stringify(firstReview) },
    };
  } else {
    return {
      notFound: true,
    };
  }
};
