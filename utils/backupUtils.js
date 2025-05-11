import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function generateHtmlBackup(newsItems) {
  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  const currentDate = new Date();
  const formattedDate = format(currentDate, "yyyy-MM-dd", { locale: ko });

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

  for (const item of newsItems) {
    const publishedDate = new Date(item.pubDate);
    const formattedPubDate = format(publishedDate, "yyyy-MM-dd HH:mm", {
      locale: ko,
    });

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

  return htmlContent;
}

export function downloadHtmlFile(htmlContent, filename) {
  // blob 생성
  const blob = new Blob([htmlContent], { type: "text/html" });

  // 다운로드 링크 생성
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // 링크 클릭 및 정리
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
