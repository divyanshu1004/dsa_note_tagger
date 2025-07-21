import React, { useState, useEffect } from "react";
import {
  Search,
  Tag,
  Plus,
  X,
  Save,
  FileText,
  Edit3,
  Check,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";

// Trie Data Structure Implementation
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.tag = null;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, tag) {
    let current = this.root;
    for (let char of word.toLowerCase()) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
    current.tag = tag;
  }

  search(word) {
    let current = this.root;
    for (let char of word.toLowerCase()) {
      if (!current.children[char]) {
        return null;
      }
      current = current.children[char];
    }
    return current.isEndOfWord ? current.tag : null;
  }

  searchPrefix(prefix) {
    let current = this.root;
    for (let char of prefix.toLowerCase()) {
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }
    return this.getAllWords(current, prefix);
  }

  getAllWords(node, prefix) {
    let words = [];
    if (node.isEndOfWord) {
      words.push({ word: prefix, tag: node.tag });
    }
    for (let char in node.children) {
      words.push(...this.getAllWords(node.children[char], prefix + char));
    }
    return words;
  }
}

// NLP Processing Functions
class NLPProcessor {
  static stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "shall",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
  ]);

  static tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 0);
  }

  static removeStopWords(tokens) {
    return tokens.filter((token) => !this.stopWords.has(token));
  }

  static stem(word) {
    // Simple stemming - remove common suffixes
    const suffixes = [
      "ing",
      "ed",
      "er",
      "est",
      "ly",
      "tion",
      "ness",
      "ment",
      "s",
    ];
    let stemmed = word;

    for (let suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        stemmed = word.slice(0, -suffix.length);
        break;
      }
    }
    return stemmed;
  }

  static preprocessText(text) {
    const tokens = this.tokenize(text);
    const filteredTokens = this.removeStopWords(tokens);
    return filteredTokens.map((token) => this.stem(token));
  }
}

// DSA Tag Dictionary
const dsaTags = {
  // Data Structures
  array: "Arrays",
  arrays: "Arrays",
  list: "Lists",
  lists: "Lists",
  linkedlist: "Linked Lists",
  linked: "Linked Lists",
  stack: "Stacks",
  stacks: "Stacks",
  queue: "Queues",
  queues: "Queues",
  tree: "Trees",
  trees: "Trees",
  binary: "Binary Trees",
  bst: "Binary Search Trees",
  heap: "Heaps",
  heaps: "Heaps",
  graph: "Graphs",
  graphs: "Graphs",
  hash: "Hash Tables",
  hashtable: "Hash Tables",
  hashmap: "Hash Tables",
  trie: "Tries",
  tries: "Tries",

  // Algorithms
  sort: "Sorting",
  sorting: "Sorting",
  search: "Searching",
  searching: "Searching",
  "binary search": "Binary Search",
  "linear search": "Linear Search",
  dfs: "Depth-First Search",
  bfs: "Breadth-First Search",
  dijkstra: "Dijkstra Algorithm",
  dynamic: "Dynamic Programming",
  dp: "Dynamic Programming",
  greedy: "Greedy Algorithms",
  backtrack: "Backtracking",
  backtracking: "Backtracking",
  recursion: "Recursion",
  recursive: "Recursion",
  iteration: "Iteration",
  iterative: "Iteration",

  // Complexity
  complexity: "Time Complexity",
  time: "Time Complexity",
  space: "Space Complexity",
  bigO: "Big O Notation",
  "O(n)": "Big O Notation",
  "O(1)": "Big O Notation",
  "O(log n)": "Big O Notation",

  // Specific Algorithms
  quicksort: "Quick Sort",
  mergesort: "Merge Sort",
  bubblesort: "Bubble Sort",
  insertionsort: "Insertion Sort",
  selectionsort: "Selection Sort",
  heapsort: "Heap Sort",
  radixsort: "Radix Sort",
};

