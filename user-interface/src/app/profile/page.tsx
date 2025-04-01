"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link component from Next.js


const ProfilePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authorID, setAuthorID] = useState("");
  const [userInfo, setUserInfo] = useState({ firstName: "", lastName: "", email: "" });
  
  const router = useRouter();

  // Validate token and fetch user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:9000/users/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Token is valid") {
            const { FirstName, LastName, Email, UserType } = data.claims;
            setUserInfo({ firstName: FirstName, lastName: LastName, email: Email });
            setAuthorID(UserType);
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

  // Fetch blogs by authorID
  useEffect(() => {
    if (authorID) {
      fetch(`http://127.0.0.1:8000/blogs/author/${authorID}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            setBlogs(data.blogs);
          } else {
            setError("No blogs found or error occurred");
          }
        })
        .catch((error) => {
          console.error("Error fetching blogs:", error);
          setError("An error occurred while fetching blogs");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [authorID]);

  const handleDelete = async (blogId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
    if (confirmDelete) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/blogs/${blogId}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (response.status === 200 && data.status === "success") {
          alert("Blog deleted successfully!");
          setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== blogId));
        } else {
          alert("Failed to delete the blog");
        }
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("An error occurred while deleting the blog");
      }
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-800 dark:to-gray-900 text-white py-12">
      {/* Profile Hero Section */}
      <div className="container mx-auto px-4 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white">
            {userInfo.firstName.charAt(0)}
            {userInfo.lastName.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {userInfo.firstName} {userInfo.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{userInfo.email}</p>
          </div>
          <Link href="/becomeTutor">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
              Become a Tutor
            </button>
          </Link>
        </div>
      </div>

      {/* Blogs Section */}
      <div className="container mx-auto px-4">
        {loading && (
          <div className="flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          </div>
        )}
        {error && <p className="text-red-300 text-center">{error}</p>}
        {blogs.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition duration-500 hover:scale-105"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {blog.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {blog.content.substring(0, 100)}...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Tags: {blog.tags.join(", ")}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  Created on: {new Date(blog.created_at).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-300"
                >
                  Delete Blog
                </button>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-center text-gray-200">No blogs found.</p>
        )}
      </div>
    </section>
  );
};

export default ProfilePage;
