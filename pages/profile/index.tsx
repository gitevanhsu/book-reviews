import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import {
  emailSignUp,
  emailSignIn,
  signout,
  BookInfo,
  getBookDatas,
  removeBook,
  db,
  MemberInfo,
  updateBooks,
  getMemberData,
  editMemberInfo,
} from "../../utils/firebaseFuncs";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useDispatch } from "react-redux";
import { userSignOut } from "../../slices/userInfoSlice";
import FriendsListComponent from "../../components/friendList";
import bookcover from "/public/img/bookcover.jpeg";
import x from "/public/img/VectorX.png";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import SignupComponent from "../../components/signup";
import Portal from "../../components/portal";

const InputArea = styled.div``;
const Inputbox = styled.div``;
const InputTitle = styled.p``;
const InputContent = styled.input``;
const SubmitButton = styled.button`
  padding: 10px 20px;
  border: solid 1px;
  cursor: pointer;
`;
const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #00000050;
`;

function SigninComponent() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showSignup, setSignUp] = useState(false);
  const signin = () => {
    if (emailRef.current && passwordRef.current) {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      email && password && emailSignIn(email, password);
      emailRef.current.value = "";
      passwordRef.current.value = "";
    }
  };
  return (
    <>
      <InputArea>
        <Inputbox>
          <InputTitle>Email: </InputTitle>
          <InputContent
            key="signInEmail"
            ref={emailRef}
            type="email"
          ></InputContent>
        </Inputbox>
        <Inputbox>
          <InputTitle>Password: </InputTitle>
          <InputContent
            key="signInPassword"
            ref={passwordRef}
            type="password"
          ></InputContent>
        </Inputbox>
        <SubmitButton onClick={signin}>登入</SubmitButton>
        <SubmitButton onClick={() => setSignUp(true)}>註冊</SubmitButton>
      </InputArea>
      {showSignup && (
        <Portal>
          <Overlay onClick={() => setSignUp(false)} />
          <SignupComponent />
        </Portal>
      )}
    </>
  );
}
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
const RemoveBtn = styled(Image)`
  background-color: #f00;
  padding: 3px;
  margin-left: auto;
  cursor: pointer;
