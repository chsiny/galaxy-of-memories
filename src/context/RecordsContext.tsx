import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LLMRecord } from "../types";

const STORAGE_KEY = "prompt-trainer-records";

// Action types
type RecordsAction =
  | { type: "INITIALIZE_FROM_STORAGE"; payload: LLMRecord[] }
  | { type: "ADD_RECORD"; payload: LLMRecord }
  | { type: "UPDATE_RECORD"; payload: { id: string; patch: Partial<LLMRecord> } }
  | { type: "DELETE_RECORD"; payload: string }
  | { type: "CLEAR_ALL" };

// State interface
interface RecordsState {
  records: LLMRecord[];
  isLoading: boolean;
}

// Initial state
const initialState: RecordsState = {
  records: [],
  isLoading: true,
};

// Reducer
function recordsReducer(state: RecordsState, action: RecordsAction): RecordsState {
  switch (action.type) {
    case "INITIALIZE_FROM_STORAGE":
      return {
        ...state,
        records: action.payload,
        isLoading: false,
      };
    
    case "ADD_RECORD":
      return {
        ...state,
        records: [action.payload, ...state.records],
      };
    
    case "UPDATE_RECORD":
      return {
        ...state,
        records: state.records.map((record) =>
          record.id === action.payload.id
            ? { ...record, ...action.payload.patch }
            : record
        ),
      };
    
    case "DELETE_RECORD":
      return {
        ...state,
        records: state.records.filter((record) => record.id !== action.payload),
      };
    
    case "CLEAR_ALL":
      return {
        ...state,
        records: [],
      };
    
    default:
      return state;
  }
}

// Context type
interface RecordsContextType {
  records: LLMRecord[];
  isLoading: boolean;
  addRecord: (record: LLMRecord) => void;
  updateRecord: (id: string, patch: Partial<LLMRecord>) => void;
  deleteRecord: (id: string) => void;
  clearAll: () => Promise<void>;
}

// Create context
const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

// Provider component
interface RecordsProviderProps {
  children: ReactNode;
}

export function RecordsProvider({ children }: RecordsProviderProps) {
  const [state, dispatch] = useReducer(recordsReducer, initialState);

  // Load records from AsyncStorage on mount
  useEffect(() => {
    loadRecordsFromStorage();
  }, []);

  // Persist records to AsyncStorage whenever records change
  useEffect(() => {
    if (!state.isLoading) {
      saveRecordsToStorage(state.records);
    }
  }, [state.records, state.isLoading]);

  async function loadRecordsFromStorage() {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const records = JSON.parse(storedData) as LLMRecord[];
        dispatch({ type: "INITIALIZE_FROM_STORAGE", payload: records });
      } else {
        dispatch({ type: "INITIALIZE_FROM_STORAGE", payload: [] });
      }
    } catch (error) {
      console.error("Failed to load records from storage:", error);
      // Initialize with empty array even if loading fails
      dispatch({ type: "INITIALIZE_FROM_STORAGE", payload: [] });
    }
  }

  async function saveRecordsToStorage(records: LLMRecord[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Failed to save records to storage:", error);
    }
  }

  function addRecord(record: LLMRecord) {
    dispatch({ type: "ADD_RECORD", payload: record });
  }

  function updateRecord(id: string, patch: Partial<LLMRecord>) {
    dispatch({ type: "UPDATE_RECORD", payload: { id, patch } });
  }

  function deleteRecord(id: string) {
    dispatch({ type: "DELETE_RECORD", payload: id });
  }

  async function clearAll() {
    dispatch({ type: "CLEAR_ALL" });
    // Also clear from AsyncStorage
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear records from storage:", error);
    }
  }

  const value: RecordsContextType = {
    records: state.records,
    isLoading: state.isLoading,
    addRecord,
    updateRecord,
    deleteRecord,
    clearAll,
  };

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

// Hook to use records context
export function useRecords(): RecordsContextType {
  const context = useContext(RecordsContext);
  if (context === undefined) {
    throw new Error("useRecords must be used within a RecordsProvider");
  }
  return context;
}

