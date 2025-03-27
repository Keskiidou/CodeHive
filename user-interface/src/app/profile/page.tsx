"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authorID, setAuthorID] = useState("");
  const [userInfo, setUserInfo] = useState({ firstName: "", lastName: "", email: "" });
  const router = useRouter();

  // Validate the token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Validate token using the API
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
            const { FirstName, LastName, Email, UserType } = data.claims;
            setUserInfo({ firstName: FirstName, lastName: LastName, email: Email });
            setAuthorID(UserType); // Set the authorID from the validated token
            console.log('User Info:', data.claims);
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

  useEffect(() => {
    if (authorID) {
      // Fetch blogs by authorID once the authorID is set
      fetch(`http://127.0.0.1:8000/blogs/author/${authorID}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            setBlogs(data.blogs); // Assuming the API returns a list of blogs
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
    <section className="pb-[120px] pt-[120px]">
      <div className="container">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

        {/* Display user information */}
        <div className="mb-6">
          <p className="text-lg">Name: {userInfo.firstName} {userInfo.lastName}</p>
          <p className="text-lg">Email: {userInfo.email}</p>
        </div>

        {loading && <p>Loading blogs...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {blogs.length > 0 ? (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div key={blog.id} className="border p-4 rounded-md shadow-md">
                <h2 className="text-xl font-semibold">{blog.title}</h2>
                <p>{blog.content}</p>
                <p className="mt-2 text-gray-500">
                  Tags: {blog.tags.join(", ")}
                </p>
                <p className="mt-2 text-gray-400 text-sm">
                  Created on: {new Date(blog.created_at).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Blog
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No blogs found.</p>
        )}
      </div>
    </section>
  );
};

export default ProfilePage;
