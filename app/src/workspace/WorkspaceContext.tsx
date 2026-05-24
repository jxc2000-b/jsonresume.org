import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { SectionId, SectionUiById } from '../types/uiSchema';
import {
  getMasterSection,
  isWorkspaceV1,
  type WorkspaceV1,
} from './types';

const DEFAULT_FIXTURE = '/sample-workspace.json';

function createEmptySectionUi(): SectionUiById {
  return {
    basics: {},
    work: {},
    volunteer: {},
    education: {},
    awards: {},
    certificates: {},
    publications: {},
    skills: {},
    languages: {},
    interests: {},
    references: {},
    projects: {},
  };
}

type WorkspaceState =
  | { status: 'loading'; document: null; error: null }
  | { status: 'ready'; document: WorkspaceV1; error: null }
  | { status: 'error'; document: null; error: string };

type WorkspaceContextValue = {
  /** Loading / ready / failed to parse fixture. */
  status: WorkspaceState['status'];
  error: string | null;
  document: WorkspaceV1 | null;
  /** Bumps on load, `setDocument`, and successful commit to remount section editors. */
  dataEpoch: number;
  /** In-memory editor UI config per section (not persisted with fixture in this draft). */
  sectionUi: SectionUiById;
  setSectionUi: React.Dispatch<React.SetStateAction<SectionUiById>>;
  /** Unsaved edits overlay `document.master` until `commitStagedToMaster` runs. */
  hasStagedEdits: boolean;
  setSectionStaged: (id: SectionId, value: unknown) => void;
  /** Drop an unsaved override so `getSection` falls back to `document.master` again. */
  clearSectionStaged: (id: SectionId) => void;
  /** Merge all staged section values into `document.master` and clear staging. */
  commitStagedToMaster: () => void;
  /** Slice of `master` for a section (staged if present, else on-disk master), or `undefined` if missing. */
  getSection: (id: SectionId) => unknown;
  /** Replace the entire workspace (e.g. after import). */
  setDocument: (doc: WorkspaceV1) => void;
  /** Load JSON from a URL; defaults to the public sample fixture. */
  loadFromUrl: (url?: string) => Promise<void>;
};

const Ctx = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>({
    status: 'loading',
    document: null,
    error: null,
  });
  const [staged, setStaged] = useState<Partial<Record<SectionId, unknown>>>({});
  const stagedRef = useRef(staged);
  stagedRef.current = staged;
  const [dataEpoch, setDataEpoch] = useState(0);
  const [sectionUi, setSectionUi] = useState<SectionUiById>(createEmptySectionUi);

  const loadFromUrl = useCallback(async (url: string = DEFAULT_FIXTURE) => {
    setState({ status: 'loading', document: null, error: null });
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: unknown = await res.json();
      if (!isWorkspaceV1(json)) {
        throw new Error('Not a valid workspace document (expected version + master).');
      }
      setStaged({});
      setDataEpoch((e) => e + 1);
      setState({ status: 'ready', document: json, error: null });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load workspace';
      setState({ status: 'error', document: null, error: message });
    }
  }, []);

  useEffect(() => {
    void loadFromUrl(DEFAULT_FIXTURE);
  }, [loadFromUrl]);

  const setDocument = useCallback((doc: WorkspaceV1) => {
    setStaged({});
    setDataEpoch((e) => e + 1);
    setState({ status: 'ready', document: doc, error: null });
  }, []);

  const hasStagedEdits = useMemo(
    () => Object.keys(staged).length > 0,
    [staged],
  );

  const setSectionStaged = useCallback((id: SectionId, value: unknown) => {
    setStaged((prev) => ({ ...prev, [id]: value }));
  }, []);

  const clearSectionStaged = useCallback((id: SectionId) => {
    setStaged((prev) => {
      if (!Object.hasOwn(prev, id)) return prev;
      const { [id]: _removed, ...rest } = prev;
      return { ...rest };
    });
  }, []);

  const commitStagedToMaster = useCallback(() => {
    const current = { ...stagedRef.current } as Record<SectionId, unknown>;
    if (Object.keys(current).length === 0) return;
    setState((prev) => {
      if (prev.status !== 'ready' || !prev.document) return prev;
      return {
        status: 'ready' as const,
        document: {
          ...prev.document,
          master: { ...prev.document.master, ...current },
        },
        error: null,
      };
    });
    setStaged({});
    stagedRef.current = {};
    setDataEpoch((e) => e + 1);
  }, []);

  const getSection = useCallback(
    (id: SectionId) => {
      if (state.status !== 'ready' || !state.document) return undefined;
      if (Object.hasOwn(staged, id)) {
        return staged[id as SectionId] as unknown;
      }
      return getMasterSection(state.document, id);
    },
    [state, staged],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      status: state.status,
      error: state.error,
      document: state.status === 'ready' ? state.document : null,
      dataEpoch,
      sectionUi,
      setSectionUi,
      hasStagedEdits,
      setSectionStaged,
      clearSectionStaged,
      commitStagedToMaster,
      getSection,
      setDocument,
      loadFromUrl,
    }),
    [
      state,
      dataEpoch,
      sectionUi,
      hasStagedEdits,
      setSectionStaged,
      clearSectionStaged,
      commitStagedToMaster,
      getSection,
      setDocument,
      loadFromUrl,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useWorkspace must be used under <WorkspaceProvider>');
  }
  return v;
}