const DSANoteTagger = () => {
  const [note, setNote] = useState("");
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [finalTags, setFinalTags] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [trie, setTrie] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // LocalStorage keys
  const STORAGE_KEYS = {
    NOTES: "dsa_notes",
    CUSTOM_TAGS: "dsa_custom_tags",
  };

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedNotesData = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (savedNotesData) {
        const parsedNotes = JSON.parse(savedNotesData);
        setSavedNotes(parsedNotes);
      }
    } catch (error) {
      console.error("Error loading saved notes:", error);
    }
  }, []);

  // Initialize Trie with DSA tags and custom tags
  useEffect(() => {
    const newTrie = new Trie();

    // Add default DSA tags
    Object.entries(dsaTags).forEach(([keyword, tag]) => {
      newTrie.insert(keyword, tag);
    });

    // Add custom tags from localStorage
    try {
      const customTagsData = localStorage.getItem(STORAGE_KEYS.CUSTOM_TAGS);
      if (customTagsData) {
        const customTags = JSON.parse(customTagsData);
        customTags.forEach((tag) => {
          newTrie.insert(tag.toLowerCase(), tag);
        });
      }
    } catch (error) {
      console.error("Error loading custom tags:", error);
    }

    setTrie(newTrie);
  }, []);

  // Save notes to localStorage whenever savedNotes changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(savedNotes));
    } catch (error) {
      console.error("Error saving notes to localStorage:", error);
    }
  }, [savedNotes]);

  // Save custom tags to localStorage
  const saveCustomTagToStorage = (tag) => {
    try {
      const existingCustomTags = localStorage.getItem(STORAGE_KEYS.CUSTOM_TAGS);
      let customTags = existingCustomTags ? JSON.parse(existingCustomTags) : [];

      if (!customTags.includes(tag)) {
        customTags.push(tag);
        localStorage.setItem(
          STORAGE_KEYS.CUSTOM_TAGS,
          JSON.stringify(customTags)
        );

        // Also add to trie for future searches
        if (trie) {
          trie.insert(tag.toLowerCase(), tag);
        }
      }
    } catch (error) {
      console.error("Error saving custom tag:", error);
    }
  };

  // Process note and generate tags
  const processNote = async () => {
    if (!note.trim() || !trie) return;

    setIsProcessing(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Preprocess the note
    const processedTokens = NLPProcessor.preprocessText(note);

    // Find matching tags
    const foundTags = new Set();

    // Check each token and its stems
    processedTokens.forEach((token) => {
      const tag = trie.search(token);
      if (tag) {
        foundTags.add(tag);
      }
    });

    // Also check for multi-word phrases
    const originalTokens = NLPProcessor.tokenize(note);
    for (let i = 0; i < originalTokens.length - 1; i++) {
      const phrase = originalTokens[i] + " " + originalTokens[i + 1];
      const tag = trie.search(phrase);
      if (tag) {
        foundTags.add(tag);
      }
    }

    setSuggestedTags(Array.from(foundTags));
    setFinalTags(Array.from(foundTags));
    setIsProcessing(false);
  };

  // Save note with tags
  const saveNote = () => {
    if (!note.trim()) return;

    const newNote = {
      id: editingNote ? editingNote.id : Date.now(),
      content: note,
      tags: finalTags,
      timestamp: editingNote
        ? editingNote.timestamp
        : new Date().toLocaleString(),
      lastModified: new Date().toLocaleString(),
    };

    if (editingNote) {
      setSavedNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? newNote : n))
      );
      setEditingNote(null);
    } else {
      setSavedNotes((prev) => [...prev, newNote]);
    }

    // Save any new custom tags to storage
    finalTags.forEach((tag) => {
      if (!Object.values(dsaTags).includes(tag)) {
        saveCustomTagToStorage(tag);
      }
    });

    // Reset form
    setNote("");
    setSuggestedTags([]);
    setFinalTags([]);
  };

  // Add custom tag
  const addCustomTag = () => {
    if (customTag.trim() && !finalTags.includes(customTag.trim())) {
      const newTag = customTag.trim();
      setFinalTags((prev) => [...prev, newTag]);
      setCustomTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFinalTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Delete note
  const deleteNote = (noteId) => {
    setSavedNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  // Edit note
  const editNote = (noteToEdit) => {
    setNote(noteToEdit.content);
    setFinalTags(noteToEdit.tags);
    setSuggestedTags(noteToEdit.tags);
    setEditingNote(noteToEdit);
  };

  // Clear all data
  const clearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all saved notes and custom tags? This action cannot be undone."
      )
    ) {
      setSavedNotes([]);
      setNote("");
      setSuggestedTags([]);
      setFinalTags([]);
      setEditingNote(null);
      localStorage.removeItem(STORAGE_KEYS.NOTES);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_TAGS);

      // Reinitialize trie with only default tags
      const newTrie = new Trie();
      Object.entries(dsaTags).forEach(([keyword, tag]) => {
        newTrie.insert(keyword, tag);
      });
      setTrie(newTrie);
    }
  };

  // Export notes as JSON
  const exportNotes = () => {
    try {
      const customTags = localStorage.getItem(STORAGE_KEYS.CUSTOM_TAGS);
      const exportData = {
        notes: savedNotes,
        customTags: customTags ? JSON.parse(customTags) : [],
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `dsa-notes-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting notes:", error);
      alert("Error exporting notes. Please try again.");
    }
  };

  // Import notes from JSON
  const importNotes = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        if (importData.notes && Array.isArray(importData.notes)) {
          // Merge with existing notes (avoid duplicates by ID)
          setSavedNotes((prev) => {
            const existingIds = new Set(prev.map((note) => note.id));
            const newNotes = importData.notes.filter(
              (note) => !existingIds.has(note.id)
            );
            return [...prev, ...newNotes];
          });

          // Import custom tags
          if (importData.customTags && Array.isArray(importData.customTags)) {
            importData.customTags.forEach((tag) => saveCustomTagToStorage(tag));
          }

          alert(`Successfully imported ${importData.notes.length} notes!`);
        } else {
          alert("Invalid file format. Please select a valid export file.");
        }
      } catch (error) {
        console.error("Error importing notes:", error);
        alert("Error importing notes. Please check the file format.");
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = "";
  };

  // Filter notes by search query
  const filteredNotes = savedNotes.filter(
    (note) =>
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          DSA Note Auto-Tagging System
        </h1>
        <p className="text-gray-600 mb-6">
          Automatically tag your Data Structures and Algorithms notes using
          AI-powered NLP and Trie data structure
        </p>

        {/* Note Input Section */}
        <div className="mb-6">
          {editingNote && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Editing note from {editingNote.timestamp}
              </p>
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your DSA note:
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Paste your DSA notes here... (e.g., 'Binary search is an efficient algorithm for searching sorted arrays with O(log n) time complexity')"
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={processNote}
              disabled={!note.trim() || isProcessing}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Tag className="h-4 w-4" />
                  Generate Tags
                </>
              )}
            </button>
            {finalTags.length > 0 && (
              <button
                onClick={saveNote}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingNote ? "Update Note" : "Save Note"}
              </button>
            )}
            {editingNote && (
              <button
                onClick={() => {
                  setNote("");
                  setSuggestedTags([]);
                  setFinalTags([]);
                  setEditingNote(null);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* Tags Section */}
        {suggestedTags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Suggested Tags:
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestedTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <Check className="h-3 w-3" />
                </span>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Final Tags:
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {finalTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
              />
              <button
                onClick={addCustomTag}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Tag
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Notes Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Saved Notes ({savedNotes.length})
          </h2>
          <div className="flex items-center gap-3">
            {/* Data Management Buttons */}
            <div className="flex gap-2">
              <button
                onClick={exportNotes}
                disabled={savedNotes.length === 0}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                title="Export notes"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <label className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center gap-1 text-sm cursor-pointer">
                <Upload className="h-4 w-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importNotes}
                  className="hidden"
                />
              </label>
              <button
                onClick={clearAllData}
                disabled={savedNotes.length === 0}
                className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                title="Clear all data"
              >
                <AlertTriangle className="h-4 w-4" />
                Clear All
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes or tags..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-8">
            {savedNotes.length === 0 ? (
              <div className="text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg mb-2">No notes saved yet</p>
                <p className="text-sm">
                  Create your first note above to get started!
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No notes match your search.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((savedNote) => (
              <div
                key={savedNote.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-gray-800 mb-2 leading-relaxed">
                      {savedNote.content}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {savedNote.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <p>Created: {savedNote.timestamp}</p>
                        {savedNote.lastModified &&
                          savedNote.lastModified !== savedNote.timestamp && (
                            <p>Modified: {savedNote.lastModified}</p>
                          )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editNote(savedNote)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Edit note"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this note?"
                              )
                            ) {
                              deleteNote(savedNote.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Storage Info */}
        {savedNotes.length > 0 && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              Data is automatically saved to your browser's local storage. Use
              Export to backup your notes or Import to restore from a backup.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DSANoteTagger;
