import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import {
  emailSignIn,
  signout,
  BookInfo,
  getBookDatas,
  removeBook,
  MemberInfo,
  updateBooks,
  getMemberData,
  editMemberInfo,
  emailSignUp,
} from "../../utils/firebaseFuncs";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useDispatch } from "react-redux";
import { userSignOut } from "../../slices/userInfoSlice";
import bookcover from "/public/img/bookcover.jpeg";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import male from "/public/img/reading-male.png";
import male2 from "/public/img/reading-male2.png";
import female from "/public/img/reading-female.png";
import female2 from "/public/img/reading-female2.png";
import books from "/public/img/book-stack.png";
import kid from "/public/img/reading-kid.png";
import pen from "/public/img/pen.svg";
import signOut from "/public/img/sign-out.svg";
import produce from "immer";
import library from "/public/img/library.jpg";
import Swal from "sweetalert2";

const InputTitle = styled.p`
  font-size: ${(props) => props.theme.fz3};
`;
const InputContent = styled.input`
  &[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  &[type="radio"] + img {
    margin: 10px 15px;
    cursor: pointer;
    outline: 4px solid ${(props) => props.theme.grey};
  }
  &[type="radio"]:checked + img {
    outline: 4px solid ${(props) => props.theme.red};
  }
`;
const Inputbox = styled.div`
  margin: 0 auto;
  @media screen and (max-width: 440px) {
    & > br {
      display: none;
    }
  }
`;
const SignArea = styled.div`
  margin-top: 50px;
  & > ${Inputbox} {
    display: flex;
    width: 300px;
    margin: 0 auto;
    margin-bottom: 30px;
    align-items: center;
    justify-content: center;
    & > ${InputTitle} {
      padding: 0;
      width: 120px;
      @media screen and (max-width: 480px) {
        width: 80px;
        font-size: ${(props) => props.theme.fz4};
      }
    }
    & > ${InputContent} {
      padding: 5px 10px;
      border: none;
      outline: none;
      background-color: transparent;
      border-bottom: 2px solid ${(props) => props.theme.greyBlue};
      font-size: ${(props) => props.theme.fz4};
    }
  }
`;
const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200%;
  background-color: #000000;
  opacity: 0.5;
  z-index: 5;
`;
const SubmitButton = styled.button`
  width: 100px;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 20px;
  margin: 10px 0;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.yellow};
  font-size: ${(props) => props.theme.fz4};
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
  }
`;
const SignInBtnBox = styled.div`
  text-align: center;
`;

const QuoteArea = styled.div`
  width: 100%;
  padding: 100px 0;
`;
const QuoteImg = styled(Image)`
  position: absolute;
  left: 0;
  opacity: 0.7;
  width: 100%;
  height: auto;
`;

const SignUpArea = styled.div`
  margin: 0 auto;
  text-align: center;
  padding: 10px 20px;
  z-index: 6;
  width: 480px;
  background-color: ${(props) => props.theme.white};
  @media screen and (max-width: 576px) {
    width: 300px;
  }
`;
const SignupInputbox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
`;
const SignupInputTitle = styled.h4`
  width: 140px;
  text-align: start;
  font-size: ${(props) => props.theme.fz4};
  line-height: ${(props) => props.theme.fz4};
`;
const SignupIntrobox = styled(SignupInputbox)`
  flex-wrap: wrap;
  text-align: center;
  & > ${SignupInputTitle} {
    text-align: center;
    margin-top: 20px;
    width: 100%;
  }
`;
const SignupInputContent = styled.input`
  outline: none;
  border: none;
  padding: 5px 10px;
  font-size: ${(props) => props.theme.fz4};
  border-bottom: 2px solid ${(props) => props.theme.greyBlue};
  width: 100%;
  background-color: ${(props) => props.theme.white};
  @media screen (max-width: 576px) {
    margin-top: 5px;
  }
  &[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  &[type="radio"] + img {
    cursor: pointer;
    outline: 2px solid ${(props) => props.theme.grey};
    margin: 10px 10px;
  }
  &[type="radio"]:checked + img {
    outline: 2px solid ${(props) => props.theme.red};
  }
`;
const SignupInputTextArea = styled.textarea`
  font-family: Arial;
  border: 1px solid ${(props) => props.theme.black};
  border-radius: 5px;
  background-color: ${(props) => props.theme.white};
  padding: 5px 10px;
  width: 100%;
  height: 80px;
  margin-top: 10px;
  @media screen (max-width: 576px) {
    height: 50px;
  }
`;

