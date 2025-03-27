"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AddForumPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(""); 
  const [tags, setTags] = useState<string>(""); 
  const [authorID, setAuthorID] = useState(""); 
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
            setAuthor(`${data.claims.FirstName} ${data.claims.LastName}`);
            setAuthorID(data.claims.UserType);
            console.log('Author:', `${data.claims.FirstName} ${data.claims.LastName}`);
            console.log('AuthorID:', data.claims.UserType);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if author and authorID are set
    if (!author || !authorID) {
      alert("Author and AuthorID are required");
      return;
    }

    // Convert comma-separated tags to an array
    const tagsArray = tags.split(",").map((tag) => tag.trim());

    // Update the payload to match the model field names
    const newForum = { 
      title, 
      content, 
      author, 
      author_id: authorID, // Changed authorID to author_id to match the model
      tags: tagsArray 
    };

    // Log the payload to ensure it's correct
    console.log('Request Payload:', newForum);

    try {
      const response = await fetch("http://127.0.0.1:8000/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newForum),
      });
      
      const responseData = await response.json();
      
      console.log("Response data:", responseData); // Log the entire response
      
      if (response.status === 200 && responseData.status === "success") {
        alert("Forum added successfully!");
        router.push("/forumPage"); // Redirect back to the forum page
      } else {
        alert(`${responseData.msg}`);
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
            <label htmlFor="tags" className="block font-medium">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="e.g., golang, ai, backend"
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
