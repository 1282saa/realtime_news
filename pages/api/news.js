import { kv } from "@vercel/kv";
import { getNewsFromCache } from "./local-news";

// 로컬 환경 감지
const isLocal = process.env.NODE_ENV === "development";

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
    // 로컬 환경에서는 다른 API에서 뉴스 데이터 가져오기
    if (isLocal) {
      // GET 요청 처리 (뉴스 목록 조회)
      if (req.method === "GET") {
        // 로컬 캐시에서 뉴스 가져오기
        const newsItems = getNewsFromCache();

        // 만약 캐시가 비어있다면 local-news API 호출
        if (!newsItems || newsItems.length === 0) {
          try {
            // 내부 API 호출
            const response = await fetch(
              `${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/api/local-news`
            );
            if (!response.ok) {
              throw new Error(
                `로컬 뉴스 API 요청 실패: ${response.statusText}`
              );
            }
            const data = await response.json();
            return res.status(200).json({ news: data.news || [] });
          } catch (error) {
            console.error("로컬 뉴스 가져오기 오류:", error);
            return res.status(200).json({ news: [] });
          }
        }

        return res.status(200).json({ news: newsItems });
      }

      // POST 요청 처리 (로컬 환경에서는 의미 없음)
      if (req.method === "POST") {
        return res.status(200).json({
          success: true,
          message: "로컬 환경에서는 POST 요청이 저장되지 않습니다.",
        });
      }
    } else {
      // Vercel 환경에서는 기존 KV 로직 사용
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
          (a, b) =>
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
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
        await kv.set("news:count", Number(count) + 1);

        return res.status(201).json({ success: true, news: newsItem });
      }
    }

    // 지원하지 않는 HTTP 메소드
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
}
