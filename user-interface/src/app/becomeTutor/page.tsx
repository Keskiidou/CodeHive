"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BecomeTutor = () => {
  const [userId, setUserId] = useState("");
  const [skills, setSkills] = useState("");
  const [motivation, setMotivation] = useState("");
  const [availability, setAvailability] = useState("");
  const [teachingExperience, setTeachingExperience] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

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
          const uid = data.claims.UserType || data.claims.id;
          if (!uid) {
            setError("User id not found in token claims.");
          } else {
            setUserId(uid);
            console.log("User ID:", uid);
          }
        } else {
          setError("Invalid token.");
        }
      })
      .catch((err) => {
        console.error("Error validating token:", err);
        setError("Error validating token.");
      });
  }, []);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!skills) {
      setError("Please enter your skills.");
      return;
    }

    if (!userId) {
      setError("User ID not available.");
      return;
    }

    const skillsArray = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authorization token found.");
      return;
    }

    try {
      const response = await fetch("http://localhost:9000/sendRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({
          user_id: userId,
          skills: skillsArray,
          motivation,
          availability,
          teaching_experience: teachingExperience,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Tutor request submitted successfully!");
        console.log("Tutor request sent:", data);

        // Clear form
        setSkills("");
        setMotivation("");
        setAvailability("");
        setTeachingExperience("");
      } else {
        setError(data.error || "Failed to submit tutor request.");
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      setError("An error occurred while sending the tutor request.");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-800 dark:to-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
            Become a Tutor
          </h1>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

          <form onSubmit={handleSubmitRequest}>
            <div className="mb-4">
              <label htmlFor="skills" className="block text-gray-700 dark:text-gray-300">
                Enter your skills (separated by commas)
              </label>
              <textarea
                id="skills"
                name="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="motivation" className="block text-gray-700 dark:text-gray-300">
                Why do you want to become a tutor?
              </label>
              <textarea
                id="motivation"
                name="motivation"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="availability" className="block text-gray-700 dark:text-gray-300">
                What is your availability for tutoring?
              </label>
              <textarea
                id="availability"
                name="availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="teachingExperience" className="block text-gray-700 dark:text-gray-300">
                Do you have any prior teaching experience? If yes, please describe.
              </label>
              <textarea
                id="teachingExperience"
                name="teachingExperience"
                value={teachingExperience}
                onChange={(e) => setTeachingExperience(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
            >
              Submit Tutor Request
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BecomeTutor;
