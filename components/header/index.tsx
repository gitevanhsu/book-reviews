import Link from "next/link";
import styled from "styled-components";

const Ul = styled.ul`
  display: flex;
`;
const Li = styled.li`
  margin: 10px 20px;
`;

export function Header() {
  return (
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
    </Ul>
  );
}
