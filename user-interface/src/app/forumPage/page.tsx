"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb"; 

const ForumPage = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;  

  useEffect(() => {
    fetch("http://127.0.0.1:8000/blog")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Data:", data);
        // Sort blogs from earliest to latest
        const sortedBlogs = data.blogrecords.sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setBlogs(sortedBlogs); 
        setLoading(false); 
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setLoading(false); 
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  // Filter blogs based on search query (searching in title or tags)
  const filteredBlogs = blogs.filter((blog) => {
    const searchTerm = search.toLowerCase();
    const titleMatch = blog.title.toLowerCase().includes(searchTerm);
    const tagsMatch =
      blog.tags &&
      Array.isArray(blog.tags) &&
      blog.tags.join(" ").toLowerCase().includes(searchTerm);
    return titleMatch || tagsMatch;
  });

  // Pagination logic on filtered blogs
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

  // Reset pagination on search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      <Breadcrumb
        pageName="Forums page"
        description="Browse through the latest blog posts."
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          {/* Container for search bar and add forum button */}
          <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
            {/* Search Bar on the left */}
            <input
              type="text"
              placeholder="Search by title or tags..."
              value={search}
              onChange={handleSearchChange}
              className="w-full md:w-1/3 px-4 py-2 border rounded-md mb-4 md:mb-0"
            />
            {/* Add Forum Button on the right */}
            <Link
              href="forum-add"
              className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Add a Forum
            </Link>
          </div>

          <div className="flex flex-col space-y-6">
            {currentPosts.length > 0 ? (
              currentPosts.map((blog) => (
                <div key={blog.id} className="w-full px-4 md:w-full">
                  <div className="rounded-lg border p-4 shadow">
                    <h2 className="text-xl font-semibold">
                      <Link
                        href={`/${blog.id}/`}
                        className="text-blue-600 hover:underline"
                      >
                        {blog.title || "Untitled Blog"}
                      </Link>
                    </h2>
                    <p className="text-gray-600">
                      By {blog.author || "Unknown"} -{" "}
                      {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-gray-700">
                      {blog.content.substring(0, 150)}...
                    </p>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium">Tags: </span>
                        {blog.tags.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No blogs available.</p>
            )}
          </div>

          <div className="-mx-4 flex flex-wrap" data-wow-delay=".15s">
            <div className="w-full px-4">
              <ul className="flex items-center justify-center pt-8">
                <li className="mx-1">
                  <button
                    onClick={handlePrevPage}
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index} className="mx-1">
                    <button
                      onClick={() => setCurrentPage(index + 1)}
                      className={`flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white ${
                        currentPage === index + 1 ? "bg-primary text-white" : ""
                      }`}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className="mx-1">
                  <button
                    onClick={handleNextPage}
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForumPage;
