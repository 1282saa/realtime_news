import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";
import { format, parseISO } from "date-fns";
import AdminNewsForm from "../components/AdminNewsForm";
import ThemeSwitch from "../components/ThemeSwitch";
import { FiHome, FiRefreshCw } from "react-icons/fi";

// 데이터 가져오기 함수
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Admin() {
  // SWR로 뉴스 데이터 가져오기
  const { data, error, isLoading, mutate } = useSWR("/api/news", fetcher);

  // 새로운 뉴스 추가 후 데이터 새로고침
  const handleNewsAdded = () => {
    mutate();
  };

  // 수동으로 새로고침
  const refreshData = () => {
    mutate();
  };

  return (
    <div className="container">
      <Head>
        <title>관리자 페이지 - 실시간 뉴스 피드</title>
        <meta name="description" content="뉴스 피드 관리자 페이지" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-primary-light dark:text-primary-dark">
            <FiHome className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-primary-light dark:text-primary-dark">
            관리자 페이지
          </h1>
        </div>
        <ThemeSwitch />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <AdminNewsForm onNewsAdded={handleNewsAdded} />
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">뉴스 목록</h2>
              <button
                onClick={refreshData}
                className="flex items-center gap-1 text-sm py-1 px-3 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>새로고침</span>
              </button>
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        제목
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        기자
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        발행일시
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data?.news && data.news.length > 0 ? (
                      data.news.map((news, index) => (
                        <tr key={`${news.pubDate}-${index}`}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <a
                              href={news.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-light dark:text-primary-dark hover:underline"
                            >
                              {news.title}
                            </a>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {news.author}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {format(parseISO(news.pubDate), "yyyy-MM-dd HH:mm")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-center">
                          표시할 뉴스가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-10 py-5 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2025 실시간 뉴스 피드 관리자</p>
      </footer>
    </div>
  );
}
