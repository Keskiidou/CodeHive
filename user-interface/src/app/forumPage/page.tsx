"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const ForumPage = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // State for tracking votes
  const [votes, setVotes] = useState<{ [key: string]: { upvotes: number, downvotes: number } }>({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/blog")
      .then((res) => res.json())
      .then((data) => {
        const sortedBlogs = data.blogrecords.sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setBlogs(sortedBlogs);

        // Initialize votes state
        const initialVotes = sortedBlogs.reduce((acc: any, blog: any) => {
          acc[blog.id] = { upvotes: 0, downvotes: 0 }; // Default votes
          return acc;
        }, {});
        setVotes(initialVotes);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-800 dark:text-gray-200">Loading...</p>;

  const filteredBlogs = blogs.filter((blog) => {
    const searchTerm = search.toLowerCase();
    const titleMatch = blog.title.toLowerCase().includes(searchTerm);
    const tagsMatch =
      blog.tags &&
      Array.isArray(blog.tags) &&
      blog.tags.join(" ").toLowerCase().includes(searchTerm);
    return titleMatch || tagsMatch;
  });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredBlogs.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Handle upvote
  const handleUpvote = (id: string) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [id]: {
        upvotes: prevVotes[id]?.upvotes + 1 || 1,
        downvotes: prevVotes[id]?.downvotes || 0,
      },
    }));
  };

  // Handle downvote
  const handleDownvote = (id: string) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [id]: {
        upvotes: prevVotes[id]?.upvotes || 0,
        downvotes: prevVotes[id]?.downvotes + 1 || 1,
      },
    }));
  };

  return (
    <>
      <Breadcrumb
        pageName="Forums"
        description="Browse through the latest blog posts."
      />

      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-white">Join the Conversation</h1>
          <p className="mt-4 text-lg text-gray-100">Discover insights, share your thoughts, and explore fresh ideas from our community.</p>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
            <input
              type="text"
              placeholder="Search by title or tags..."
              value={search}
              onChange={handleSearchChange}
              className="w-full md:w-1/3 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 md:mb-0"
            />
            <Link
              href="forum-add"
              className="inline-block rounded-md bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-white transition duration-300"
            >
              Add a Forum
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {currentPosts.length > 0 ? (
              currentPosts.map((blog) => (
                <div key={blog.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transform transition duration-500 hover:-translate-y-2 hover:shadow-2xl">
                  <h2 className="text-2xl font-bold mb-2">
                    <Link
                      href={`/${blog.id}/`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {blog.title || "Untitled Blog"}
                    </Link>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    By {blog.author || "Unknown"} - {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-4 text-gray-700 dark:text-gray-300">
                    {blog.content.substring(0, 150)}...
                  </p>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-800 dark:text-gray-200">Tags:</span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">{blog.tags.join(", ")}</span>
                    </div>
                  )}

                  {/* Vote Section */}
                  <div className="mt-4 flex items-center space-x-4">
                    <button
                      onClick={() => handleUpvote(blog.id)}
                      className="flex items-center text-green-500 hover:text-green-600"
                    >
                      <FaThumbsUp className="mr-2" />
                      {votes[blog.id]?.upvotes || 0}
                    </button>
                    <button
                      onClick={() => handleDownvote(blog.id)}
                      className="flex items-center text-red-500 hover:text-red-600"
                    >
                      <FaThumbsDown className="mr-2" />
                      {votes[blog.id]?.downvotes || 0}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center col-span-full text-gray-600 dark:text-gray-400">No blogs available.</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <ul className="flex items-center space-x-2">
                <li>
                  <button
                    onClick={handlePrevPage}
                    className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index}>
                    <button
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 rounded-md transition ${
                        currentPage === index + 1
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleNextPage}
                    className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ForumPage;
