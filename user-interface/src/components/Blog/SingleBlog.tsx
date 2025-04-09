import { Blog } from "@/types/blog";
import Link from "next/link";
import { FaMessage } from "react-icons/fa6";

const SingleBlog = ({ blog }: { blog: Blog }) => {

  const { title, paragraph, tags } = blog;
  return (
    <div
       className="group relative overflow-hidden rounded-sm bg-white shadow-one duration-300 hover:shadow-two dark:bg-dark dark:hover:shadow-gray-dark">
        <Link
          href="/blog-details"
          className="relative block aspect-[37/22] w-full"
        >
          <span className="absolute right-6 top-6 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white">
            {tags[0]}
          </span>
          {/* Use a static image always */}
          <img
            src="/images/ChatGPT Image Mar 30, 2025, 11_07_42 PM.png" // Static image you always want to use
            alt="image"
            className="w-full h-auto" // Ensure proper image scaling
          />
        </Link>
        <div className="p-6 sm:p-8 md:px-6 md:py-8 lg:p-8 xl:px-5 xl:py-8 2xl:p-8">
          <h3>
            <Link
              href="/blog-details"
              className="mb-4 block text-xl font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl"
            >
              {title}
            </Link>
          </h3>
          <p className="mb-6 border-b border-body-color border-opacity-10 pb-6 text-base font-medium text-body-color dark:border-white dark:border-opacity-10">
            {paragraph}
          </p>
          <div className="flex justify-center">
            <button className="px-6 py-2 text-white bg-primary rounded-md hover:bg-opacity-90 transition">
              Contact Now
            </button>

          </div>
          {/* Message Icon */}
          <Link
            href="/blog-details"
            className="mb-4 block text-xl font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl"
          >
            <FaMessage className="inline-block mr-2" />
          </Link>

        </div>
      </div>
   
  );
};

export default SingleBlog;
