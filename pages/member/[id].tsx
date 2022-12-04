import styled from "styled-components";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  acceptFriendRequest,
  BookInfo,
  friendStateChecker,
  getBookDatas,
  getMemberData,
  MemberInfo,
  sentFriendRequest,
} from "../../utils/firebaseFuncs";
import Image from "next/image";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import Link from "next/link";
import bookcover from "/public/img/bookcover.jpeg";
import isFriendImg from "/public/img/friend.png";
import addFriendImg from "/public/img/add-friend.png";
import wait from "/public/img/wait.png";

const MemberPage = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 60px);
  position: relative;
  background-color: ${(props) => props.theme.white};
`;
const MemberPageWrap = styled.div`
  height: 100%;
  padding: 50px 15px;
  max-width: 1280px;
  margin: 0 auto;
`;
const BookShelfs = styled.div`
  display: flex;
  justify-content: space-around;
  @media screen and (max-width: 992px) {
    flex-direction: column;
  }
`;
const BookShelf = styled.div`
  display: inline-block;
  width: 30%;
  border: solid 5px ${(props) => props.theme.grey};
  background-color: ${(props) => props.theme.yellow2};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  height: 500px;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none;
  }
  @media screen and (max-width: 992px) {
    width: 100%;
    height: 350px;
    margin-bottom: 40px;
  }
`;
const ShelfTitle = styled.h2`
  text-align: center;
  position: sticky;
  width: 100%;
  top: 0;
  color: ${(props) => props.theme.black};
  background-color: #ecbe48;
  font-size: ${(props) => props.theme.fz4};
  letter-spacing: 2px;
  padding: 10px;
  z-index: 1;
`;
const Books = styled.div`
  min-height: 400px;
  padding: 15px 15px;
  @media screen and (max-width: 992px) {
    min-height: 250px;
  }
`;
const Book = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  border-bottom: 1px solid #efc991;
  padding-bottom: 5px;
  margin-bottom: 10px;
`;
const BookImg = styled(Image)`
  box-shadow: 0px 0px 5px ${(props) => props.theme.black};
  margin-right: 10px;
`;
const BookLink = styled(Link)`
  display: inline-block;
`;
const BookTitle = styled.h3`
  font-size: ${(props) => props.theme.fz4};
  font-weight: 600;
`;
const BookData = styled.div``;
const BookAuthor = styled.h4`
  font-size: ${(props) => props.theme.fz4};
`;
const NoimgTitle = styled.p`
  font-size: ${(props) => props.theme.fz5};
  line-height: ${(props) => props.theme.fz4};
  position: absolute;
  color: ${(props) => props.theme.white};
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

const FriendStateImg = styled(Image)`
  width: 30px;
  height: 30px;
  margin-right: 10px;
`;

const FriendRequestBox = styled.div`
  margin-left: auto;
  padding: 5px 10px;
  @media screen and (max-width: 768px) {
    margin: 40px auto;
  }
`;
const AcceptRequest = styled.button`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border: solid 1px ${(props) => props.theme.grey};
  background-color: ${(props) => props.theme.yellow};
  cursor: pointer;
  border-radius: 20px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
  }
`;
const SentRequest = styled.button`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border: solid 1px ${(props) => props.theme.grey};
  background-color: ${(props) => props.theme.yellow};
  font-size: ${(props) => props.theme.fz * 1.5}px;
  border-radius: 20px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
  }
`;
const OtherRequest = styled.div`
  font-size: ${(props) => props.theme.fz * 1.5}px;
  background-color: ${(props) => props.theme.greyGreen};
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border: solid 1px ${(props) => props.theme.grey};
`;
const WaitRequest = styled.div`
  font-size: ${(props) => props.theme.fz * 1.5}px;
  background-color: ${(props) => props.theme.greyGreen};
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border: solid 1px ${(props) => props.theme.grey};
`;

const UserDetail = styled.div`
  width: 100%;
  max-width: 500px;
  margin-left: 40px;
  @media screen and (max-width: 992px) {
    max-width: 300px;
  }
`;
const UserName = styled.h2`
  font-size: ${(props) => props.theme.fz2};
  margin-bottom: 10px;
  letter-spacing: 2px;
  word-wrap: break-word;
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz3};
  }
`;
const UserAvatar = styled(Image)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;
const UserIntro = styled.p`
  font-size: ${(props) => props.theme.fz4};
  letter-spacing: 2px;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  width: 100%;
  border-top: 1px solid ${(props) => props.theme.grey};
  margin-top: 10px;
  padding-top: 10px;
  max-height: 150px;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const UserInfoBox = styled.div`
  position: relative;
  margin: 0 auto;
  width: 90%;
  display: flex;
  margin-bottom: 50px;
  align-items: center;
  @media screen and (max-width: 992px) {
    width: 80%;
  }
  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
  & > ${UserAvatar} {
    width: 100px;
    height: 100px;
    @media screen and (max-width: 768px) {
      margin-bottom: 20px;
    }
  }
`;
const ShelfIcon = styled.div`
  display: inline-block;
  padding-left: 2px;
  margin-right: 5px;
  font-size: ${(props) => props.theme.fz4};
  line-height: 20px;
  font-weight: 900;
  text-align: center;
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.theme.greyBlue};
  border-radius: 5px;
  color: #fff;
`;

