"use client";

import React, { useEffect } from "react";
import { useUserBehavior } from "@/hooks/useUserBehavior";

const PageContent = () => {
  const { results, processResults } = useUserBehavior({
    processTime: 30,
    processData: (data) => {
      // Custom processing logic
      console.log("User behavior data:", data);
      // You could send this to an analytics service, etc.
    },
  });
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full py-4 bg-gray-800 text-white text-center">
        <h1 className="text-3xl font-bold">Apple Products Sales</h1>
      </header>
      <section className="w-full py-8 text-center">
        <button
          onClick={processResults}
          className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-300"
        >
          Show Results
        </button>
      </section>
      {/* <section className="w-full bg-gray-100 text-center">
        <img
          src="https://images.squarespace-cdn.com/content/v1/5e949a92e17d55230cd1d44f/1631543879420-L2AEERO82XWLK5YQ9W6Z/invite+Image.png?format=2500w"
          alt="Banner"
          className="mx-auto w-full h-full"
        />
      </section> */}

      <section className="w-full py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">About Us</h2>
        <p className="max-w-2xl mx-auto">
          We are dedicated to providing the best Apple products at the most
          competitive prices. Our team is passionate about technology and
          customer satisfaction.
        </p>
      </section>

      <section className="w-full py-8 bg-gray-100 text-center text-black">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <form className="max-w-md mx-auto space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full p-2 border border-gray-300 rounded text-black"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded text-black"
          />
          <textarea
            placeholder="Message"
            className="w-full p-2 border border-gray-300 rounded text-black"
            rows={4}
          ></textarea>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded"
          >
            Send
          </button>
        </form>
      </section>

      <footer className="w-full py-4 bg-gray-800 text-white text-center">
        <p>&copy; 2023 Apple Products Sales. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PageContent;
