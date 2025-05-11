// DOM 요소 참조
const newsFeedElement = document.getElementById("news-feed");
const saveRssButton = document.getElementById("save-rss");
const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);
const themeMode = document.querySelector(".theme-mode");

// 뉴스 데이터 배열 (뉴스 아이템 저장)
let newsItems = [];

// 뉴스 카드 생성 함수
function createNewsCard(newsItem) {
  const div = document.createElement("div");
  div.className = "news-card";

  // ISO 형식의 날짜 문자열을 한국 시간으로 변환
  const pubDate = new Date(newsItem.pubDate);
  const formattedDate = pubDate.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  div.innerHTML = `
    <h3><a href="${newsItem.link}" target="_blank">${newsItem.title}</a></h3>
    <p>👤 ${newsItem.author} | 🕒 ${formattedDate}</p>
  `;

  return div;
}

// 뉴스 피드에 뉴스 아이템 추가 (최신 뉴스가 상단에 위치)
function addNewsItem(newsItem) {
  // 중복 방지 (동일 제목과 링크로 이미 존재하는 뉴스는 추가하지 않음)
  const isDuplicate = newsItems.some(
    (item) => item.title === newsItem.title && item.link === newsItem.link
  );

  if (isDuplicate) return;

  // 새로운 뉴스 아이템을 배열에 추가하고 정렬
  newsItems.push(newsItem);

  // pubDate 기준으로 내림차순 정렬 (최신순)
  newsItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // 정렬된 뉴스 목록 다시 렌더링
  renderNewsFeed();
}

// 뉴스 피드 렌더링 함수
function renderNewsFeed() {
  // 기존 컨텐츠 삭제
  newsFeedElement.innerHTML = "";

  // 정렬된 뉴스 아이템 렌더링
  newsItems.forEach((item) => {
    const newsCard = createNewsCard(item);
    newsFeedElement.appendChild(newsCard);
  });
}

// n8n에서 전송되는 새 뉴스를 처리하는 함수
// 실제 구현에서는 웹소켓, SSE 또는 API 폴링을 통해 데이터를 받을 수 있음
function receiveNewsFromN8N(newsData) {
  addNewsItem(newsData);
}

// 뉴스 피드를 HTML 파일로 저장하는 함수
function saveNewsAsHTML() {
  if (newsItems.length === 0) {
    alert("저장할 뉴스가 없습니다.");
    return;
  }

  let htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>뉴스 백업 - ${new Date().toLocaleDateString()}</title>
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
  <h1>뉴스 백업 - ${new Date().toLocaleDateString()}</h1>
  <div class="news-container">
`;

  newsItems.forEach((item) => {
    const pubDate = new Date(item.pubDate);
    const formattedDate = pubDate.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    htmlContent += `
    <div class="news-item">
      <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
      <p class="meta">👤 ${item.author} | 🕒 ${formattedDate}</p>
    </div>
`;
  });

  htmlContent += `
  </div>
</body>
</html>
`;

  // HTML 파일 다운로드
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `news-backup-${new Date().toISOString().split("T")[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 테마 설정
function setTheme(isDark) {
  if (isDark) {
    document.documentElement.setAttribute("data-theme", "dark");
    themeMode.textContent = "다크 모드";
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeMode.textContent = "라이트 모드";
    localStorage.setItem("theme", "light");
  }
}

// 저장된 테마 불러오기
function loadTheme() {
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    toggleSwitch.checked = true;
    setTheme(true);
  } else {
    toggleSwitch.checked = false;
    setTheme(false);
  }
}

// 이벤트 리스너 등록
saveRssButton.addEventListener("click", saveNewsAsHTML);
toggleSwitch.addEventListener("change", function () {
  setTheme(this.checked);
});

// 페이지 로드 시 테마 설정 불러오기
document.addEventListener("DOMContentLoaded", loadTheme);

// 시연을 위한 예시 데이터
// 실제 구현에서는 n8n에서 데이터를 받는 코드로 대체
const exampleNewsItems = [
  {
    title: "삼성, 500Hz OLED 출시",
    author: "노우리",
    pubDate: "2024-05-11T10:30:00Z",
    link: "https://www.sedaily.com/example1",
  },
  {
    title: "LG, 차세대 배터리 기술 개발 발표",
    author: "김기자",
    pubDate: "2024-05-11T09:15:00Z",
    link: "https://www.sedaily.com/example2",
  },
  {
    title: "SK하이닉스, 새로운 반도체 공장 증설 계획",
    author: "이기자",
    pubDate: "2024-05-10T16:45:00Z",
    link: "https://www.sedaily.com/example3",
  },
];

// 시연을 위한 예시 데이터 추가
exampleNewsItems.forEach((item) => {
  addNewsItem(item);
});

// 시뮬레이션: 1분마다 새 뉴스 추가 (테스트용)
// 실제 구현에서는 n8n에서 데이터를 받는 코드로 대체
let counter = 0;
setInterval(() => {
  const now = new Date();
  counter++;
  const newNews = {
    title: `새로운 뉴스 헤드라인 ${counter}: ${now.toLocaleTimeString()}`,
    author: "자동 생성",
    pubDate: now.toISOString(),
    link:
      "https://www.sedaily.com/example" + (exampleNewsItems.length + counter),
  };
  receiveNewsFromN8N(newNews);
}, 60000); // 60초마다 새 뉴스 추가 (테스트용)

// n8n에서 데이터를 받는 API 엔드포인트 예시
// 실제 구현에서는 웹소켓이나 서버-센트 이벤트(SSE) 등을 사용할 수 있음
window.receiveNewsFromAPI = function (newsData) {
  receiveNewsFromN8N(newsData);
};