const SignupSubmitButton = styled.button`
  width: 100px;
  padding: 5px 10px;
  margin: 10px 0;
  cursor: pointer;
  font-size: ${(props) => props.theme.fz4};
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.yellow};
  border-radius: 20px;
  @media screen (max-width: 576px) {
    padding: 5px 10px;
  }
`;

const SignupLabel = styled.label``;
const SignupUserAvatar = styled(Image)`
  border-radius: 50%;
`;
function SignupComponent({ setSignUp }: { setSignUp: Function }) {
  const signupNameRef = useRef<HTMLInputElement>(null);
  const signupEmailRef = useRef<HTMLInputElement>(null);
  const signPasswordRef = useRef<HTMLInputElement>(null);
  const signupIntroRef = useRef<HTMLTextAreaElement>(null);
  const [avatar, setAvatar] = useState("books");

  const isRadioSelect = (value: string): boolean => avatar === value;
  const avatarSelector = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setAvatar(e.currentTarget.value);
  const signup = () => {
    if (
      signupNameRef.current &&
      signupEmailRef.current &&
      signPasswordRef.current &&
      signupIntroRef.current
    ) {
      const name = signupNameRef.current.value;
      const email = signupEmailRef.current.value;
      const password = signPasswordRef.current.value;
      const intro = signupIntroRef.current.value;
      if (
        password.trim().length < 6 ||
        name.trim().length === 0 ||
        email.trim().length === 0
      ) {
        Swal.fire({
          icon: "warning",
          title: "請輸入正確資訊",
          text: "密碼至少六個字喔",
        });
      } else if (avatar === "books") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/book-stack.png?alt=media&token=16d3a52f-862d-4908-977f-68f7f8af783a";
        emailSignUp(name, email, password, intro, img);
      } else if (avatar === "male") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-male.png?alt=media&token=4966e0d4-b850-4c33-a3eb-88f2a9d9238b";
        emailSignUp(name, email, password, intro, img);
      } else if (avatar === "male2") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-male2.png?alt=media&token=225beacb-0954-4f29-849e-1cdaa4fb359b";
        emailSignUp(name, email, password, intro, img);
      } else if (avatar === "female") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-female.png?alt=media&token=cd1fbeef-0d9e-4d34-9217-0c0921e24bd6";
        emailSignUp(name, email, password, intro, img);
      } else if (avatar === "female2") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-female2.png?alt=media&token=26bba03e-f92f-4068-b2ba-8dfc56313553";
        emailSignUp(name, email, password, intro, img);
      } else if (avatar === "kid") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-kid.png?alt=media&token=6ad7ec20-5fc7-4076-8972-52ca4c6b3bfa";
        emailSignUp(name, email, password, intro, img);
      } else if (avatar === "books") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/book-stack.png?alt=media&token=16d3a52f-862d-4908-977f-68f7f8af783a";
        emailSignUp(name, email, password, intro, img);
      }

      signupNameRef.current.value = "";
      signupEmailRef.current.value = "";
      signPasswordRef.current.value = "";
      signupIntroRef.current.value = "";
    }
  };

  return (
    <SignUpArea>
      <SignupInputbox>
        <SignupInputTitle>名字: </SignupInputTitle>
        <SignupInputContent
          key="signUpName"
          ref={signupNameRef}
          type="text"
        ></SignupInputContent>
      </SignupInputbox>
      <SignupInputbox>
        <SignupInputTitle>Email: </SignupInputTitle>
        <SignupInputContent
          key="signUpEmail"
          ref={signupEmailRef}
          type="email"
        ></SignupInputContent>
      </SignupInputbox>
      <SignupInputbox>
        <SignupInputTitle>密碼: </SignupInputTitle>
        <SignupInputContent
          key="signUpPassword"
          ref={signPasswordRef}
          type="password"
        ></SignupInputContent>
      </SignupInputbox>
      <SignupIntrobox>
        <SignupInputTitle>自我介紹: </SignupInputTitle>
        <SignupInputTextArea
          key="signUpIntro"
          ref={signupIntroRef}
        ></SignupInputTextArea>
      </SignupIntrobox>
      <SignupIntrobox>
        <SignupInputTitle>選擇您喜歡的頭像</SignupInputTitle>
        <SignupLabel>
          <SignupInputContent
            type="radio"
            name="avatar"
            value="male"
            checked={isRadioSelect("male")}
            onChange={avatarSelector}
          />
          <SignupUserAvatar
            src={male}
            alt="maleAvatar"
            width={50}
            height={50}
          />
        </SignupLabel>
        <SignupLabel>
          <SignupInputContent
            type="radio"
            name="avatar"
            value="male2"
            checked={isRadioSelect("male2")}
            onChange={avatarSelector}
          />
          <SignupUserAvatar
            src={male2}
            alt="maleAvatar2"
            width={50}
            height={50}
          />
        </SignupLabel>
        <SignupLabel>
          <SignupInputContent
            type="radio"
            name="avatar"
            value="female"
            checked={isRadioSelect("female")}
            onChange={avatarSelector}
          />
          <SignupUserAvatar
            src={female}
            alt="femaleAvatar"
            width={50}
            height={50}
          />
        </SignupLabel>
        <SignupLabel>
          <SignupInputContent
            type="radio"
            name="avatar"
            value="female2"
            checked={isRadioSelect("female2")}
            onChange={avatarSelector}
          />
          <SignupUserAvatar
            src={female2}
            alt="femaleAvatar2"
            width={50}
            height={50}
          />
        </SignupLabel>
        <SignupLabel>
          <SignupInputContent
            type="radio"
            name="avatar"
            value="kid"
            checked={isRadioSelect("kid")}
            onChange={avatarSelector}
          />
          <SignupUserAvatar
            src={kid}
            alt="femaleAvatar2"
            width={50}
            height={50}
          />
        </SignupLabel>
        <SignupLabel>
          <SignupInputContent
            type="radio"
            name="avatar"
            value="books"
            checked={isRadioSelect("books")}
            onChange={avatarSelector}
          />
          <SignupUserAvatar src={books} alt="upload" width={50} height={50} />
        </SignupLabel>
      </SignupIntrobox>
      <SignupSubmitButton
        onClick={() => {
          signup();
        }}
      >
        註冊
      </SignupSubmitButton>{" "}
      <br />
      <SignupSubmitButton
        onClick={() => {
          setSignUp(false);
        }}
      >
        返回登入
      </SignupSubmitButton>
    </SignUpArea>
  );
}

