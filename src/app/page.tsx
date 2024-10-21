"use client";
import { AdSchema, TargetingSchema } from "@/lib/schema";
import React from "react";
import { z } from "zod";

const ResponseSchema = z.object({
  adCreative: z.array(AdSchema),
  targeting: z.array(TargetingSchema),
});

export default function Home() {
  const [url, setUrl] = React.useState("");
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState<z.infer<typeof ResponseSchema> | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/process-page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        setError("Failed to process URL");
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      setUrl("");
      setData(data);
      setIsLoading(false);
      // Handle the response data as needed
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setError((error as Error).message);
      // Handle the error as needed
    }
  };

  return (
    <div className="text-black grid grid-rows-[20px_auto_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center space-y-4 w-full max-w-md">
        <input
          type="text"
          name="url"
          placeholder="Enter URL"
          onChange={(e) => setUrl(e.target.value)}
          value={url}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Submit
        </button>
      </div>
      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="flex flex-col w-full max-w-md">
        {data && (
          <>
            <h3 className="font-semibold mt-4 mb-2">Ad Variants:</h3>
            <div className="flex gap-4">
              {data.adCreative.map((creative, index) => (
                <div key={creative.name} className="flex-1">
                  <h4 className="font-semibold mb-2 text-white">
                    Variant {index + 1}
                  </h4>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-white mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={creative.name}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-white mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={creative.headline}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-white mb-1">
                      Description
                    </label>
                    <textarea
                      value={creative.description}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none"
                      rows={4}
                    />
                  </div>
                </div>
              ))}
            </div>
            <h3 className="font-semibold mt-4 mb-2 text-white">
              Targeting Groups:
            </h3>
            <ul className="list-disc pl-5 text-white">
              {data.targeting.map((target) => (
                <li key={target.urn}>{target.name}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
