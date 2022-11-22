import React, { useRef, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import { emailSignUp } from "../../utils/firebaseFuncs";
import male from "/public/img/reading-male.png";
import male2 from "/public/img/reading-male2.png";
import female from "/public/img/reading-female.png";
import female2 from "/public/img/reading-female2.png";
import books from "/public/img/book-stack.png";
import kid from "/public/img/reading-kid.png";

const SignUpArea = styled.div`
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  display: inline-block;
  padding: 10px 20px;
  z-index: 6;
  width: 480px;
  background-color: ${(props) => props.theme.grey};
  box-shadow: 0px 0px 5px ${(props) => props.theme.black};
  border-radius: 20px;
  @media screen and (max-width: 576px) {
    width: 280px;
  }
`;
const Inputbox = styled.div`
  margin: 10px 0;
`;
const InputTitle = styled.h4`
  font-size: ${(props) => props.theme.fz * 1.5}px;
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz * 1}px;
  }
`;
const InputContent = styled.input`
  padding: 5px 10px;
  width: 100%;
  margin-top: 10px;
  border: 1px solid ${(props) => props.theme.black};
  border-radius: 5px;
  background-color: ${(props) => props.theme.white};
  @media screen (max-width: 576px) {
    font-size: ${(props) => props.theme.fz}px;
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
const InputTextArea = styled.textarea`
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
const SubmitButton = styled.button`
  padding: 10px 20px;
  cursor: pointer;
  background-color: ${(props) => props.theme.yellow};
  border-radius: 20px;
  & + & {
    margin-left: 10px;
  }
  @media screen (max-width: 576px) {
    padding: 5px 10px;
  }
`;
const Label = styled.label``;
const UserAvatar = styled(Image)`
  border-radius: 50%;
`;

export default function SignupComponent({
  setSignUp,
}: {
  setSignUp: Function;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const introRef = useRef<HTMLTextAreaElement>(null);
  const [avatar, setAvatar] = useState("books");

  const isRadioSelect = (value: string): boolean => avatar === value;
  const avatarSelector = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setAvatar(e.currentTarget.value);
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

      if (avatar === "books") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/book-stack.png?alt=media&token=16d3a52f-862d-4908-977f-68f7f8af783a";
        name &&
          email &&
          password &&
          emailSignUp(name, email, password, intro, img);
      } else if (avatar === "male") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-male.png?alt=media&token=4966e0d4-b850-4c33-a3eb-88f2a9d9238b";
        name &&
          email &&
          password &&
          emailSignUp(name, email, password, intro, img);
      } else if (avatar === "male2") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-male2.png?alt=media&token=225beacb-0954-4f29-849e-1cdaa4fb359b";
        name &&
          email &&
          password &&
          emailSignUp(name, email, password, intro, img);
      } else if (avatar === "female") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-female.png?alt=media&token=cd1fbeef-0d9e-4d34-9217-0c0921e24bd6";
        name &&
          email &&
          password &&
          emailSignUp(name, email, password, intro, img);
      } else if (avatar === "female2") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-female2.png?alt=media&token=26bba03e-f92f-4068-b2ba-8dfc56313553";
        name &&
          email &&
          password &&
          emailSignUp(name, email, password, intro, img);
      } else if (avatar === "kid") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/reading-kid.png?alt=media&token=6ad7ec20-5fc7-4076-8972-52ca4c6b3bfa";
        name &&
          email &&
          password &&
          emailSignUp(name, email, password, intro, img);
      } else if (avatar === "books") {
        const img =
          "https://firebasestorage.googleapis.com/v0/b/book-reviews-87d66.appspot.com/o/book-stack.png?alt=media&token=16d3a52f-862d-4908-977f-68f7f8af783a";
        name &&
          email &&
          password &&
          emailSignUp(name, email, password, intro, img);
      }

      nameRef.current.value = "";
      emailRef.current.value = "";
      passwordRef.current.value = "";
      introRef.current.value = "";
    }
  };

  return (
    <SignUpArea>
      <Inputbox>
        <InputTitle>Name: </InputTitle>
        <InputContent key="signUpName" ref={nameRef} type="text"></InputContent>
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
        <InputTextArea key="signUpIntro" ref={introRef}></InputTextArea>
      </Inputbox>
      <Inputbox>
        <InputTitle>選擇您喜歡的頭像</InputTitle>
        <Label>
          <InputContent
            type="radio"
            name="avatar"
            value="male"
            checked={isRadioSelect("male")}
            onChange={avatarSelector}
          />
          <UserAvatar src={male} alt="maleAvatar" width={50} height={50} />
        </Label>
        <Label>
          <InputContent
            type="radio"
            name="avatar"
            value="male2"
            checked={isRadioSelect("male2")}
            onChange={avatarSelector}
          />
          <UserAvatar src={male2} alt="maleAvatar2" width={50} height={50} />
        </Label>
        <Label>
          <InputContent
            type="radio"
            name="avatar"
            value="female"
            checked={isRadioSelect("female")}
            onChange={avatarSelector}
          />
          <UserAvatar src={female} alt="femaleAvatar" width={50} height={50} />
        </Label>
        <Label>
          <InputContent
            type="radio"
            name="avatar"
            value="female2"
            checked={isRadioSelect("female2")}
            onChange={avatarSelector}
          />
          <UserAvatar
            src={female2}
            alt="femaleAvatar2"
            width={50}
            height={50}
          />
        </Label>
        <Label>
          <InputContent
            type="radio"
            name="avatar"
            value="kid"
            checked={isRadioSelect("kid")}
            onChange={avatarSelector}
          />
          <UserAvatar src={kid} alt="femaleAvatar2" width={50} height={50} />
        </Label>
        <Label>
          <InputContent
            type="radio"
            name="avatar"
            value="books"
            checked={isRadioSelect("books")}
            onChange={avatarSelector}
          />
          <UserAvatar src={books} alt="upload" width={50} height={50} />
        </Label>
      </Inputbox>
      <SubmitButton
        onClick={() => {
          signup();
        }}
      >
        註冊
      </SubmitButton>
      <SubmitButton
        onClick={() => {
          setSignUp(false);
        }}
      >
        關閉
      </SubmitButton>
    </SignUpArea>
  );
}
