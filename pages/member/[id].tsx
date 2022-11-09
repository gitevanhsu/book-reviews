import styled from "styled-components";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  BookInfo,
  getBookDatas,
  getMemberData,
  MemberInfo,
  sentFriendRequest,
} from "../../utils/firebaseFuncs";
import Image from "next/image";
import male from "/public/img/reading-male.png";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import Link from "next/link";
import bookcover from "/public/img/bookcover.jpeg";

const Friend = styled.div`
  display: inline-block;
  padding: 5px 10px;
  border: solid 1px;
`;
const AddFriendButton = styled.button`
  padding: 5px 10px;
  border: solid 1px;
  cursor: pointer;
`;
const BookShelfs = styled.div`
  border: solid 1px;
  display: flex;
  justify-content: space-around;
`;
const BookShelf = styled.div`
  display: inline-block;
  width: 30%;
  border: solid 1px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  height: 500px;
  overflow: auto;
`;
const ShelfTitle = styled.h2`
  text-align: center;
  position: sticky;
  top: 0;
  background-color: #f0f;
  z-index: 1;
`;
const Books = styled.div`
  min-height: 480px;
`;
const Book = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;
const BookImg = styled(Image)``;
const BookLink = styled(Link)`
  display: inline-block;
`;
const BookTitle = styled.h3``;
const BookData = styled.div``;
const BookAuthor = styled.h4``;
const NoimgTitle = styled.p`
  position: absolute;
  color: #fff;
  font-size: 12px;
  width: 80px;
  height: 120px;
  overflow: hidden;
  padding: 10px 5px;
  text-align: center;
  letter-spacing: 2px;
  top: 0;
  left: 0;
  pointer-events: none;
`;
export default function MemberPageComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [member, setMember] = useState<MemberInfo>({});
  const router = useRouter();
  const { id } = router.query;
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [reading, setReading] = useState<BookInfo[]>([]);
  const [finish, setFinish] = useState<BookInfo[]>([]);
  useEffect(() => {
    const memberData = async () => {
      if (typeof id === "string") {
        const data = (await getMemberData(id.replace("id:", ""))) as MemberInfo;
        setMember(data);
      }
    };
    const getBooks = async () => {
      if (typeof id === "string") {
        const memberData = (await getMemberData(
          id.replace("id:", "")
        )) as MemberInfo;
        if (memberData.books && memberData.reading && memberData.finish) {
          const booksDatas = await getBookDatas(memberData.books);
          booksDatas.length && setBooks(booksDatas as BookInfo[]);
          const readingDatas = await getBookDatas(memberData.reading);
          readingDatas.length && setReading(readingDatas as BookInfo[]);
          const finishDatas = await getBookDatas(memberData.finish);
          finishDatas.length && setFinish(finishDatas as BookInfo[]);
        }
      }
    };
    getBooks();
    memberData();
  }, [id]);

  return (
    <>
      <Image
        src={member && member.img ? member.img : male}
        alt={member && member.name ? member.name : "user Img"}
        width={50}
        height={50}
      ></Image>
      <p>{member.uid}</p>
      <p>{member.name}</p>
      <p>{member.email}</p>
      <p>{member.intro ? member.intro : "這個人沒有填寫自我介紹 :("}</p>
      {userInfo.uid &&
      member.friends &&
      member.friends.includes(userInfo.uid) ? (
        <Friend>Friend</Friend>
      ) : (
        <AddFriendButton
          onClick={() => {
            if (userInfo.uid && member.uid) {
              sentFriendRequest(userInfo.uid, member.uid);
            }
          }}
        >
          Add Friend
        </AddFriendButton>
      )}
      <BookShelfs>
        <BookShelf>
          <ShelfTitle>已收藏</ShelfTitle>
          <Books>
            {books?.map(
              (book) =>
                book.isbn && (
                  <Book key={book.isbn}>
                    <BookLink href={`/book/id:${book.isbn}`}>
                      <BookImg
                        src={
                          book.smallThumbnail ? book.smallThumbnail : bookcover
                        }
                        alt={`${book.title}`}
                        width={80}
                        height={120}
                        priority
                      ></BookImg>
                    </BookLink>
                    <BookData>
                      {!book.smallThumbnail && (
                        <NoimgTitle>{book.title}</NoimgTitle>
                      )}
                      <BookTitle>書名：{book.title}</BookTitle>
                      <br />
                      {book.authors!.length > 0 && (
                        <BookAuthor>作者：{book.authors![0]}</BookAuthor>
                      )}
                    </BookData>
                  </Book>
                )
            )}
          </Books>
        </BookShelf>
        <BookShelf>
          <ShelfTitle>閱讀中</ShelfTitle>
          <Books>
            {reading?.map(
              (book) =>
                book.isbn && (
                  <Book key={book.isbn}>
                    <BookLink href={`/book/id:${book.isbn}`}>
                      <BookImg
                        src={
                          book.smallThumbnail ? book.smallThumbnail : bookcover
                        }
                        alt={`${book.title}`}
                        width={80}
                        height={120}
                        priority
                      ></BookImg>
                    </BookLink>
                    <BookData>
                      {!book.smallThumbnail && (
                        <NoimgTitle>{book.title}</NoimgTitle>
                      )}
                      <BookTitle>書名：{book.title}</BookTitle>
                      <br />
                      {book.authors!.length > 0 && (
                        <BookAuthor>作者：{book.authors![0]}</BookAuthor>
                      )}
                    </BookData>
                  </Book>
                )
            )}
          </Books>
        </BookShelf>
        <BookShelf>
          <ShelfTitle>已閱讀</ShelfTitle>
          <Books>
            {finish?.map(
              (book) =>
                book.isbn && (
                  <Book key={book.isbn}>
                    <BookLink href={`/book/id:${book.isbn}`}>
                      <BookImg
                        src={
                          book.smallThumbnail ? book.smallThumbnail : bookcover
                        }
                        alt={`${book.title}`}
                        width={80}
                        height={120}
                        priority
                      ></BookImg>
                    </BookLink>
                    <BookData>
                      {!book.smallThumbnail && (
                        <NoimgTitle>{book.title}</NoimgTitle>
                      )}
                      <BookTitle>書名：{book.title}</BookTitle>
                      <br />
                      {book.authors!.length > 0 && (
                        <BookAuthor>作者：{book.authors![0]}</BookAuthor>
                      )}
                    </BookData>
                  </Book>
                )
            )}
          </Books>
        </BookShelf>
      </BookShelfs>
    </>
  );
}
