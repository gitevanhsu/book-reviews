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
} from "../../utils/firebaseFuncs";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useDispatch } from "react-redux";
import { userSignOut } from "../../slices/userInfoSlice";
import FriendsListComponent from "../../components/friendList";
import bookcover from "/public/img/bookcover.jpeg";
import x from "/public/img/VectorX.png";
import { doc, onSnapshot } from "firebase/firestore";
const InputArea = styled.div``;
const Inputbox = styled.div``;
const InputTitle = styled.p``;
const InputContent = styled.input``;
const SubmitButton = styled.button`
  padding: 10px 20px;
  border: solid 1px;
  cursor: pointer;
`;

function SignupComponent() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const introRef = useRef<HTMLInputElement>(null);

  const signup = () => {
    if (
      nameRef.current &&
      emailRef.current &&
      passwordRef.current &&
      introRef.current
    ) {
      const name = nameRef.current.value;
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      const intro = introRef.current.value;

      name && email && password && emailSignUp(name, email, password, intro);
      nameRef.current.value = "";
      emailRef.current.value = "";
      passwordRef.current.value = "";
      introRef.current.value = "";
    }
  };

  return (
    <>
      <InputArea>
        <Inputbox>
          <InputTitle>Name: </InputTitle>
          <InputContent
            key="signUpName"
            ref={nameRef}
            type="text"
          ></InputContent>
        </Inputbox>
        <Inputbox>
          <InputTitle>Email: </InputTitle>
          <InputContent
            key="signUpEmail"
            ref={emailRef}
            type="email"
          ></InputContent>
        </Inputbox>
        <Inputbox>
          <InputTitle>Password: </InputTitle>
          <InputContent
            key="signUpPassword"
            ref={passwordRef}
            type="password"
          ></InputContent>
        </Inputbox>
        <Inputbox>
          <InputTitle>自我介紹: </InputTitle>
          <InputContent
            key="signUpIntro"
            ref={introRef}
            type="text"
          ></InputContent>
        </Inputbox>
        <SubmitButton onClick={signup}>註冊</SubmitButton>
      </InputArea>
    </>
  );
}
function SigninComponent() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

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
      </InputArea>
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
const Books = styled.div``;
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

function BookShelfComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [books, setBooks] = useState<BookInfo[]>();
  const [reading, setReading] = useState<BookInfo[]>();
  const [finish, setFinish] = useState<BookInfo[]>();
  useEffect(() => {
    let unsub: Function;
    const getBooks = async () => {
      if (userInfo.uid) {
        unsub = onSnapshot(doc(db, "members", userInfo.uid), async (doc) => {
          const memberData = doc.data() as MemberInfo;
          if (memberData.books) {
            const datas = await getBookDatas(memberData.books);
            datas.length > 0 && setBooks(datas as BookInfo[]);
          }
          if (memberData.reading) {
            const datas = await getBookDatas(memberData.reading);
            datas.length > 0 && setBooks(datas as BookInfo[]);
          }

          if (memberData.finish) {
            const datas = await getBookDatas(memberData.finish);
            datas.length > 0 && setBooks(datas as BookInfo[]);
          }
        });
      }
    };
    getBooks();
    return () => {
      unsub && unsub();
    };
  }, [userInfo.books, userInfo.finish, userInfo.reading, userInfo.uid]);
  return (
    <BookShelfs>
      <BookShelf>
        <ShelfTitle>已收藏</ShelfTitle>
        <Books>
          {books?.map((book) => (
            <Book key={book.isbn}>
              <BookLink href={`/book/id:${book.isbn}`}>
                <BookImg
                  src={book.smallThumbnail ? book.smallThumbnail : bookcover}
                  alt={`${book.title}`}
                  width={80}
                  height={120}
                  priority
                ></BookImg>
              </BookLink>
              <BookData>
                {!book.smallThumbnail && <NoimgTitle>{book.title}</NoimgTitle>}
                <BookTitle>書名：{book.title}</BookTitle>
                <br />
                {book.authors!.length > 0 && (
                  <BookAuthor>作者：{book.authors![0]}</BookAuthor>
                )}
              </BookData>
              <RemoveBtn
                src={x}
                alt="delete"
                width={20}
                height={20}
                onClick={() => {
                  if (book.isbn && books) {
                    removeBook(book.isbn, userInfo.uid!, "books");
                  }
                }}
              />
            </Book>
          ))}
        </Books>
      </BookShelf>
      <BookShelf>
        <ShelfTitle>閱讀中</ShelfTitle>
        <Books></Books>
      </BookShelf>
      <BookShelf>
        <ShelfTitle>已閱讀完</ShelfTitle>
        <Books></Books>
      </BookShelf>
    </BookShelfs>
  );
}

export default function Profile() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const dispatch = useDispatch();
  return (
    <>
      {userInfo.isSignIn && (
        <>
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
        </>
      )}
      <SignupComponent />
      <SigninComponent />
      <FriendsListComponent />
      <BookShelfComponent />
    </>
  );
}
