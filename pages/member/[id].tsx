import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps } from "next/types";
import { ParsedUrlQuery } from "querystring";

import styled from "styled-components";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import { RootState } from "../../store";
import { wait, bookCover, isFriendImg, addFriendImg } from "../../utils/imgs";
import {
  acceptFriendRequest,
  BookInfo,
  friendStateChecker,
  getBookData,
  getMemberData,
  MemberInfo,
  sentFriendRequest,
} from "../../utils/firebaseFuncs";

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
const BookShelves = styled.div`
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 992px) {
    flex-direction: column;
  }
`;
const BookShelf = styled.div`
  display: inline-block;
  width: 30%;
  background-color: ${(props) => props.theme.yellow};
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
  background-color: ${(props) => props.theme.darkYellow};
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
  border-bottom: 1px solid ${(props) => props.theme.grey};
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
const NoImgTitle = styled.p`
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
  color: ${(props) => props.theme.black};
  cursor: pointer;
  border-radius: 20px;
  font-size: ${(props) => props.theme.fz4};
  &:hover {
    background-color: ${(props) => props.theme.darkYellow2};
  }
`;
const SentRequest = styled.button`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border: solid 1px ${(props) => props.theme.grey};
  background-color: ${(props) => props.theme.yellow};
  font-size: ${(props) => props.theme.fz4};
  color: ${(props) => props.theme.black};
  border-radius: 20px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.darkYellow2};
  }
`;
const OtherRequest = styled.div`
  font-size: ${(props) => props.theme.fz4};
  background-color: ${(props) => props.theme.yellow};
  color: ${(props) => props.theme.black};
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border: solid 1px ${(props) => props.theme.grey};
`;
const WaitRequest = styled.div`
  font-size: ${(props) => props.theme.fz4};
  background-color: ${(props) => props.theme.darkYellow};
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
  @media screen and (max-width: 768px) {
    text-align: center;
    margin-left: 0px;
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
  width: 100%;
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
  background-color: ${(props) => props.theme.darkYellow2};
  border-radius: 5px;
  color: ${(props) => props.theme.white};
`;

function BookComponent({ books }: { books: BookInfo[] }) {
  return (
    <>
      {books.map((book) => (
        <Book key={book.isbn}>
          <BookLink href={`/book/id:${book.isbn}`}>
            <BookImg
              src={book.smallThumbnail || bookCover}
              alt={`${book.title}`}
              width={80}
              height={120}
              priority
            ></BookImg>
          </BookLink>
          <BookData>
            {!book.smallThumbnail && <NoImgTitle>{book.title}</NoImgTitle>}
            <BookTitle>{book.title}</BookTitle>
            <br />
            {book.authors!.length > 0 && (
              <BookAuthor>{book.authors![0]}</BookAuthor>
            )}
          </BookData>
        </Book>
      ))}
    </>
  );
}

export default function MemberPageComponent({
  memberData: member,
  finishData: books,
  readingData: reading,
  booksData: finish,
}: {
  memberData: MemberInfo;
  booksData: BookInfo[];
  readingData: BookInfo[];
  finishData: BookInfo[];
}) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const router = useRouter();
  const [friendState, setFriendState] = useState<string>("");
  const [isFriend, setIsFriend] = useState<boolean>(false);
  useEffect(() => {
    const isFriend = async () => {
      if (member && userInfo) {
        const state = await friendStateChecker(member.uid!, userInfo.uid!);
        if (state) {
          if (state.includes("accept")) {
            setIsFriend(true);
          } else if (state.includes("pending")) {
            setFriendState(state);
          }
        }
      }
    };
    isFriend();
  }, [member, userInfo]);

  return (
    <MemberPage>
      <MemberPageWrap>
        <UserInfoBox>
          <UserAvatar
            src={member.img!}
            alt="memberAvatar"
            width={100}
            height={100}
          />
          <UserDetail>
            <UserName>{member.name}</UserName>
            <UserIntro>{member.intro || "很高興認識大家🤗🤗🤗"}</UserIntro>
          </UserDetail>
          <FriendRequestBox>
            {friendState ? (
              friendState.includes("wait") ? (
                <WaitRequest>
                  <FriendStateImg src={wait} alt="Wait" />
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
                  } else {
                    Swal.fire({
                      icon: "info",
                      title: "請先登入喔！",
                      confirmButtonText: "前往登入",
                    }).then((result) => {
                      result.isConfirmed && router.push("/profile");
                    });
                  }
                }}
              >
                <FriendStateImg src={addFriendImg} alt="SentRequest" />
                送出好友邀請
              </SentRequest>
            )}
          </FriendRequestBox>
        </UserInfoBox>
        <BookShelves>
          <BookShelf>
            <ShelfTitle>
              <ShelfIcon>C</ShelfIcon>ollection / 收藏
            </ShelfTitle>
            <Books>
              <BookComponent books={books} />
            </Books>
          </BookShelf>
          <BookShelf>
            <ShelfTitle>
              <ShelfIcon>R</ShelfIcon>eading / 閱讀
            </ShelfTitle>
            <Books>
              <BookComponent books={reading} />
            </Books>
          </BookShelf>
          <BookShelf>
            <ShelfTitle>
              <ShelfIcon>F</ShelfIcon>inish / 完成
            </ShelfTitle>
            <Books>
              <BookComponent books={finish} />
            </Books>
          </BookShelf>
        </BookShelves>
      </MemberPageWrap>
    </MemberPage>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const url = (params as ParsedUrlQuery).id as string;
  const uid = url.split("id:")[1];
  const memberData = (await getMemberData(uid)) as MemberInfo;
  if (memberData) {
    const booksData = await getBookData(memberData.books!);
    const readingData = await getBookData(memberData.reading!);
    const finishData = await getBookData(memberData.finish!);
    return {
      props: { memberData, finishData, readingData, booksData },
    };
  } else {
    return {
      notFound: true,
    };
  }
};
