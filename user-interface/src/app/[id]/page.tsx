"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";

const BlogPostPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState("");
  const [responses, setResponses] = useState([]);
  const [author, setAuthor] = useState("");
  const [authorID, setAuthorID] = useState("");

  // Fetch blog and responses data
  useEffect(() => {
    if (!id) return;

    const fetchBlogData = async () => {
      try {
        const blogRes = await fetch(`http://127.0.0.1:8000/blog/${id}`);
        if (!blogRes.ok) throw new Error("Failed to fetch blog post");
        const blogData = await blogRes.json();
        setBlog(blogData.blog || null);

        const responseRes = await fetch(`http://127.0.0.1:8000/response/${id}`);
        if (!responseRes.ok) throw new Error("Failed to fetch responses");
        const responseData = await responseRes.json();
        setResponses(responseData.responses || []);
      } catch (error) {
        console.error("Error fetching blog or responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [id]);

  // Fetch author info from token
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("http://localhost:9000/users/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Token is valid") {
            setAuthor(`${data.claims.FirstName} ${data.claims.LastName}`);
            setAuthorID(data.claims.UserType);
          } else {
            alert("Invalid token");
          }
        })
        .catch((error) => {
          console.error("Error validating token:", error);
          alert("Error validating token");
        });
    } else {
      alert("No token found");
    }
  }, []);

  // Handle response submission
  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    const newResponse = {
      blog_id: Number(id),
      content: responseText,
      author: author,
      author_id: authorID,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/response/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResponse),
      });

      if (res.ok) {
        const data = await res.json();
        window.location.reload();
        setResponses((prev) => [...prev, data]);
        setResponseText("");
      } else {
        const errorData = await res.json();
        console.error("Failed to submit response:", errorData);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-800 dark:text-gray-200">Loading...</p>;

  return (
    <>
      <Breadcrumb
        pageName={blog?.title || "Blog Post"}
        description="Read the full blog post and share your thoughts."
      />

      {/* Blog Header Banner */}
      <section className="bg-gradient-to-r from-green-400 to-blue-500 dark:from-green-700 dark:to-blue-700 py-8">
        <div className="container mx-auto px-4 text-center">
          
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 py-10">
        <div className="container mx-auto px-4">
          {/* Blog Content */}
          <div className="mb-10 w-full md:w-3/4 lg:w-2/3 mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl">
          <h1 className="text-5xl font-extrabold text-white">
            {blog?.title || "Untitled Blog"}
          </h1>
          <p className="mt-2 text-lg text-gray-100">
            By {blog?.author || author} | {blog?.created_at ? new Date(blog.created_at).toLocaleDateString() : "Unknown"}
          </p>
          <div className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
              {blog?.content}
            </div>
          </div>
          

          {/* Responses Section */}
          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Responses</h2>
            <div className="space-y-6">
              {responses.length > 0 ? (
                responses.map((resp, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-600"
                  >
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {resp.author}
                    </p>
                    <hr className="mb-2 border-gray-300 dark:border-gray-600" />
                    <p className="text-gray-800 dark:text-gray-200">{resp.content}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      Responded on {resp.created_at ? new Date(resp.created_at).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No responses yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>

          {/* Response Form */}
          <div className="w-full md:w-3/4 lg:w-2/3 mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Write a Response</h2>
            <form onSubmit={handleResponseSubmit}>
              <textarea
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="4"
                placeholder="Write your response here..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              ></textarea>
              <button
                type="submit"
                className="mt-4 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition duration-300"
              >
                Submit Response
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPostPage;
