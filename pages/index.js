import { useState, useEffect } from "react";
import Head from "next/head";
import useSWR from "swr";
import { format } from "date-fns";
import ThemeSwitch from "../components/ThemeSwitch";
import NewsCard from "../components/NewsCard";
import { FiDownload, FiRefreshCw } from "react-icons/fi";

// 데이터 가져오기 함수
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const [lastUpdate, setLastUpdate] = useState(null);

  // SWR로 뉴스 데이터 가져오기
  const { data, error, isLoading, mutate } = useSWR("/api/news", fetcher, {
    refreshInterval: 60000, // 1분마다 자동으로 갱신
    onSuccess: () => {
      setLastUpdate(new Date());
    },
  });

  // 수동으로 새로고침
  const refreshData = () => {
    mutate();
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 초기 시간 설정
    setLastUpdate(new Date());
  }, []);

  // 백업 다운로드
  const handleBackup = async () => {
    try {
      window.open("/api/backup", "_blank");
    } catch (error) {
      console.error("백업 오류:", error);
      alert("백업 파일 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container">
      <Head>
        <title>실시간 뉴스 피드</title>
        <meta name="description" content="실시간으로 업데이트되는 뉴스 피드" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary-light dark:text-primary-dark">
          오늘의 실시간 뉴스
        </h1>
        <ThemeSwitch />
      </header>

      <main>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {lastUpdate &&
              `마지막 업데이트: ${format(lastUpdate, "yyyy-MM-dd HH:mm:ss")}`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="flex items-center gap-1 text-sm py-1 px-3 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>새로고침</span>
            </button>
            <button
              onClick={handleBackup}
              className="flex items-center gap-1 text-sm py-1 px-3 rounded bg-primary-light dark:bg-primary-dark text-white"
            >
              <FiDownload className="w-4 h-4" />
              <span>백업하기</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500 dark:text-red-400">
            데이터 로딩 중 오류가 발생했습니다. 새로고침을 시도해주세요.
          </div>
        ) : (
          <div className="space-y-5">
            {data?.news && data.news.length > 0 ? (
              data.news.map((news, index) => (
                <NewsCard key={`${news.pubDate}-${index}`} news={news} />
              ))
            ) : (
              <div className="p-4 text-center">표시할 뉴스가 없습니다.</div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-10 py-5 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2024 실시간 뉴스 피드</p>
      </footer>
    </div>
  );
}
