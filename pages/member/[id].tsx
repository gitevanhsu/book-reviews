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
  width: 100vw;
  height: 100%;
  min-height: calc(100vh - 60px);
  position: relative;
  background-color: ${(props) => props.theme.white};
`;
const MemberPageWrap = styled.div`
  height: 100%;
  padding: 50px 30px;
  max-width: 1280px;
  margin: 0 auto;
`;
const BookShelfs = styled.div`
  display: flex;
  justify-content: space-around;
  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
`;
const BookShelf = styled.div`
  display: inline-block;
  width: 30%;
  border: solid 5px ${(props) => props.theme.grey};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  height: 520px;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none;
  }
  @media screen and (max-width: 768px) {
    width: 100%;
    height: 350px;
    margin-bottom: 40px;
  }
`;
const ShelfTitle = styled.h2`
  text-align: center;
  position: sticky;
  top: 0;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.yellow};
  font-size: ${(props) => props.theme.fz * 1.5}px;
  letter-spacing: 2px;
  padding: 10px;
  z-index: 1;
  box-shadow: 2px 0px 5px ${(props) => props.theme.black};
`;
const Books = styled.div`
  min-height: 450px;
  padding: 15px 15px;
  @media screen and (max-width: 768px) {
    min-height: 250px;
  }
`;
const Book = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  border-bottom: 5px double #875303;
  padding-bottom: 1px;
  margin-bottom: 10px;
`;
const BookImg = styled(Image)`
  box-shadow: 0px 0px 5px ${(props) => props.theme.black};
`;
const BookLink = styled(Link)`
  display: inline-block;
`;
const BookTitle = styled.h3``;
const BookData = styled.div`
  margin: 0 10px;
`;
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

const FriendStateImg = styled(Image)`
  width: 30px;
  height: 30px;
  margin-right: 10px;
`;

const FriendRequestBox = styled.div`
  padding: 5px 10px;
  @media screen and (max-width: 768px) {
    margin-top: 40px;
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
  margin-left: 30px;
`;
const UserName = styled.h2`
  font-size: ${(props) => props.theme.fz * 2}px;
  margin-bottom: 10px;
  letter-spacing: 2px;
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 1.5}px;
  }
`;
const UserAvatar = styled(Image)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;
const UserIntro = styled.p`
  font-size: ${(props) => props.theme.fz * 1.5}px;
  letter-spacing: 2px;
  white-space: pre-wrap;
  width: 300px;
  border-top: 1px solid ${(props) => props.theme.grey};
  margin-top: 10px;
  padding-top: 10px;
  max-height: 150px;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none;
  }
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 1}px;
  }
`;

const UserInfoBox = styled.div`
  position: relative;
  margin: 0 auto;
  width: 60%;
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
    console.log("effect!");
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
            <ShelfTitle>已收藏</ShelfTitle>
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
      </MemberPageWrap>
    </MemberPage>
  );
}