function SigninComponent() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showSignup, setSignUp] = useState(false);
  const signin = () => {
    if (
      emailRef.current &&
      passwordRef.current &&
      (emailRef.current.value.trim().length === 0 ||
        passwordRef.current.value.trim().length < 6)
    ) {
      Swal.fire({
        icon: "warning",
        title: "請輸入正確 email & password",
        text: "密碼至少六個字喔",
      });
    } else if (emailRef.current && passwordRef.current) {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      email && password && emailSignIn(email, password);
      emailRef.current.value = "";
      passwordRef.current.value = "";
      Swal.fire({
        icon: "success",
        title: "登入成功！",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };
  return (
    <>
      {showSignup ? (
        <SignupComponent setSignUp={setSignUp} />
      ) : (
        <>
          <SignArea>
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
          </SignArea>
          <SignInBtnBox>
            <SubmitButton onClick={signin}>登入</SubmitButton>
            <br />
            <SubmitButton onClick={() => setSignUp(true)}>
              馬上註冊
            </SubmitButton>
          </SignInBtnBox>
        </>
      )}
      <QuoteArea>
        <QuoteImg src={library} alt="Library" priority />
      </QuoteArea>
    </>
  );
}

const MoveBook = styled.div`
  font-size: ${(props) => props.theme.fz3};
  line-height: 20px;
  font-weight: 900;
  text-align: center;
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.theme.greyBlue};
  color: ${(props) => props.theme.white};
  border-radius: 5px;
  cursor: pointer;
  & + & {
    margin-top: 5px;
  }
`;

const MobileRemove = styled(MoveBook)`
  background-color: ${(props) => props.theme.red};
`;
const DeskRemove = styled(MobileRemove)`
  display: none;
  margin-left: auto;
`;

const BookShelfs = styled.div`
  display: flex;
  justify-content: space-around;
  @media screen and (max-width: 992px) {
    display: none;
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
`;
const Book = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  border-bottom: 1px solid #efc991;
  padding-bottom: 5px;
  margin-bottom: 10px;
  &:hover > ${DeskRemove} {
    display: block;
  }
`;
const BookImg = styled(Image)`
  box-shadow: 0px 0px 5px ${(props) => props.theme.black};
  margin-right: 10px;
`;
const BookLink = styled(Link)`
  display: inline-block;
`;
const BookData = styled.div``;
const BookTitle = styled.h3`
  font-size: ${(props) => props.theme.fz4};
  font-weight: 600;
`;
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

const UserAvatar = styled(Image)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;
const ProfilePage = styled.main`
  overflow: hidden;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 60px);
  position: relative;
  background-color: ${(props) => props.theme.white};
`;
const ProfilePageWrap = styled.div`
  height: 100%;
  padding: 50px 15px;
  max-width: 1280px;
  margin: 0 auto;
`;
const EditBox = styled.div`
  padding: 10px 20px;
  border-radius: 20px;
  width: 100%;
  background-color: ${(props) => props.theme.white};
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%);
  text-align: center;
  z-index: 5;
  & ${UserAvatar} {
    @media screen and (max-width: 768px) {
      width: 45px;
      height: 45px;
    }
  }
  @media screen and (max-width: 480px) {
    & > ${InputContent} {
      width: 200px;
    }
  }
