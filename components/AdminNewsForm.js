import { useState } from "react";
import { format } from "date-fns";

export default function AdminNewsForm({ onNewsAdded }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    link: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // 폼 데이터 유효성 검증
      if (!formData.title || !formData.author || !formData.link) {
        throw new Error("모든 필드를 입력해주세요.");
      }

      // ISO 형식의 날짜 문자열 생성
      const pubDate = new Date(
        `${formData.date}T${formData.time}`
      ).toISOString();

      // API 요청
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          link: formData.link,
          pubDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "뉴스 추가 중 오류가 발생했습니다.");
      }

      // 성공
      setSuccess("뉴스가 성공적으로 추가되었습니다.");
      setFormData({
        title: "",
        author: "",
        link: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
      });

      // 부모 컴포넌트에 알림
      if (onNewsAdded) {
        onNewsAdded();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">새 뉴스 추가</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            제목
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="author" className="block text-sm font-medium mb-1">
            기자
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="link" className="block text-sm font-medium mb-1">
            링크
          </label>
          <input
            type="url"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            placeholder="https://..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              발행일
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-1">
              발행시간
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-light dark:bg-primary-dark text-white p-2 rounded hover:opacity-90 disabled:opacity-70"
        >
          {isSubmitting ? "처리 중..." : "뉴스 추가"}
        </button>
      </form>
    </div>
  );
}
