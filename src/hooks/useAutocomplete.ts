"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface AutocompleteOptions {
  collectionName: string;
  fieldName: string;
  minLength?: number;
}

/**
 * useAutocomplete hook
 * Fetches distinct values from a Firestore collection field and provides filtered suggestions.
 * 
 * Usage:
 * const { suggestions, query, setQuery, isLoading } = useAutocomplete({
 *   collectionName: "graduate_students",
 *   fieldName: "advisor_name"
 * });
 */
export function useAutocomplete({ collectionName, fieldName, minLength = 1 }: AutocompleteOptions) {
  const [allValues, setAllValues] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fetchedRef = useRef(false);

  // Fetch distinct values once on mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    
    const fetchValues = async () => {
      setIsLoading(true);
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        const values = new Set<string>();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const val = data[fieldName];
          if (val && typeof val === "string" && val.trim().length >= minLength) {
            values.add(val.trim());
          }
        });
        setAllValues(Array.from(values).sort());
      } catch (error) {
        console.error(`Error fetching autocomplete for ${collectionName}.${fieldName}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchValues();
  }, [collectionName, fieldName, minLength]);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.length < minLength) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    
    const filtered = allValues.filter(v =>
      v.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
    setIsOpen(filtered.length > 0);
  }, [query, allValues, minLength]);

  const selectSuggestion = useCallback((value: string) => {
    setQuery(value);
    setIsOpen(false);
    setSuggestions([]);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    suggestions,
    query,
    setQuery,
    isLoading,
    isOpen,
    selectSuggestion,
    close,
    allValues, // All distinct values for reference
  };
}

/**
 * Standalone helper: get all distinct values from a collection field.
 * Useful for building dropdown options.
 */
export async function getDistinctValues(collectionName: string, fieldName: string): Promise<string[]> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const values = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const val = data[fieldName];
      if (val && typeof val === "string" && val.trim().length > 0) {
        values.add(val.trim());
      }
    });
    return Array.from(values).sort();
  } catch (error) {
    console.error(`Error getting distinct values:`, error);
    return [];
  }
}