`;

const EditBoxDetail = styled.div`
  font-size: ${(props) => props.theme.fz4};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz4};
  }
`;
const EditTitle = styled.h4`
  margin: 10px 0;
  min-width: 100px;
`;

const TitleInput = styled.input`
  width: 300px;
  padding: 5px 10px;
  @media screen and (max-width: 480px) {
    width: 200px;
  }
`;
const IntroTextarea = styled.textarea`
  padding: 5px 10px;
  width: 300px;
  height: 100px;
  @media screen and (max-width: 480px) {
    width: 200px;
  }
`;

const EditButtonBox = styled.div`
  display: flex;
  justify-content: center;
  & > ${SubmitButton} {
    margin: 20px 10px;
  }
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
const Label = styled.label``;
const ButtonBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: auto;
  @media screen and (max-width: 768px) {
    margin-left: 0;
    flex-direction: row;
    margin-top: 20px;
  }
`;
const BtnImg = styled(Image)`
  margin-right: 10px;
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

interface MobileProps {
  userInfo: MemberInfo;
  books: BookInfo[];
  reading: BookInfo[];
  finish: BookInfo[];
  setBooks: Function;
  setReading: Function;
  setFinish: Function;
}
interface MobileFuncProps {
  books: {
    [books: string]: BookInfo[];
    reading: BookInfo[];
    finish: BookInfo[];
  };
  index: number;
  from: string;
  to: string;
}
const MobileBookShelfs = styled(BookShelfs)`
  display: none;
  flex-direction: column;
  & > ${BookShelf} {
    width: 100%;
    height: 300px;
    margin-bottom: 40px;
  }
  & ${ShelfTitle} {
    font-size: ${(props) => props.theme.fz4};
  }

  & ${Books} {
    min-height: 250px;
  }

  @media screen and (max-width: 992px) {
    display: flex;
  }
`;
const MobileBtnBox = styled.div`
  margin-left: auto;
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

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  width: 100px;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 20px;
  margin: 10px 0;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.yellow};
  font-size: ${(props) => props.theme.fz5};
  @media screen and (max-width: 768px) {
    & + & {
      margin-left: 20px;
    }
  }
`;

