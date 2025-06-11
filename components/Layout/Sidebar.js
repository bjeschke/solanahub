import { useState } from "react";
import NetworkStatus from "../NetworkStatus";

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) {
  const menuItems = [
    { id: "create", label: "Create Token", icon: "📝" },
    { id: "overview", label: "Token Overview", icon: "📊" },
    { id: "tokens", label: "My Tokens", icon: "💎" },
    { id: "history", label: "Transaction History", icon: "📜" },
    { id: "authority", label: "Token Authority", icon: "🔑" },
    { id: "manage", label: "Manage Authority", icon: "⚙️" },
    { id: "revokeAuthority", label: "Revoke Authority", icon: "⚙️" },
    { id: "tokenList", label: "Token Metadata", icon: "📋" },
    { id: "metadataViewer", label: "Metadata Viewer", icon: "📋" },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-150 ease-in-out border-r border-gray-200 dark:border-gray-700 z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-start">
            <div className="h-8 w-auto ">
              <img
                src="/light-logo.jpg"
                alt="SPL Token Creator"
                className="h-auto w-48   block dark:hidden"
              />
              <img
                src="/dark-logo.jpg"
                alt="SPL Token Creator"
                className="h-auto w-48  hidden dark:block"
              />
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-2 rounded-lg text-left ${
                activeTab === item.id
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
