import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Routes from "./routes";

// Hàm fetch danh sách posts
const fetchPosts = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  return res.json();
};

// Hàm tạo post mới (API giả)
const createPost = async (newPost) => {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPost),
  });
  return res.json();
};

export default function App() {
  const queryClient = useQueryClient(); // để invalid cache

  // State để nhập dữ liệu
  const [title, setTitle] = useState("");

  // Query: lấy danh sách posts
  const { data, error, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  // Mutation: thêm post mới
  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      // Cách 1: invalid cache -> refetch lại từ server
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      // Cách 2 (thay thế): cập nhật cache ngay lập tức mà không cần refetch
      queryClient.setQueryData(["posts"], (old) => [...old, data]);
    },
  });

  if (isLoading) return <p>⏳ Đang tải...</p>;
  if (error) return <p>❌ Lỗi: {error.message}</p>;

  return (
    <>
      <title>React Query Demo</title>
      {/* <link
        id="favicon"
        rel="icon"
        href={WebIcon}
        type="image/png"
        sizes="16x16"
      /> */}
      <Routes />
    </>
  );
}
