import { kv } from "@vercel/kv";
import Parser from "rss-parser";
// Next.js에서는 node-fetch v2를 사용하는 것이 좋습니다
// node-fetch v3는 ESM 전용이라 CommonJS 환경에서 문제가 발생할 수 있습니다

// RSS 파서 인스턴스 생성 - 향상된 설정
const parser = new Parser({
  headers: {
    Accept: "application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
    "User-Agent": "Vercel-RSS-Reader/1.0",
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
  // API 키 검증 (옵션)
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  const isManualRun = req.query.manual === "true";

  try {
    console.log(`RSS 피드 가져오기 시작... [${new Date().toISOString()}]`);

    // 직접 fetch로 XML 데이터 가져오기 (내장 fetch 사용)
    const response = await fetch(RSS_URL, {
      headers: {
        Accept:
          "application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
        "User-Agent": "Vercel-RSS-Reader/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`RSS 피드 요청 실패: ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log(`XML 데이터 받음: ${xmlText.substring(0, 100)}...`);

    // RSS 피드 파싱
    const feed = await parser.parseString(xmlText);
    console.log(`총 ${feed.items?.length || 0}개의 뉴스 항목을 발견했습니다.`);

    if (!feed.items || feed.items.length === 0) {
      console.error("항목이 없거나 파싱 실패");
      return res.status(404).json({ error: "뉴스 항목을 찾을 수 없습니다." });
    }

    let addedCount = 0;
    let skippedCount = 0;

    // 각 뉴스 항목 처리
    for (const item of feed.items) {
      try {
        // 제목에서 CDATA 태그 제거 (개선된 정규식)
        const titleRaw = item.title || "";
        const title = titleRaw.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
        if (!title) {
          console.log("제목이 없는 항목 건너뜀");
          skippedCount++;
          continue;
        }

        // 링크 처리
        const link = item.link || "";

        // pubDate 파싱 및 ISO 형식으로 변환
        let pubDate;
        try {
          pubDate = new Date(item.pubDate || new Date()).toISOString();
        } catch (dateError) {
          console.error("날짜 파싱 오류:", dateError);
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

        console.log(`처리 중: "${title.substring(0, 30)}..." | ${pubDate}`);

        // 타임스탬프 키 생성 (충돌 방지를 위해 제목 해시 추가)
        const timestamp = new Date(pubDate).getTime();
        const titleHash = Buffer.from(title).toString("base64").substring(0, 8);
        const id = `news:${timestamp}-${titleHash}`;

        // 중복 체크 - 제목 기반 (더 효율적인 방식)
        const keys = await kv.keys("news:*");
        const newsKeys = keys.filter((key) => key !== "news:count");
        let isDuplicate = false;

        // 제목으로만 중복 체크 (더 빠른 처리를 위해)
        for (const key of newsKeys) {
          const existingNews = await kv.get(key);
          if (existingNews && existingNews.title === title) {
            isDuplicate = true;
            console.log(`중복 발견: "${title.substring(0, 30)}..."`);
            break;
          }
        }

        if (isDuplicate) {
          skippedCount++;
          continue;
        }

        // 새 뉴스 저장
        console.log(`저장 중: ${id}`);
        await kv.set(id, newsItem);

        // 카운트 증가
        const count = (await kv.get("news:count")) || 0;
        await kv.set("news:count", Number(count) + 1);

        addedCount++;
        console.log(`성공적으로 저장: "${title.substring(0, 30)}..."`);
      } catch (itemError) {
        console.error("항목 처리 중 오류:", itemError.message);
      }
    }

    const message = `RSS 피드 업데이트 완료. ${addedCount}개 추가, ${skippedCount}개 건너뜀.`;
    console.log(message);

    return res.status(200).json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
      feedTitle: feed.title || "서울경제 뉴스",
      itemsProcessed: feed.items.length,
    });
  } catch (error) {
    const errorMessage = `RSS 피드 처리 중 오류: ${error.message}`;
    console.error(errorMessage);
    console.error(error.stack);
    return res.status(500).json({ error: errorMessage });
  }
}
