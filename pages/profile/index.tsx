import { useRef } from "react";
import styled from "styled-components";
import { emailSignUp, emailSignIn } from "../../utils/firebaseFuncs";

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

  const signup = () => {
    const name = nameRef.current && nameRef.current.value;
    const email = emailRef.current && emailRef.current.value;
    const password = passwordRef.current && passwordRef.current.value;

    console.log("name:", name);
    console.log("email:", email);
    console.log("password:", password);
    name && email && password && emailSignUp(name, email, password);
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
        <SubmitButton onClick={signup}>註冊</SubmitButton>
      </InputArea>
    </>
  );
}
function SigninComponent() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const signin = () => {
    const email = emailRef.current && emailRef.current.value;
    const password = passwordRef.current && passwordRef.current.value;

    console.log("email:", email);
    console.log("password:", password);
    email && password && emailSignIn(email, password);
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
  return (
    <>
      <SignupComponent />
      <SigninComponent />
    </>
  );
}
