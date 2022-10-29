import { useEffect } from "react";
import styled from "styled-components";
import { loadBooks } from "../../utils/firebaseFuncs";

export default function Books() {
  loadBooks();
  useEffect(() => {}, []);

  return (
    <>
      <h1>BOOKS</h1>
    </>
  );
}