`;
const UserAvatar = styled(Image)``;

const EditBox = styled.div``;
const UserTitle = styled.h1``;
const TitleInput = styled.input``;
const UserIntro = styled.p``;
const IntroTextarea = styled.textarea``;

function BookShelfComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [reading, setReading] = useState<BookInfo[]>([]);
  const [finish, setFinish] = useState<BookInfo[]>([]);
  useEffect(() => {
    const getBooks = async () => {
      if (userInfo.uid) {
        const memberData = (await getMemberData(userInfo.uid)) as MemberInfo;
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
  }, [userInfo.uid]);

  const onDragEnd = async (event: DropResult) => {
    const { source, destination, draggableId: isbn } = event;
    if (!destination) {
      return;
    }
    const from = source.droppableId;
    const fromIndex = source.index;
    const to = destination.droppableId;
    const toIndex = destination.index;
    const newBooks = [...books];
    const newReading = [...reading];
    const newFinish = [...finish];
    let remove;
    if (from === "books") {
      [remove] = newBooks.splice(fromIndex, 1);
    } else if (from === "reading") {
      [remove] = newReading.splice(fromIndex, 1);
    } else if (from === "finish") {
      [remove] = newFinish.splice(fromIndex, 1);
    }
    if (remove && to === "books") {
      newBooks.splice(toIndex, 0, remove);
    } else if (remove && to === "reading") {
      newReading.splice(toIndex, 0, remove);
    } else if (remove && to === "finish") {
      newFinish.splice(toIndex, 0, remove);
    }
    setBooks(newBooks);
    setReading(newReading);
    setFinish(newFinish);
    userInfo.uid &&
      updateBooks({ newBooks, newReading, newFinish }, userInfo.uid);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <BookShelfs>
        <BookShelf>
          <ShelfTitle>已收藏</ShelfTitle>
          <Droppable droppableId="books">
            {(provided) => (
              <Books ref={provided.innerRef} {...provided.droppableProps}>
                {books?.map(
                  (book, index) =>
                    book.isbn && (
                      <Draggable
                        draggableId={book.isbn}
                        index={index}
                        key={book.isbn}
                      >
                        {(provided) => (
                          <Book
                            key={book.isbn}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
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
                                <BookAuthor>
                                  作者：{book.authors![0]}
                                </BookAuthor>
                              )}
                            </BookData>
                            <RemoveBtn
                              src={x}
                              alt="delete"
                              width={20}
                              height={20}
                              onClick={() => {
                                if (book.isbn && books) {
                                  setBooks((prev) =>
                                    prev.filter(
                                      (bookinfo) => bookinfo.isbn !== book.isbn
                                    )
                                  );
                                  removeBook(book.isbn, userInfo.uid!, "books");
                                }
                              }}
                            />
                          </Book>
                        )}
                      </Draggable>
                    )
                )}
                {provided.placeholder}
              </Books>
            )}
          </Droppable>
        </BookShelf>

        <BookShelf>
          <ShelfTitle>閱讀中</ShelfTitle>
          <Droppable droppableId="reading">
            {(provided) => (
              <Books ref={provided.innerRef} {...provided.droppableProps}>
                {reading?.map(
                  (book, index) =>
                    book.isbn && (
                      <Draggable
                        draggableId={book.isbn}
                        index={index}
                        key={book.isbn}
                      >
                        {(provided) => (
                          <Book
                            key={book.isbn}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
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
                                <BookAuthor>
                                  作者：{book.authors![0]}
                                </BookAuthor>
                              )}
                            </BookData>
                            <RemoveBtn
                              src={x}
                              alt="delete"
                              width={20}
                              height={20}
                              onClick={() => {
                                if (book.isbn && books) {
                                  setReading((prev) =>
                                    prev.filter(
                                      (bookinfo) => bookinfo.isbn !== book.isbn
                                    )
                                  );
                                  removeBook(book.isbn, userInfo.uid!, "books");
                                }
                              }}
                            />
                          </Book>
                        )}
                      </Draggable>
                    )
                )}
                {provided.placeholder}
              </Books>
            )}
          </Droppable>
        </BookShelf>
        <BookShelf>
          <ShelfTitle>已閱讀完</ShelfTitle>
          <Droppable droppableId="finish">
            {(provided) => (
              <Books ref={provided.innerRef} {...provided.droppableProps}>
                {finish?.map(
                  (book, index) =>
                    book.isbn && (
                      <Draggable
                        draggableId={book.isbn}
                        index={index}
                        key={book.isbn}
                      >
                        {(provided) => (
                          <Book
                            key={book.isbn}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
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
                                <BookAuthor>
                                  作者：{book.authors![0]}
                                </BookAuthor>
                              )}
                            </BookData>
                            <RemoveBtn
                              src={x}
                              alt="delete"
                              width={20}
                              height={20}
                              onClick={() => {
                                if (book.isbn && books) {
                                  setFinish((prev) =>
                                    prev.filter(
                                      (bookinfo) => bookinfo.isbn !== book.isbn
                                    )
                                  );
                                  removeBook(book.isbn, userInfo.uid!, "books");
                                }
                              }}
                            />
                          </Book>
                        )}
                      </Draggable>
                    )
                )}
                {provided.placeholder}
              </Books>
            )}
          </Droppable>
        </BookShelf>
      </BookShelfs>
    </DragDropContext>
  );
}

export default function Profile() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [edit, setEdit] = useState(false);
  const dispatch = useDispatch();
  const editNameRef = useRef<HTMLInputElement>(null);
  const editIntroRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      {userInfo.isSignIn ? (
        <>
          <UserAvatar
            src={userInfo.img!}
            alt="memberAvatar"
            width={50}
            height={50}
          ></UserAvatar>
          <p>{userInfo.uid}</p>
          <p>{userInfo.name}</p>
          <p>{userInfo.email}</p>
          <p>{userInfo.intro ? userInfo.intro : "這個人沒有填寫自我介紹 :("}</p>
          <SubmitButton
            onClick={() => {
              signout();
              dispatch(
                userSignOut({ uid: "", name: "", email: "", intro: "" })
              );
            }}
          >
            登出
          </SubmitButton>
          <SubmitButton
            onClick={() => {
              setEdit(true);
            }}
          >
            編輯資訊
          </SubmitButton>
          {edit && (
            <EditBox>
              <UserTitle>用戶名稱</UserTitle>
              <TitleInput ref={editNameRef} defaultValue={userInfo.name} />
              <UserIntro>自我介紹</UserIntro>
              <IntroTextarea ref={editIntroRef} defaultValue={userInfo.intro} />
              <SubmitButton
                onClick={() => {
                  setEdit(false);
                }}
              >
                取消編輯
              </SubmitButton>
              <SubmitButton
                onClick={() => {
                  if (
                    editNameRef &&
                    editNameRef.current &&
                    editIntroRef &&
                    editIntroRef.current
                  ) {
                    editMemberInfo(
                      userInfo,
                      editNameRef.current.value,
                      editIntroRef.current.value,
                      dispatch
                    );
                    setEdit(false);
                  }
                }}
              >
                送出
              </SubmitButton>
            </EditBox>
          )}
          <FriendsListComponent />
          <BookShelfComponent />
        </>
      ) : (
        <>
          <SigninComponent />
        </>
      )}
    </>
  );
}
