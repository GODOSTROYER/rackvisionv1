import { createContext, Dispatch, ReactNode, useContext, useReducer } from "react";
import { RackVisionAction, RackVisionState } from "@/components/rackvision/types";

const initialState: RackVisionState = {
  activeView: "global",
  selectedEntityId: null,
  selectedEntityKind: null,
  inspectorEntityId: null,
  selectedRoomId: null,
  selectedRowId: null,
  selectedRackId: null,
  rackPreviewRackId: null,
  hoveredEntityId: null,
  selectedMarkerId: null,
  globalViewMode: "regions",
  expandedNodeIds: [],
  searchQuery: "",
  rackSearchQuery: "",
  rackSortBy: "rack_id",
  rackFilters: {
    status: "all",
    roomId: "all",
    rowId: "all",
    occupancy: "all",
    alertLevel: "all",
  },
  treeResults: [],
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
    case "SET_SELECTED_ENTITY":
      return {
        ...state,
        selectedEntityId: action.payload.id,
        selectedEntityKind: action.payload.kind,
        selectedMarkerId: action.payload.id,
      };
    case "SET_SELECTED_ROOM":
      return { ...state, selectedRoomId: action.payload };
    case "SET_SELECTED_ROW":
      return { ...state, selectedRowId: action.payload };
    case "SET_SELECTED_RACK":
      return { ...state, selectedRackId: action.payload };
    case "OPEN_RACK_PREVIEW":
      return { ...state, rackPreviewRackId: action.payload };
    case "CLOSE_RACK_PREVIEW":
      return { ...state, rackPreviewRackId: null };
    case "SET_HOVERED_ENTITY":
      return { ...state, hoveredEntityId: action.payload };
    case "SET_SELECTED_MARKER":
      return { ...state, selectedMarkerId: action.payload };
    case "SET_GLOBAL_VIEW_MODE":
      return { ...state, globalViewMode: action.payload };
    case "OPEN_INSPECTOR":
      return { ...state, inspectorEntityId: action.payload };
    case "SET_INSPECTOR_ENTITY":
      return { ...state, inspectorEntityId: action.payload };
    case "CLOSE_INSPECTOR":
      return { ...state, inspectorEntityId: null };
    case "SET_SEARCH":
    case "SET_TREE_SEARCH":
      return { ...state, searchQuery: action.payload };
    case "SET_RACK_SEARCH":
      return { ...state, rackSearchQuery: action.payload };
    case "SET_RACK_FILTERS":
      return { ...state, rackFilters: action.payload };
    case "SET_RACK_SORT":
      return { ...state, rackSortBy: action.payload };
    case "TOGGLE_NODE_EXPANDED":
      return {
        ...state,
        expandedNodeIds: state.expandedNodeIds.includes(action.payload)
          ? state.expandedNodeIds.filter((id) => id !== action.payload)
          : [...state.expandedNodeIds, action.payload],
      };
    case "SET_EXPANDED_NODES":
      return { ...state, expandedNodeIds: action.payload };
    case "SET_TREE_RESULTS":
      return { ...state, treeResults: action.payload };
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
