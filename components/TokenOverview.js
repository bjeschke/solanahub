import { useState, useEffect } from "react";

export default function TokenOverview() {
  const [activeTab, setActiveTab] = useState("create");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socials, setSocials] = useState({
    twitter: "",
    telegram: "",
    discord: "",
    github: "",
  });
  const [roadmap, setRoadmap] = useState([{ phase: "", description: "" }]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [savedOverviews, setSavedOverviews] = useState([]);

  useEffect(() => {
    // Load saved overviews on component mount
    const saved = localStorage.getItem("tokenOverviews");
    if (saved) {
      setSavedOverviews(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const tokenOverview = {
        id: Date.now(), // Using timestamp as unique ID
        websiteUrl,
        socials,
        roadmap,
        createdAt: new Date().toISOString(),
      };

      const existingOverviews = JSON.parse(
        localStorage.getItem("tokenOverviews") || "[]"
      );
      const updatedOverviews = [...existingOverviews, tokenOverview];

      localStorage.setItem("tokenOverviews", JSON.stringify(updatedOverviews));
      setSavedOverviews(updatedOverviews);
      setSuccess("Token overview saved successfully!");

      // Reset form
      setWebsiteUrl("");
      setSocials({
        twitter: "",
        telegram: "",
        discord: "",
        github: "",
      });
      setRoadmap([{ phase: "", description: "" }]);
    } catch (err) {
      setError("Error saving token overview: " + err.message);
    }
  };

  const addRoadmapPhase = () => {
    setRoadmap([...roadmap, { phase: "", description: "" }]);
  };

  const deleteOverview = (id) => {
    const updatedOverviews = savedOverviews.filter(
      (overview) => overview.id !== id
    );
    localStorage.setItem("tokenOverviews", JSON.stringify(updatedOverviews));
    setSavedOverviews(updatedOverviews);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab("create")}
            className={`${
              activeTab === "create"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            Create Overview
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`${
              activeTab === "saved"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            Saved Overviews
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "create" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Existing form fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         text-gray-900 dark:text-white bg-white dark:bg-gray-700
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://your-token-website.com"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Social Links
              </h3>
              {Object.keys(socials).map((platform) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    value={socials[platform]}
                    onChange={(e) =>
                      setSocials({ ...socials, [platform]: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         text-gray-900 dark:text-white bg-white dark:bg-gray-700
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`https://${platform}.com/your-handle`}
                  />
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Roadmap
              </h3>
              {roadmap.map((phase, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phase
                      </label>
                      <input
                        type="text"
                        value={phase.phase}
                        onChange={(e) => {
                          const newRoadmap = [...roadmap];
                          newRoadmap[index].phase = e.target.value;
                          setRoadmap(newRoadmap);
                        }}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                        text-gray-900 dark:text-white bg-white dark:bg-gray-700
                        focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        value={phase.description}
                        onChange={(e) => {
                          const newRoadmap = [...roadmap];
                          newRoadmap[index].description = e.target.value;
                          setRoadmap(newRoadmap);
                        }}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         text-gray-900 dark:text-white bg-white dark:bg-gray-700
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addRoadmapPhase}
                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Add Phase
              </button>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Overview
            </button>

            {success && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  {success}
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-6">
            {savedOverviews.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No saved overviews yet
              </p>
            ) : (
              savedOverviews.map((overview) => (
                <div
                  key={overview.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Website: {overview.websiteUrl}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created:{" "}
                        {new Date(overview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteOverview(overview.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">
                        Social Links
                      </h4>
                      {Object.entries(overview.socials).map(
                        ([platform, link]) =>
                          link && (
                            <p
                              key={platform}
                              className="text-sm text-gray-600 dark:text-gray-400"
                            >
                              {platform}: {link}
                            </p>
                          )
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">
                        Roadmap
                      </h4>
                      {overview.roadmap.map((phase, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 dark:text-gray-400"
                        >
                          <p className="font-medium">{phase.phase}</p>
                          <p>{phase.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
