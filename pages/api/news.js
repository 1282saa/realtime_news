// pages/api/news.js 파일을 다음과 같이 변경
import Parser from "rss-parser";

// RSS 파서 인스턴스 생성
const parser = new Parser({
  headers: {
    Accept: "application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
    "User-Agent": "Next-RSS-Reader/1.0",
  },
  customFields: {
    item: [
      ["pubDate", "pubDate"],
      ["link", "link"],
    ],
  },
  defaultRSS: 2.0,
});

// 서울경제 RSS URL
const RSS_URL = "https://www.sedaily.com/rss/newsall";

export default async function handler(req, res) {
  try {
    console.log("RSS 피드 가져오기 시작...");

    // 직접 fetch로 XML 데이터 가져오기
    const response = await fetch(RSS_URL, {
      headers: {
        Accept:
          "application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
        "User-Agent": "Next-RSS-Reader/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`RSS 피드 요청 실패: ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log(`XML 데이터 받음`);

    // RSS 피드 파싱
    const feed = await parser.parseString(xmlText);
    console.log(`총 ${feed.items?.length || 0}개의 뉴스 항목을 발견했습니다.`);

    if (!feed.items || feed.items.length === 0) {
      console.error("항목이 없거나 파싱 실패");
      return res.status(404).json({ error: "뉴스 항목을 찾을 수 없습니다." });
    }

    // 파싱된 뉴스 배열 초기화
    const parsedNews = [];

    // 각 뉴스 항목 처리
    for (const item of feed.items) {
      try {
        // 제목에서 CDATA 태그 제거
        const titleRaw = item.title || "";
        const title = titleRaw.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
        if (!title) continue;

        // 링크 처리
        const link = item.link || "";

        // pubDate 파싱 및 ISO 형식으로 변환
        let pubDate;
        try {
          pubDate = new Date(item.pubDate || new Date()).toISOString();
        } catch (dateError) {
          pubDate = new Date().toISOString();
        }

        // 기자 이름 (기본값)
        const author = "서울경제";

        // 뉴스 항목 생성
        const newsItem = {
          title,
          author,
          pubDate,
          link,
          source: "서울경제",
          fetchedAt: new Date().toISOString(),
        };

        parsedNews.push(newsItem);
      } catch (itemError) {
        console.error("항목 처리 중 오류:", itemError.message);
      }
    }

    // 뉴스 항목 시간순 정렬 (최신순)
    parsedNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return res.status(200).json({ news: parsedNews });
  } catch (error) {
    console.error("RSS 피드 처리 중 오류:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
