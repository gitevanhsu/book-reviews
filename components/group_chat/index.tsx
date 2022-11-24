import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import {
  db,
  MemberInfo,
  getMemberData,
  sentMessage,
  ChatMessage,
  getFirstChat,
} from "../../utils/firebaseFuncs";
import { RootState } from "../../store";

import male from "/public/img/reading-male.png";
import { useSelector } from "react-redux";
import { onSnapshot, query, collection } from "firebase/firestore";
import { GetServerSideProps } from "next/types";
import { ParsedUrlQuery } from "querystring";
const ChatRoom = styled.div`
  width: 600px;
  margin-top: 20px;
  background-color: ${(props) => props.theme.lightWhite};
  border: 1px solid ${(props) => props.theme.greyBlue};
  padding: 10px;
  border-radius: 10px;
  max-height: 460px;
  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;
const ChatContent = styled.div`
  padding: 10px 10px;
  max-height: 400px;
  min-height: 400px;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`;
const Member = styled.div`
  display: flex;
  align-items: center;
`;

const MemberName = styled.h3`
  font-size: ${(props) => props.theme.fz * 1.5}px;
`;
const MemberImg = styled(Image)`
  margin-right: 5px;
`;
const MemberContent = styled.p`
  display: inline-block;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  padding-left: 30px;
  min-width: 100px;
  white-space: pre-wrap;
  letter-spacing: 1px;
`;
const InputBox = styled.div`
  margin-top: 10px;
  width: 100%;
  display: flex;
  align-items: center;
`;
const MessageInput = styled.input`
  width: 100%;
  border-radius: 5px;
  padding: 5px 10px;
`;
const ChatDate = styled.p`
  padding-left: 30px;
  margin-top: 10px;
`;
const MemberChat = styled.div`
  display: flex;
  max-width: 300px;
  flex-direction: column;
  padding: 10px 0;
`;

const MyChat = styled(MemberChat)`
  align-items: end;
  margin-left: auto;
`;

export default function ChatRoomComponent({
  id,
  chatdata,
}: {
  id: string;
  chatdata: ChatMessage[];
}) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [chats, setChats] = useState<ChatMessage[]>(chatdata);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsub: Function;
    if (id) {
      unsub = onSnapshot(
        query(collection(db, `books/${id}/chat_room`)),
        async (querySnapshot) => {
          const ids: string[] = [];
          const allChat = querySnapshot.docs.map((doc) => {
            ids.push(doc.data().uid);
            return doc.data();
          });
          const requests = ids.map(async (id) => {
            const docData = await getMemberData(id);
            return docData;
          });
          const allMemberInfo = (await Promise.all(requests)) as MemberInfo[];

          const newAllChat = allChat.map((chat) => {
            const memberData = allMemberInfo.find(
              (member) => member.uid === chat.uid
            );
            return { ...chat, memberData } as ChatMessage;
          });
          setChats(newAllChat);
        }
      );
    }
    console.log("effect");
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [id]);

  useEffect(() => {
    if (chatBox.current) chatBox.current.scrollTo(999999, 999999);
  });

  return (
    <ChatRoom>
      <ChatContent ref={chatBox}>
        {chats ? (
          chats.map((chat) => {
            const chatDate = new Date(
              chat.time ? chat.time?.seconds * 1000 : ""
            );
            const year = chatDate.getFullYear();
            const month = chatDate.getMonth() + 1;
            const date = chatDate.getDate();
            if (chat.memberData?.uid === userInfo.uid) {
              return (
                <MyChat key={chat.messageId}>
                  <MemberContent>{chat.content}</MemberContent>
                  <ChatDate>{`${year}-${month}-${date}`}</ChatDate>
                </MyChat>
              );
            } else {
              return (
                <MemberChat key={chat.messageId}>
                  <Member>
                    <MemberImg
                      src={
                        chat.memberData && chat.memberData.img
                          ? chat.memberData.img
                          : male
                      }
                      alt={
                        chat.memberData && chat.memberData.name
                          ? chat.memberData.name
                          : "user Img"
                      }
                      width={25}
                      height={25}
                    />
                    <MemberName>{chat.memberData?.name}</MemberName>
                  </Member>
                  <MemberContent>{chat.content}</MemberContent>
                  <ChatDate>{`${year}-${month}-${date}`}</ChatDate>
                </MemberChat>
              );
            }
          })
        ) : (
          <MemberContent>跟大家分享你的想法吧！</MemberContent>
        )}
      </ChatContent>
      <InputBox>
        <MessageInput
          ref={inputRef}
          onKeyPress={(e) => {
            if (
              e.code === "Enter" &&
              inputRef &&
              inputRef.current &&
              inputRef.current.value.trim() &&
              userInfo
            ) {
              sentMessage(id, userInfo, inputRef.current.value);
              inputRef.current.value = "";
            }
          }}
        />
      </InputBox>
    </ChatRoom>
  );
}
