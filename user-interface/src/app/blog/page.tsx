"use client";
import { useEffect, useState } from "react";
import SingleBlog from "@/components/Blog/SingleBlog";
import Breadcrumb from "@/components/Common/Breadcrumb";

const TutorsPage = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch("http://localhost:9000/users/getAllTutors");
        if (!response.ok) {
          throw new Error("Failed to fetch tutors");
        }
        const data = await response.json();
        setTutors(data.tutors);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  if (loading) return <p>Loading tutors...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <Breadcrumb
        pageName="Our Tutors"
        description="Explore our experienced tutors available for mentorship and guidance."
      />
      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            {tutors.map((tutor) => (
              <div
                key={tutor.user_id}
                className="w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3"
              >
                <SingleBlog
                  blog={{
                    id: tutor.user_id,
                    title: `${tutor.first_name} ${tutor.last_name}`,
                    image: "/default-profile.jpg", // Replace with actual tutor image if available
                    paragraph: `Expert in ${tutor.skills.join(", ")}`,
                    author: {
                      name: `${tutor.first_name} ${tutor.last_name}`,
                      image: "/default-profile.jpg", // Placeholder image
                      designation: "Tutor",
                    },
                    tags: ["Tutor"],
                    publishDate: "Available Now",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default TutorsPage;
