import { createContext, Dispatch, ReactNode, useContext, useReducer } from "react";
import { RackVisionAction, RackVisionState } from "@/components/rackvision/types";

const initialState: RackVisionState = {
  activeView: "global",
  selectedEntityId: null,
  selectedEntityKind: null,
  inspectorEntityId: null,
  searchQuery: "",
  statusFilter: "all",
  deviceTypeFilter: "all",
  breadcrumbs: [{ id: "global", label: "Global", kind: "global" }],
  isLoading: false,
};

function rackVisionReducer(state: RackVisionState, action: RackVisionAction): RackVisionState {
  switch (action.type) {
    case "SET_ACTIVE_VIEW":
      return { ...state, activeView: action.payload };
    case "SELECT_ENTITY":
      return {
        ...state,
        selectedEntityId: action.payload.id,
        selectedEntityKind: action.payload.kind,
      };
    case "OPEN_INSPECTOR":
      return { ...state, inspectorEntityId: action.payload };
    case "CLOSE_INSPECTOR":
      return { ...state, inspectorEntityId: null };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload };
    case "SET_DEVICE_TYPE_FILTER":
      return { ...state, deviceTypeFilter: action.payload };
    case "SET_BREADCRUMBS":
      return { ...state, breadcrumbs: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

type RackVisionContextValue = {
  state: RackVisionState;
  dispatch: Dispatch<RackVisionAction>;
};

const RackVisionContext = createContext<RackVisionContextValue | undefined>(undefined);

export function RackVisionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rackVisionReducer, initialState);
  return <RackVisionContext.Provider value={{ state, dispatch }}>{children}</RackVisionContext.Provider>;
}

export function useRackVision() {
  const context = useContext(RackVisionContext);
  if (!context) throw new Error("useRackVision must be used within RackVisionProvider");
  return context;
}
