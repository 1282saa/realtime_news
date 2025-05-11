import Parser from "rss-parser";
// Next.js에서는 node-fetch v2를 사용하는 것이 좋습니다
// node-fetch v3는 ESM 전용이라 CommonJS 환경에서 문제가 발생할 수 있습니다

// RSS 파서 설정
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
    console.log(`RSS 피드 가져오기 시작... [${new Date().toISOString()}]`);

    // RSS 피드 가져오기
    const response = await fetch(RSS_URL, {
      headers: {
        Accept:
          "application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
        "User-Agent": "Next-RSS-Reader/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`RSS 요청 실패: ${response.statusText}`);
    }

    // XML 파싱
    const xmlText = await response.text();
    const feed = await parser.parseString(xmlText);

    if (!feed.items || feed.items.length === 0) {
      return res.status(404).json({ error: "뉴스 항목을 찾을 수 없습니다." });
    }

    // 뉴스 항목 처리
    const parsedNews = feed.items
      .map((item) => {
        try {
          // 제목에서 CDATA 태그 제거
          const title = (item.title || "")
            .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
            .trim();
          if (!title) return null;

          // 날짜 처리
          const pubDate = new Date(item.pubDate || new Date()).toISOString();

          return {
            title,
            author: "서울경제",
            pubDate,
            link: item.link || "",
            source: "서울경제",
            fetchedAt: new Date().toISOString(),
          };
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean); // null 항목 제거

    return res.status(200).json({
      success: true,
      message: `${parsedNews.length}개의 뉴스 항목을 가져왔습니다.`,
      timestamp: new Date().toISOString(),
      feedTitle: feed.title || "서울경제 뉴스",
      news: parsedNews,
    });
  } catch (error) {
    console.error("RSS 피드 처리 오류:", error.message);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
}
