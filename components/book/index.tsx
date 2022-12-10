import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import styled from "styled-components";

import { bookCover } from "../../utils/imgs";
import { BookInfo } from "../../utils/firebaseFuncs";

const BookBox = styled.div`
  display: flex;
  position: relative;
  margin: 0 0 10px;
  @media screen and (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
`;
const BookImgBox = styled.div`
  margin-right: 20px;
  @media screen and (max-width: 576px) {
    margin-right: 0;
    margin-bottom: 50px;
  }
`;
const BookImg = styled(Image)`
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
`;
const BookDetail = styled.div`
  padding: 0px 20px;
  border-radius: 10px;
  margin-left: 50px;
  @media screen and (max-width: 576px) {
    margin: 0;
  }
`;
interface ItemBoxProps {
  hasSub?: boolean;
}
interface TitleProps {
  isTitle?: boolean;
}
const ItemBox = styled.div<ItemBoxProps>`
  display: flex;
  margin-top: ${(props) => (props.hasSub ? "5px" : "20px")};
`;
const TitleItemBox = styled(ItemBox)`
  margin-top: 0;
`;
const ItemTitle = styled.h2<TitleProps>`
  font-weight: 600;
  min-width: 60px;
  line-height: ${(props) => props.theme.fz4};
  font-size: ${(props) => props.theme.fz4};
  @media screen and (max-width: 768px) {
    line-height: ${(props) => props.theme.fz4};
    font-size: ${(props) => props.theme.fz4};
  }
  @media screen and (max-width: 576px) {
    min-width: 70px;
  }
`;
const DesItemTitle = styled(ItemTitle)`
  margin-top: -5px;
  margin-bottom: 10px;
  line-height: 30px;
`;

const ItemContent = styled.p<TitleProps>`
  line-height: ${(props) =>
    props.isTitle ? props.theme.fz3 : props.theme.fz4};
  font-size: ${(props) => (props.isTitle ? props.theme.fz3 : props.theme.fz4)};
  font-weight: ${(props) => (props.isTitle ? 600 : 300)};
  @media screen and (max-width: 768px) {
    line-height: ${(props) =>
      props.isTitle ? props.theme.fz4 : props.theme.fz5};
    font-size: ${(props) =>
      props.isTitle ? props.theme.fz4 : props.theme.fz5};
  }
  @media screen and (max-width: 576px) {
    line-height: ${(props) =>
      props.isTitle ? props.theme.fz4 : props.theme.fz4};
    font-size: ${(props) =>
      props.isTitle ? props.theme.fz4 : props.theme.fz4};
  }
`;
const SubItemBox = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
  & > ${ItemContent} {
    line-height: ${(props) => props.theme.fz4};
    font-size: ${(props) => props.theme.fz4};
  }
`;
const AuthorItemBox = styled(ItemBox)`
  margin-top: 30px;
`;
const DesItemBox = styled(ItemBox)`
  display: block;
`;

interface DescriptionProps {
  isShowMore: boolean;
}
const Description = styled(ItemContent)<DescriptionProps>`
  margin-top: -5px;
  font-size: ${(props) => props.theme.fz4};
  line-height: 30px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${(props) => (props.isShowMore ? "999" : "6")};
  overflow: hidden;
`;
const BookRating = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 15px;
`;
const BookRatingStar = styled.div`
  color: #000;
  display: flex;
  align-items: center;
  line-height: ${(props) => props.theme.fz4};
  font-size: ${(props) => props.theme.fz4};
`;
const BookRatingNum = styled.p`
  margin-left: 10px;
  line-height: ${(props) => props.theme.fz4};
  font-size: ${(props) => props.theme.fz4};
`;

interface StarProps {
  rating: boolean;
}
const Star = styled.div<StarProps>`
  display: inline-block;
  color: ${(props) => (props.rating ? props.theme.starYellow : "black")};
  & + & {
    margin-left: 5px;
  }
`;
const NoImgTitle = styled.h2`
  position: absolute;
  color: ${(props) => props.theme.white};
  font-size: ${(props) => props.theme.fz3};
  width: 220px;
  height: 331px;
  overflow: hidden;
  padding: 20px 10px;
  text-align: center;
  letter-spacing: 2px;
  top: 0;
  left: 0;
  pointer-events: none;
`;
const SeeMoreBtn = styled.button`
  font-size: ${(props) => props.theme.fz5};
  padding: 5px 10px;
  border-radius: 10px;
  background-color: ${(props) => props.theme.yellow};
  cursor: pointer;
`;

export default function BookComponent({ data }: { data: BookInfo }) {
  const [showMore, setShowMore] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const contentClientHeightRef = useRef<number>();

  useEffect(() => {
    contentClientHeightRef.current = contentRef.current?.clientHeight!;
  }, []);
  return (
    <BookBox>
      <BookImgBox>
        <BookImg
          src={data.smallThumbnail || bookCover}
          alt={`${data.title}`}
          width={220}
          height={331}
          priority
        />
        {data.ratingMember &&
          data.ratingMember.length >= 0 &&
          data.ratingCount! >= 0 && (
            <BookRating>
              <BookRatingStar>
                {[...Array(5)].map((_, index) => {
                  return (
                    <Star
                      key={index}
                      rating={
                        index <
                        Math.round(
                          data.ratingCount! / data.ratingMember!.length
                        )
                      }
                    >
                      &#9733;
                    </Star>
                  );
                })}
                <BookRatingNum>
                  {Math.round(
                    (data.ratingCount! / data.ratingMember.length) * 100
                  ) / 100 || 0}
                </BookRatingNum>
                ({data.ratingMember!.length})
              </BookRatingStar>
            </BookRating>
          )}
        {data.categories && data.categories?.length > 0 && (
          <SubItemBox>
            <ItemContent>類別：</ItemContent>
            {data.categories?.map((category: string) => (
              <ItemContent key={category}>{category}</ItemContent>
            ))}
          </SubItemBox>
        )}
      </BookImgBox>
      {!data.smallThumbnail && <NoImgTitle>{data.title}</NoImgTitle>}
      <BookDetail>
        <TitleItemBox>
          <ItemContent isTitle>{data.title}</ItemContent>
        </TitleItemBox>
        {data.subtitle && (
          <ItemBox hasSub={true}>
            <ItemContent>{data.subtitle}</ItemContent>
          </ItemBox>
        )}
        {data.authors && (
          <AuthorItemBox>
            <ItemTitle>作者：</ItemTitle>
            {data.authors?.map((author: string) => (
              <ItemContent key={author}>{author}</ItemContent>
            ))}
          </AuthorItemBox>
        )}
        <ItemBox>
          <ItemTitle>ISBN：</ItemTitle>
          <ItemContent>{data.isbn}</ItemContent>
        </ItemBox>
        {data.description && data.description.length > 0 && (
          <>
            <DesItemBox>
              <DesItemTitle>簡介：</DesItemTitle>
              <Description ref={contentRef} isShowMore={showMore}>
                {data.description}
              </Description>
            </DesItemBox>
            {contentRef.current?.scrollHeight! >
              contentClientHeightRef.current! && (
              <SeeMoreBtn
                onClick={() => {
                  setShowMore((prev) => !prev);
                }}
              >
                {showMore ? "顯示部分" : "顯示全部"}
              </SeeMoreBtn>
            )}
          </>
        )}
      </BookDetail>
    </BookBox>
  );
}
