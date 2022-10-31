import { useRef } from "react";
import styled from "styled-components";
import { emailSignUp, emailSignIn, signout } from "../../utils/firebaseFuncs";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useDispatch } from "react-redux";
import { userSignOut } from "../../slices/userInfoSlice";
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
    </>
  );
}
