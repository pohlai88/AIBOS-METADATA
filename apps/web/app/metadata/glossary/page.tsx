"use client";

import { useState } from "react";
import { Search, BookOpen, Tag } from "lucide-react";

/**
 * Metadata Glossary Page
 *
 * TODO: Add your metadata terms here
 */

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // TODO: Replace with your actual metadata
  const glossaryTerms = [
    // Add your terms here
    // Example format:
    // {
    //   id: "term-1",
    //   term: "Your Term",
    //   definition: "Definition of your term",
    //   category: "Category",
    //   tags: ["tag1", "tag2"]
    // }
  ];

  const filteredTerms = glossaryTerms.filter(
    (item) =>
      item.term?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              Metadata Glossary
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            Your centralized metadata definitions and terms
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>
        </div>

        {/* Terms List */}
        <div className="space-y-4">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {glossaryTerms.length === 0
                  ? "No metadata terms defined yet. Add your terms to get started."
                  : "No terms match your search."}
              </p>
            </div>
          ) : (
            filteredTerms.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {item.term}
                  </h3>
                  {item.category && (
                    <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                      {item.category}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 mb-3">{item.definition}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
