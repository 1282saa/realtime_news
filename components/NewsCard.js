import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export default function NewsCard({ news }) {
  // ISO 문자열을 Date 객체로 변환
  const publishedDate = parseISO(news.pubDate);

  // 한국 시간으로 포맷팅
  const formattedDate = format(publishedDate, "yyyy-MM-dd HH:mm", {
    locale: ko,
  });

  return (
    <div className="news-card">
      <a
        href={news.link}
        target="_blank"
        rel="noopener noreferrer"
        className="news-title"
      >
        {news.title}
      </a>
      <p className="news-meta">
        👤 {news.author} | 🕒 {formattedDate}
      </p>
    </div>
  );
}
