import { kv } from "@vercel/kv";
import { format } from "date-fns";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 뉴스 데이터 가져오기
    const keys = await kv.keys("news:*");
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

    if (newsItems.length === 0) {
      return res.status(404).json({ error: "저장할 뉴스가 없습니다." });
    }

    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd");

    // HTML 내용 생성
    let htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>뉴스 백업 - ${formattedDate}</title>
    <style>
        body { font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        .news-item { border-bottom: 1px solid #eee; padding: 15px 0; }
        h3 { margin-bottom: 5px; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .meta { color: #666; font-size: 0.9rem; }
    </style>
</head>
<body>
    <h1>뉴스 백업 - ${formattedDate}</h1>
    <div class="news-container">
`;

    // 뉴스 아이템 추가
    for (const item of newsItems) {
      const publishedDate = new Date(item.pubDate);
      const formattedPubDate = format(publishedDate, "yyyy-MM-dd HH:mm");

      htmlContent += `
    <div class="news-item">
        <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
        <p class="meta">👤 ${item.author} | 🕒 ${formattedPubDate}</p>
    </div>
`;
    }

    htmlContent += `
    </div>
</body>
</html>
`;

    // HTML 파일로 응답
    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="news-backup-${formattedDate}.html"`
    );
    return res.status(200).send(htmlContent);
  } catch (error) {
    console.error("Backup Error:", error);
    return res.status(500).json({ error: "백업 생성 중 오류가 발생했습니다." });
  }
}
