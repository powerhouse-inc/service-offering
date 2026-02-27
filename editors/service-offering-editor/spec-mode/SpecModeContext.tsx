import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export type FieldBinding = {
  /** The field path within the document model state, e.g. "services", "tiers.serviceLevels" */
  fieldPath: string;
  /** GraphQL type of this field, e.g. "[Service!]!", "String", "Amount_Money" */
  gqlType: string;
};

export type ModelBinding = {
  /** Document model identifier, e.g. "powerhouse/service-offering" */
  modelId: string;
  /** Human-readable model name */
  modelName: string;
  /** File extension, e.g. ".phs" */
  extension: string;
  /** Fields this component reads from this model */
  fields: FieldBinding[];
  /** Read query for this component's data needs (GQL string) */
  readQuery: string;
  /** Mutation operation names available on this model */
  mutations: string[];
};

type ActiveTarget = {
  id: string;
  bindings: ModelBinding[];
  rect: DOMRect;
  pinned: boolean;
};

type SpecModeContextValue = {
  isActive: boolean;
  toggle: () => void;
  activeTarget: ActiveTarget | null;
  setHover: (id: string, rect: DOMRect, bindings: ModelBinding[]) => void;
  setClick: (id: string, rect: DOMRect, bindings: ModelBinding[]) => void;
  clearTarget: () => void;
};

const SpecModeContext = createContext<SpecModeContextValue | null>(null);

export function SpecModeProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [activeTarget, setActiveTarget] = useState<ActiveTarget | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = useCallback(() => {
    setIsActive((prev) => !prev);
    setActiveTarget(null);
  }, []);

  const setHover = useCallback(
    (id: string, rect: DOMRect, bindings: ModelBinding[]) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setActiveTarget((prev) =>
        prev?.pinned ? prev : { id, bindings, rect, pinned: false },
      );
    },
    [],
  );

  const setClick = useCallback(
    (id: string, rect: DOMRect, bindings: ModelBinding[]) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setActiveTarget((prev) =>
        prev?.id === id && prev.pinned
          ? null // toggle off if already pinned
          : { id, bindings, rect, pinned: true },
      );
    },
    [],
  );

  const clearTarget = useCallback(() => {
    // Debounce the clear so a nested SpecTarget's onMouseEnter can win first.
    // This handles fixed-position modals that are visually outside their DOM parent.
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveTarget((prev) => (prev?.pinned ? prev : null));
    }, 80);
  }, []);

  return (
    <SpecModeContext.Provider
      value={{
        isActive,
        toggle,
        activeTarget,
        setHover,
        setClick,
        clearTarget,
      }}
    >
      {children}
    </SpecModeContext.Provider>
  );
}

export function useSpecMode(): SpecModeContextValue {
  const ctx = useContext(SpecModeContext);
  if (!ctx)
    throw new Error("useSpecMode must be used within a SpecModeProvider");
  return ctx;
}