export default function MemberPageComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [member, setMember] = useState<MemberInfo>({});
  const router = useRouter();
  const { id } = router.query;
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [reading, setReading] = useState<BookInfo[]>([]);
  const [finish, setFinish] = useState<BookInfo[]>([]);
  const [friendState, setFriendState] = useState<string>("");
  const [isFriend, setIsFriend] = useState<boolean>(false);

  useEffect(() => {
    const memberData = async () => {
      if (typeof id === "string") {
        const data = (await getMemberData(id.replace("id:", ""))) as MemberInfo;
        setMember(data);
        if (data && userInfo) {
          const state = await friendStateChecker(data.uid!, userInfo.uid!);
          if (state) {
            if (state.includes("accept")) {
              setIsFriend(true);
            } else if (state.includes("pending")) {
              setFriendState(state);
            }
          }
        }
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
  }, [id, userInfo]);

  return (
    <MemberPage>
      <MemberPageWrap>
        <UserInfoBox>
          {member.img && (
            <UserAvatar
              src={member.img}
              alt="memberAvatar"
              width={100}
              height={100}
            ></UserAvatar>
          )}
          <UserDetail>
            <UserName>{member.name}</UserName>
            <UserIntro>
              {member.intro ? member.intro : "很高興認識大家🤗🤗🤗"}
            </UserIntro>
          </UserDetail>
          <FriendRequestBox>
            {friendState ? (
              friendState.includes("wait") ? (
                <WaitRequest>
                  <FriendStateImg src={wait} alt="Friend" />
                  等待回覆
                </WaitRequest>
              ) : (
                <AcceptRequest
                  onClick={() => {
                    if (member.uid && userInfo.uid) {
                      acceptFriendRequest(userInfo.uid, member.uid);
                      setIsFriend(true);
                      setFriendState("");
                    }
                  }}
                >
                  同意對方邀請
                </AcceptRequest>
              )
            ) : isFriend ? (
              <OtherRequest>
                <FriendStateImg src={isFriendImg} alt="Friend" />
                Friend
              </OtherRequest>
            ) : (
              <SentRequest
                onClick={() => {
                  if (userInfo.uid && member.uid) {
                    sentFriendRequest(userInfo.uid, member.uid);
                    setFriendState("wait");
                  }
                }}
              >
                <FriendStateImg src={addFriendImg} alt="AddFriend" />
                送出好友邀請
              </SentRequest>
            )}
          </FriendRequestBox>
        </UserInfoBox>
        <BookShelfs>
          <BookShelf>
            <ShelfTitle>
              <ShelfIcon>C</ShelfIcon>ollection / 收藏
            </ShelfTitle>
            <Books>
              {books?.map(
                (book) =>
                  book.isbn && (
                    <Book key={book.isbn}>
                      <BookLink href={`/book/id:${book.isbn}`}>
                        <BookImg
                          src={
                            book.smallThumbnail
                              ? book.smallThumbnail
                              : bookcover
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
                        <BookTitle>{book.title}</BookTitle>
                        <br />
                        {book.authors!.length > 0 && (
                          <BookAuthor>{book.authors![0]}</BookAuthor>
                        )}
                      </BookData>
                    </Book>
                  )
              )}
            </Books>
          </BookShelf>
          <BookShelf>
            <ShelfTitle>
              <ShelfIcon>R</ShelfIcon>eading / 閱讀
            </ShelfTitle>
            <Books>
              {reading?.map(
                (book) =>
                  book.isbn && (
                    <Book key={book.isbn}>
                      <BookLink href={`/book/id:${book.isbn}`}>
                        <BookImg
                          src={
                            book.smallThumbnail
                              ? book.smallThumbnail
                              : bookcover
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
                        <BookTitle>{book.title}</BookTitle>
                        <br />
                        {book.authors!.length > 0 && (
                          <BookAuthor>{book.authors![0]}</BookAuthor>
                        )}
                      </BookData>
                    </Book>
                  )
              )}
            </Books>
          </BookShelf>
          <BookShelf>
            <ShelfTitle>
              <ShelfIcon>F</ShelfIcon>inish / 完成
            </ShelfTitle>
            <Books>
              {finish?.map(
                (book) =>
                  book.isbn && (
                    <Book key={book.isbn}>
                      <BookLink href={`/book/id:${book.isbn}`}>
                        <BookImg
                          src={
                            book.smallThumbnail
                              ? book.smallThumbnail
                              : bookcover
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
                        <BookTitle>{book.title}</BookTitle>
                        <br />
                        {book.authors!.length > 0 && (
                          <BookAuthor>{book.authors![0]}</BookAuthor>
                        )}
                      </BookData>
                    </Book>
                  )
              )}
            </Books>
          </BookShelf>
        </BookShelfs>
      </MemberPageWrap>
    </MemberPage>
  );
}
