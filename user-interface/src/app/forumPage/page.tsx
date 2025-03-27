"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb"; 

const ForumPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);  
  const postsPerPage = 10;  

  useEffect(() => {
    fetch("http://127.0.0.1:8000/blog")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Data:", data);
        setBlogs(data.blogrecords); 
        setLoading(false); 
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setLoading(false); 
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

 
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogs.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(blogs.length / postsPerPage);

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

  return (
    <>
      <Breadcrumb
        pageName="Forums page"
        description="Browse through the latest blog posts."
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          {/* Add the button to navigate to Add Forum page */}
          <div className="mb-6">
            <Link
              href="forum-add"
              className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Add a Forum
            </Link>
          </div>

          <div className="flex flex-col space-y-6">
            {" "}
            {/* Change to flex-column */}
            {currentPosts.length > 0 ? (
              currentPosts.map((blog) => (
                <div key={blog.id} className="w-full px-4 md:w-full">
                  {" "}
                  {/* Ensure full width */}
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
                      className={`flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white ${currentPage === index + 1 ? "bg-primary text-white" : ""}`}
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
