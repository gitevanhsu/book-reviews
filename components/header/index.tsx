import Link from "next/link";
import styled from "styled-components";
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getMemberData } from "../../utils/firebaseFuncs";
import { useDispatch } from "react-redux";
import { userSignIn } from "../../slices/userInfoSlice";

const Ul = styled.ul`
  display: flex;
`;
const Li = styled.li`
  margin: 10px 20px;
`;

export function Header() {
  const dispatch = useDispatch();
  useEffect(() => {
    const auth = getAuth();
    const unSubscriptAuthState = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const userdata = await getMemberData(uid);
        userdata && dispatch(userSignIn(userdata));
      } else {
      }
    });
    return () => {
      unSubscriptAuthState();
    };
  });
  return (
    <>
      <Ul>
        <Li>
          <Link href="/">Home</Link>
        </Li>
        <Li>
          <Link href="/profile">Profile</Link>
        </Li>
        <Li>
          <Link href="/books/">Books</Link>
        </Li>
        <Li>
          <Link href="/groups/">Groups</Link>
        </Li>
        <Li>
          <Link href="/search/">搜尋</Link>
        </Li>
      </Ul>
    </>
  );
}
