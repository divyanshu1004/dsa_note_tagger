import React, { useState, useEffect } from 'react';
import { Search, Tag, Plus, X, Save, FileText, Edit3, Check } from 'lucide-react';

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
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  static tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  static removeStopWords(tokens) {
    return tokens.filter(token => !this.stopWords.has(token));
  }

  static stem(word) {
    // Simple stemming - remove common suffixes
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness', 'ment', 's'];
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
    return filteredTokens.map(token => this.stem(token));
  }
}

// DSA Tag Dictionary
const dsaTags = {
  // Data Structures
  'array': 'Arrays',
  'arrays': 'Arrays',
  'list': 'Lists',
  'lists': 'Lists',
  'linkedlist': 'Linked Lists',
  'linked': 'Linked Lists',
  'stack': 'Stacks',
  'stacks': 'Stacks',
  'queue': 'Queues',
  'queues': 'Queues',
  'tree': 'Trees',
  'trees': 'Trees',
  'binary': 'Binary Trees',
  'bst': 'Binary Search Trees',
  'heap': 'Heaps',
  'heaps': 'Heaps',
  'graph': 'Graphs',
  'graphs': 'Graphs',
  'hash': 'Hash Tables',
  'hashtable': 'Hash Tables',
  'hashmap': 'Hash Tables',
  'trie': 'Tries',
  'tries': 'Tries',
  
  // Algorithms
  'sort': 'Sorting',
  'sorting': 'Sorting',
  'search': 'Searching',
  'searching': 'Searching',
  'binary search': 'Binary Search',
  'linear search': 'Linear Search',
  'dfs': 'Depth-First Search',
  'bfs': 'Breadth-First Search',
  'dijkstra': 'Dijkstra Algorithm',
  'dynamic': 'Dynamic Programming',
  'dp': 'Dynamic Programming',
  'greedy': 'Greedy Algorithms',
  'backtrack': 'Backtracking',
  'backtracking': 'Backtracking',
  'recursion': 'Recursion',
  'recursive': 'Recursion',
  'iteration': 'Iteration',
  'iterative': 'Iteration',
  
  // Complexity
  'complexity': 'Time Complexity',
  'time': 'Time Complexity',
  'space': 'Space Complexity',
  'bigO': 'Big O Notation',
  'O(n)': 'Big O Notation',
  'O(1)': 'Big O Notation',
  'O(log n)': 'Big O Notation',
  
  // Specific Algorithms
  'quicksort': 'Quick Sort',
  'mergesort': 'Merge Sort',
  'bubblesort': 'Bubble Sort',
  'insertionsort': 'Insertion Sort',
  'selectionsort': 'Selection Sort',
  'heapsort': 'Heap Sort',
  'radixsort': 'Radix Sort'
};

const DSANoteTagger = () => {
  const [note, setNote] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [finalTags, setFinalTags] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [trie, setTrie] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Initialize Trie with DSA tags
  useEffect(() => {
    const newTrie = new Trie();
    Object.entries(dsaTags).forEach(([keyword, tag]) => {
      newTrie.insert(keyword, tag);
    });
    setTrie(newTrie);
  }, []);

  // Process note and generate tags
  const processNote = async () => {
    if (!note.trim() || !trie) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Preprocess the note
    const processedTokens = NLPProcessor.preprocessText(note);
    
    // Find matching tags
    const foundTags = new Set();
    
    // Check each token and its stems
    processedTokens.forEach(token => {
      const tag = trie.search(token);
      if (tag) {
        foundTags.add(tag);
      }
    });
    
    // Also check for multi-word phrases
    const originalTokens = NLPProcessor.tokenize(note);
    for (let i = 0; i < originalTokens.length - 1; i++) {
      const phrase = originalTokens[i] + ' ' + originalTokens[i + 1];
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
      id: Date.now(),
      content: note,
      tags: finalTags,
      timestamp: new Date().toLocaleString()
    };
    
    if (editingNote) {
      setSavedNotes(prev => prev.map(n => n.id === editingNote.id ? newNote : n));
      setEditingNote(null);
    } else {
      setSavedNotes(prev => [...prev, newNote]);
    }
    
    // Reset form
    setNote('');
    setSuggestedTags([]);
    setFinalTags([]);
  };

  // Add custom tag
  const addCustomTag = () => {
    if (customTag.trim() && !finalTags.includes(customTag.trim())) {
      setFinalTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFinalTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Edit note
  const editNote = (noteToEdit) => {
    setNote(noteToEdit.content);
    setFinalTags(noteToEdit.tags);
    setSuggestedTags(noteToEdit.tags);
    setEditingNote(noteToEdit);
  };

  // Filter notes by search query
  const filteredNotes = savedNotes.filter(note => 
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          DSA Note Auto-Tagging System
        </h1>
        <p className="text-gray-600 mb-6">
          Automatically tag your Data Structures and Algorithms notes using AI-powered NLP and Trie data structure
        </p>

        {/* Note Input Section */}
        <div className="mb-6">
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
                {editingNote ? 'Update Note' : 'Save Note'}
              </button>
            )}
          </div>
        </div>

        {/* Tags Section */}
        {suggestedTags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Suggested Tags:</h3>
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

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Final Tags:</h3>
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
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
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
          <h2 className="text-2xl font-bold text-gray-800">Saved Notes ({savedNotes.length})</h2>
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

        {filteredNotes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {savedNotes.length === 0 ? "No notes saved yet. Create your first note above!" : "No notes match your search."}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((savedNote) => (
              <div key={savedNote.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-gray-800 mb-2">{savedNote.content}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {savedNote.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{savedNote.timestamp}</p>
                  </div>
                  <button
                    onClick={() => editNote(savedNote)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DSANoteTagger;