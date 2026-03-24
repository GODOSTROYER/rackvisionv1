import { createContext, Dispatch, ReactNode, useContext, useReducer } from "react";
import { DEFAULT_ACTIVE_FILTERS, RackVisionAction, RackVisionState } from "@/components/rackvision/types";

const initialState: RackVisionState = {
  activeView: "global",
  selectedEntityId: null,
  selectedEntityKind: null,
  inspectorEntityId: null,
  selectedRoomId: null,
  selectedRowId: null,
  selectedRackId: null,
  selectedDeviceId: null,
  hoveredDeviceId: null,
  activeRackId: null,
  rackPreviewRackId: null,
  hoveredEntityId: null,
  selectedMarkerId: null,
  globalViewMode: "regions",
  globeRenderer: "three",
  expandedNodeIds: [],
  searchQuery: "",
  rackSearchQuery: "",
  rackDeviceSearchQuery: "",
  rackSortBy: "rack_id",
  rackFilters: {
    status: "all",
    roomId: "all",
    rowId: "all",
    occupancy: "all",
    alertLevel: "all",
  },
  rackDeviceFilter: {
    type: "all",
    status: "all",
  },
  showEmptyUnits: true,
  highlightCriticalOnly: false,
  treeResults: [],
  breadcrumbs: [{ id: "global", label: "Global", kind: "global" }],
  globalSearchQuery: "",
  globalSearchResults: [],
  isSearchResultsOpen: false,
  activeFilters: DEFAULT_ACTIVE_FILTERS,
  activeFilterPresetId: "custom",
  layoutContext: {
    siteId: null,
    roomId: null,
  },
  layoutOverlayMode: "alerts",
  investigationHistory: [],
  isLoading: false,
};

function rackVisionReducer(state: RackVisionState, action: RackVisionAction): RackVisionState {
  switch (action.type) {
    case "SET_ACTIVE_VIEW":
      return { ...state, activeView: action.payload };
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
    case "SET_ACTIVE_RACK":
      return { ...state, activeRackId: action.payload };
    case "SET_SELECTED_DEVICE":
      return { ...state, selectedDeviceId: action.payload };
    case "SET_HOVERED_DEVICE":
      return { ...state, hoveredDeviceId: action.payload };
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
    case "SET_GLOBE_RENDERER":
      return { ...state, globeRenderer: action.payload };
    case "SET_INSPECTOR_ENTITY":
      return { ...state, inspectorEntityId: action.payload };
    case "SET_TREE_SEARCH":
      return { ...state, searchQuery: action.payload };
    case "SET_RACK_SEARCH":
      return { ...state, rackSearchQuery: action.payload };
    case "SET_RACK_DEVICE_SEARCH":
      return { ...state, rackDeviceSearchQuery: action.payload };
    case "SET_RACK_FILTERS":
      return { ...state, rackFilters: action.payload };
    case "SET_RACK_DEVICE_FILTER":
      return { ...state, rackDeviceFilter: action.payload };
    case "SET_RACK_SORT":
      return { ...state, rackSortBy: action.payload };
    case "SET_SHOW_EMPTY_UNITS":
      return { ...state, showEmptyUnits: action.payload };
    case "SET_HIGHLIGHT_CRITICAL_ONLY":
      return { ...state, highlightCriticalOnly: action.payload };
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
    case "SET_BREADCRUMBS":
      return { ...state, breadcrumbs: action.payload };
    case "SET_GLOBAL_SEARCH_QUERY":
      return { ...state, globalSearchQuery: action.payload };
    case "SET_GLOBAL_SEARCH_RESULTS":
      return { ...state, globalSearchResults: action.payload };
    case "OPEN_SEARCH_RESULTS":
      return { ...state, isSearchResultsOpen: true };
    case "CLOSE_SEARCH_RESULTS":
      return { ...state, isSearchResultsOpen: false };
    case "SET_ACTIVE_FILTERS":
      return { ...state, activeFilters: action.payload, activeFilterPresetId: "custom" };
    case "CLEAR_ACTIVE_FILTERS":
      return {
        ...state,
        activeFilters: DEFAULT_ACTIVE_FILTERS,
        activeFilterPresetId: "custom",
      };
    case "SET_FILTER_PRESET":
      return { ...state, activeFilterPresetId: action.payload };
    case "SET_LAYOUT_CONTEXT":
      return { ...state, layoutContext: action.payload };
    case "SET_LAYOUT_OVERLAY_MODE":
      return { ...state, layoutOverlayMode: action.payload };
    case "SET_INVESTIGATION_HISTORY":
      return { ...state, investigationHistory: action.payload };
    case "PUSH_INVESTIGATION_HISTORY": {
      const deduped = state.investigationHistory.filter((entry) => entry.route !== action.payload.route);
      return { ...state, investigationHistory: [action.payload, ...deduped].slice(0, 8) };
    }
    case "CLEAR_INVESTIGATION_HISTORY":
      return { ...state, investigationHistory: [] };
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
