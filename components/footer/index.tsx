import styled from "styled-components";

const Footer = styled.div`
  display: flex;
  align-content: center;
  justify-content: center;
  background-color: ${(props) => props.theme.white};
`;
const FooterContent = styled.div`
  padding: 10px;
  font-size: ${(props) => props.theme.fz4};
`;

export default function FooterComponent() {
  return (
    <Footer>
      <FooterContent>&copy; 2022 Yang-Min, Hsu</FooterContent>
    </Footer>
  );
}
