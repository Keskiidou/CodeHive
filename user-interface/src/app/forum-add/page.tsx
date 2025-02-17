"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const AddForumPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newForum = { title, content, author };

    try {
      const response = await fetch("http://127.0.0.1:8000/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newForum),
      });

      if (response.ok) {
        alert("Forum added successfully!");
        router.push("/forumPage");  // Redirect back to the forum page
      } else {
        alert("Failed to add forum");
      }
    } catch (error) {
      console.error("Error adding forum:", error);
    }
  };

  return (
    <section className="pb-[120px] pt-[120px]">
      <div className="container">
        <h1 className="text-2xl font-bold mb-4">Add a Forum</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block font-medium">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block font-medium">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="author" className="block font-medium">Author</label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddForumPage;