function MobileBookShelfComponent({
  userInfo,
  books,
  reading,
  finish,
  setBooks,
  setReading,
  setFinish,
}: MobileProps) {
  const UpdateBooks = (data: MobileFuncProps) => {
    const newData = produce(data, (draft) => {
      draft.books[draft.to].push(draft.books[draft.from][draft.index]);
      draft.books[draft.from] = draft.books[draft.from].filter(
        (_, index) => index !== draft.index
      );
    });
    const newBooks = newData.books.books;
    const newReading = newData.books.reading;
    const newFinish = newData.books.finish;
    setBooks(newBooks);
    setReading(newReading);
    setFinish(newFinish);
    userInfo.uid &&
      updateBooks({ newBooks, newReading, newFinish }, userInfo.uid);
  };

  return (
    <>
      <MobileBookShelfs>
        <BookShelf>
          <ShelfTitle>
            <ShelfIcon>C</ShelfIcon>ollection / 收藏
          </ShelfTitle>
          <Books>
            {books?.map((book, index) => (
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
                  {!book.smallThumbnail && (
                    <NoimgTitle>{book.title}</NoimgTitle>
                  )}
                  <BookTitle>{book.title}</BookTitle>
                  <br />
                  {book.authors!.length > 0 && (
                    <BookAuthor>{book.authors![0]}</BookAuthor>
                  )}
                </BookData>
                <MobileBtnBox>
                  <MobileRemove
                    onClick={() => {
                      if (book.isbn && books) {
                        setBooks((prev: BookInfo[]) =>
                          prev.filter((bookinfo) => bookinfo.isbn !== book.isbn)
                        );
                        removeBook(book.isbn, userInfo.uid!, "books");
                      }
                    }}
                  >
                    X
                  </MobileRemove>
                  <MoveBook
                    onClick={() => {
                      UpdateBooks({
                        books: { books, reading, finish },
                        index,
                        from: "books",
                        to: "reading",
                      });
                    }}
                  >
                    R
                  </MoveBook>
                  <MoveBook
                    onClick={() => {
                      UpdateBooks({
                        books: { books, reading, finish },
                        index,
                        from: "books",
                        to: "finish",
                      });
                    }}
                  >
                    F
                  </MoveBook>
                </MobileBtnBox>
              </Book>
            ))}
          </Books>
        </BookShelf>
        <BookShelf>
          <ShelfTitle>
            <ShelfIcon>R</ShelfIcon>eading / 閱讀
          </ShelfTitle>
          <Books>
            {reading?.map((book, index) => (
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
                  {!book.smallThumbnail && (
                    <NoimgTitle>{book.title}</NoimgTitle>
                  )}
                  <BookTitle>{book.title}</BookTitle>
                  <br />
                  {book.authors!.length > 0 && (
                    <BookAuthor>{book.authors![0]}</BookAuthor>
                  )}
                </BookData>
                <MobileBtnBox>
                  <MobileRemove
                    onClick={() => {
                      if (book.isbn && books) {
                        setBooks((prev: BookInfo[]) =>
                          prev.filter((bookinfo) => bookinfo.isbn !== book.isbn)
                        );
                        removeBook(book.isbn, userInfo.uid!, "books");
                      }
                    }}
                  >
                    X
                  </MobileRemove>
                  <MoveBook
                    onClick={() => {
                      UpdateBooks({
                        books: { books, reading, finish },
                        index,
                        from: "reading",
                        to: "books",
                      });
                    }}
                  >
                    C
                  </MoveBook>
                  <MoveBook
                    onClick={() => {
                      UpdateBooks({
                        books: { books, reading, finish },
                        index,
                        from: "reading",
                        to: "finish",
                      });
                    }}
                  >
                    F
                  </MoveBook>
                </MobileBtnBox>
              </Book>
            ))}
          </Books>
        </BookShelf>
        <BookShelf>
          <ShelfTitle>
            <ShelfIcon>F</ShelfIcon>inish / 完成
          </ShelfTitle>
          <Books>
            {finish?.map((book, index) => (
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
                  {!book.smallThumbnail && (
                    <NoimgTitle>{book.title}</NoimgTitle>
                  )}
                  <BookTitle>{book.title}</BookTitle>
                  <br />
                  {book.authors!.length > 0 && (
                    <BookAuthor>{book.authors![0]}</BookAuthor>
                  )}
                </BookData>
                <MobileBtnBox>
                  <MobileRemove
                    onClick={() => {
                      if (book.isbn && books) {
                        setBooks((prev: BookInfo[]) =>
                          prev.filter((bookinfo) => bookinfo.isbn !== book.isbn)
                        );
                        removeBook(book.isbn, userInfo.uid!, "books");
                      }
                    }}
                  >
                    X
                  </MobileRemove>
                  <MoveBook
                    onClick={() => {
                      UpdateBooks({
                        books: { books, reading, finish },
                        index,
                        from: "finish",
                        to: "books",
                      });
                    }}
                  >
                    C
                  </MoveBook>
                  <MoveBook
                    onClick={() => {
                      UpdateBooks({
                        books: { books, reading, finish },
                        index,
                        from: "finish",
                        to: "reading",
                      });
                    }}
                  >
                    R
                  </MoveBook>
                </MobileBtnBox>
              </Book>
            ))}
          </Books>
        </BookShelf>
      </MobileBookShelfs>
    </>
  );
}

function BookShelfComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [reading, setReading] = useState<BookInfo[]>([]);
  const [finish, setFinish] = useState<BookInfo[]>([]);
  useEffect(() => {
    const getBooks = async () => {
      if (userInfo.uid) {
        const memberData = (await getMemberData(userInfo.uid)) as MemberInfo;
        if (memberData?.books && memberData?.reading && memberData?.finish) {
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
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <BookShelfs>
          <BookShelf>
            <ShelfTitle>
              <ShelfIcon>C</ShelfIcon>ollection / 收藏
            </ShelfTitle>
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
                                <BookTitle>{book.title}</BookTitle>
                                <br />
                                {book.authors!.length > 0 && (
                                  <BookAuthor>{book.authors![0]}</BookAuthor>
                                )}
                              </BookData>
                              <DeskRemove
                                onClick={() => {
                                  if (book.isbn && books) {
                                    setBooks((prev) =>
                                      prev.filter(
                                        (bookinfo) =>
                                          bookinfo.isbn !== book.isbn
                                      )
                                    );
                                    removeBook(
                                      book.isbn,
                                      userInfo.uid!,
                                      "books"
                                    );
                                  }
                                }}
                              >
                                X
                              </DeskRemove>
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
            <ShelfTitle>
              <ShelfIcon>R</ShelfIcon>eading / 閱讀
            </ShelfTitle>
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
                                <BookTitle>{book.title}</BookTitle>
                                <br />
                                {book.authors!.length > 0 && (
                                  <BookAuthor>{book.authors![0]}</BookAuthor>
                                )}
                              </BookData>
                              <DeskRemove
                                onClick={() => {
                                  if (book.isbn && books) {
                                    setBooks((prev) =>
                                      prev.filter(
                                        (bookinfo) =>
                                          bookinfo.isbn !== book.isbn
                                      )
                                    );
                                    removeBook(
                                      book.isbn,
                                      userInfo.uid!,
                                      "books"
                                    );
                                  }
                                }}
                              >
                                X
                              </DeskRemove>
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
            <ShelfTitle>
              <ShelfIcon>F</ShelfIcon>inish / 完成
            </ShelfTitle>
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
                                <BookTitle>{book.title}</BookTitle>
                                <br />
                                {book.authors!.length > 0 && (
                                  <BookAuthor>{book.authors![0]}</BookAuthor>
                                )}
                              </BookData>
                              <DeskRemove
                                onClick={() => {
                                  if (book.isbn && books) {
                                    setBooks((prev) =>
                                      prev.filter(
                                        (bookinfo) =>
                                          bookinfo.isbn !== book.isbn
                                      )
                                    );
                                    removeBook(
                                      book.isbn,
                                      userInfo.uid!,
                                      "books"
                                    );
                                  }
                                }}
                              >
                                X
                              </DeskRemove>
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
      <MobileBookShelfComponent
        userInfo={userInfo}
        books={books}
        reading={reading}
        finish={finish}
        setBooks={setBooks}
        setReading={setReading}
        setFinish={setFinish}
      />
    </>
  );
}

export default function Profile() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const dispatch = useDispatch();
  const [edit, setEdit] = useState(false);
  const editNameRef = useRef<HTMLInputElement>(null);
  const editIntroRef = useRef<HTMLTextAreaElement>(null);

  const [avatar, setAvatar] = useState("books");

  const isRadioSelect = (value: string): boolean => avatar === value;
  const avatarSelector = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setAvatar(e.currentTarget.value);

  return (
    <ProfilePage>
      <ProfilePageWrap>
        {edit && (
          <Overlay
            onClick={() => {
              setEdit(false);
            }}
          />
        )}
        {userInfo.isSignIn ? (
          <>
            <UserInfoBox>
              <UserAvatar
                src={userInfo.img!}
                alt="memberAvatar"
                width={100}
                height={100}
              ></UserAvatar>
              <UserDetail>
                <UserName>{userInfo.name}</UserName>
                <UserIntro>
                  {userInfo.intro
                    ? userInfo.intro
                    : "加入介紹，讓我們更認識你😆😆😆"}
                </UserIntro>
              </UserDetail>
              <ButtonBox>
                <ProfileButton
                  onClick={() => {
                    setEdit(true);
                  }}
                >
                  <BtnImg src={pen} alt="edit" width={20} height={20} />
                  編輯資訊
                </ProfileButton>
                <ProfileButton
                  onClick={() => {
                    Swal.fire({
                      title: "確定登出嗎？",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#d33",
                      confirmButtonText: "確認登出",
                      cancelButtonText: "取消",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        Swal.fire({
                          icon: "success",
                          title: "登出成功！",
                          text: "成功刪除評價 / 評論。",
                          showConfirmButton: false,
                          timer: 1500,
                        });
                        signout();
                        dispatch(
                          userSignOut({
                            uid: "",
                            name: "",
                            email: "",
                            intro: "",
                          })
                        );
                      }
                    });
                  }}
                >
                  <BtnImg src={signOut} alt="sign out" width={20} height={20} />
                  登出
                </ProfileButton>
              </ButtonBox>
              {edit && (
                <EditBox>
                  <Inputbox>
                    <InputTitle>頭像</InputTitle>
                    <Label>
                      <InputContent
                        type="radio"
                        name="avatar"
                        value="male"
                        checked={isRadioSelect("male")}
                        onChange={avatarSelector}
                      />
                      <UserAvatar src={male} alt="maleAvatar" />
                    </Label>
                    <Label>
                      <InputContent
                        type="radio"
                        name="avatar"
                        value="male2"
                        checked={isRadioSelect("male2")}
                        onChange={avatarSelector}
                      />
                      <UserAvatar src={male2} alt="maleAvatar2" />
                    </Label>
                    <Label>
                      <InputContent
                        type="radio"
                        name="avatar"
                        value="female"
                        checked={isRadioSelect("female")}
                        onChange={avatarSelector}
                      />
                      <UserAvatar src={female} alt="femaleAvatar" />
                    </Label>
                    <br />
                    <Label>
                      <InputContent
                        type="radio"
                        name="avatar"
                        value="female2"
                        checked={isRadioSelect("female2")}
                        onChange={avatarSelector}
                      />
                      <UserAvatar src={female2} alt="femaleAvatar2" />
                    </Label>
                    <Label>
                      <InputContent
                        type="radio"
                        name="avatar"
                        value="kid"
                        checked={isRadioSelect("kid")}
                        onChange={avatarSelector}
                      />
                      <UserAvatar src={kid} alt="femaleAvatar2" />
                    </Label>
                    <Label>
                      <InputContent
                        type="radio"
                        name="avatar"
                        value="books"
                        checked={isRadioSelect("books")}
                        onChange={avatarSelector}
                      />
                      <UserAvatar src={books} alt="upload" />
                    </Label>
                  </Inputbox>
                  <EditBoxDetail>
                    <EditTitle>姓名</EditTitle>
                    <TitleInput
                      ref={editNameRef}
                      defaultValue={userInfo.name}
                    />
                    <br />
                    <EditTitle>自我介紹</EditTitle>
                    <IntroTextarea
                      ref={editIntroRef}
                      defaultValue={userInfo.intro}
                    />
                  </EditBoxDetail>
                  <EditButtonBox>
                    <SubmitButton
                      onClick={() => {
                        setEdit(false);
                      }}
                    >
                      取消
                    </SubmitButton>
                    <SubmitButton
                      onClick={() => {
                        if (
                          editNameRef &&
                          editNameRef.current &&
                          editIntroRef &&
                          editIntroRef.current
                        ) {
                          if (avatar === "books") {
                            const img =
                              "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/book-stack.png?alt=media&token=16d3a52f-862d-4908-977f-68f7f8af783a";
                            editMemberInfo(
                              userInfo,
                              editNameRef.current.value,
                              editIntroRef.current.value,
                              img,
                              dispatch
                            );
                            setEdit(false);
                          } else if (avatar === "male") {
                            const img =
                              "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-male.png?alt=media&token=4966e0d4-b850-4c33-a3eb-88f2a9d9238b";
                            editMemberInfo(
                              userInfo,
                              editNameRef.current.value,
                              editIntroRef.current.value,
                              img,
                              dispatch
                            );
                            setEdit(false);
                          } else if (avatar === "male2") {
                            const img =
                              "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-male2.png?alt=media&token=225beacb-0954-4f29-849e-1cdaa4fb359b";
                            editMemberInfo(
                              userInfo,
                              editNameRef.current.value,
                              editIntroRef.current.value,
                              img,
                              dispatch
                            );
                            setEdit(false);
                          } else if (avatar === "female") {
                            const img =
                              "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-female.png?alt=media&token=cd1fbeef-0d9e-4d34-9217-0c0921e24bd6";
                            editMemberInfo(
                              userInfo,
                              editNameRef.current.value,
                              editIntroRef.current.value,
                              img,
                              dispatch
                            );
                            setEdit(false);
                          } else if (avatar === "female2") {
                            const img =
                              "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-female2.png?alt=media&token=26bba03e-f92f-4068-b2ba-8dfc56313553";
                            editMemberInfo(
                              userInfo,
                              editNameRef.current.value,
                              editIntroRef.current.value,
                              img,
                              dispatch
                            );
                            setEdit(false);
                          } else if (avatar === "kid") {
                            const img =
                              "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-kid.png?alt=media&token=6ad7ec20-5fc7-4076-8972-52ca4c6b3bfa";
                            editMemberInfo(
                              userInfo,
                              editNameRef.current.value,
                              editIntroRef.current.value,
                              img,
                              dispatch
                            );
                            setEdit(false);
                          } else if (avatar === "books") {
                            const img =
                              "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/book-stack.png?alt=media&token=16d3a52f-862d-4908-977f-68f7f8af783a";
                            editMemberInfo(
                              userInfo,
                              editNameRef.current.value,
                              editIntroRef.current.value,
                              img,
                              dispatch
                            );
                            setEdit(false);
                          }
                        }
                      }}
                    >
                      送出
                    </SubmitButton>
                  </EditButtonBox>
                </EditBox>
              )}
            </UserInfoBox>
            <BookShelfComponent />
          </>
        ) : (
          <SigninComponent />
        )}
      </ProfilePageWrap>
    </ProfilePage>
  );
}
