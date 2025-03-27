"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";

const BlogPostPage = () => {
  const { id } = useParams(); // Get the dynamic 'id' from the URL
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`http://127.0.0.1:8000/blog/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setBlog(data.blog);  // Assuming the response contains 'blog' object
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching blog data:", error);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>
      <Breadcrumb
        pageName={blog?.title || "Blog Post"}
        description="Read the full blog post."
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="w-full px-4">
            <div className="p-4 border rounded-lg shadow">
              <h1 className="text-3xl font-semibold">{blog?.title}</h1>
              <p className="text-gray-600">By {blog?.author} - {new Date(blog?.created_at).toLocaleDateString()}</p>
              <div className="mt-4 text-gray-700">
                <p>{blog?.content}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPostPage;
