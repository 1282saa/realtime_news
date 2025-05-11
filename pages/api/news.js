import { kv } from "@vercel/kv";

// 초기 데이터 로드
import { initialNewsItems } from "../../utils/initialData";

// KV 스토어 초기화 함수
async function initializeStore() {
  const count = await kv.get("news:count");

  // 초기 데이터가 없으면 샘플 데이터 추가
  if (!count || count === 0) {
    for (const item of initialNewsItems) {
      const timestamp = new Date(item.pubDate).getTime();
      const id = `news:${timestamp}`;
      await kv.set(id, item);
    }
    await kv.set("news:count", initialNewsItems.length);
  }
}

export default async function handler(req, res) {
  try {
    await initializeStore();

    // GET 요청 처리 (뉴스 목록 조회)
    if (req.method === "GET") {
      const keys = await kv.keys("news:*");
      // news:count 키는 제외
      const newsKeys = keys.filter((key) => key !== "news:count");

      // 모든 뉴스 데이터 가져오기
      const newsItems = [];
      for (const key of newsKeys) {
        const news = await kv.get(key);
        if (news) {
          newsItems.push(news);
        }
      }

      // 최신순 정렬
      newsItems.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );

      return res.status(200).json({ news: newsItems });
    }

    // POST 요청 처리 (새 뉴스 추가)
    if (req.method === "POST") {
      const newsItem = req.body;

      // 필수 필드 검증
      if (
        !newsItem ||
        !newsItem.title ||
        !newsItem.author ||
        !newsItem.pubDate ||
        !newsItem.link
      ) {
        return res.status(400).json({ error: "필수 필드가 누락되었습니다." });
      }

      // 중복 체크를 위한 기존 데이터 조회
      const keys = await kv.keys("news:*");
      const newsKeys = keys.filter((key) => key !== "news:count");

      for (const key of newsKeys) {
        const existingNews = await kv.get(key);
        if (
          existingNews &&
          existingNews.title === newsItem.title &&
          existingNews.link === newsItem.link
        ) {
          return res.status(409).json({ error: "이미 존재하는 뉴스입니다." });
        }
      }

      // 새 뉴스 저장
      const timestamp = new Date(newsItem.pubDate).getTime();
      const id = `news:${timestamp}`;
      await kv.set(id, newsItem);

      // 카운트 증가
      const count = (await kv.get("news:count")) || 0;
      await kv.set("news:count", count + 1);

      return res.status(201).json({ success: true, news: newsItem });
    }

    // 지원하지 않는 HTTP 메소드
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
}
