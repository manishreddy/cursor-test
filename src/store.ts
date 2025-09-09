import { useCallback, useEffect, useMemo, useState } from 'react';

export type ListModel = {
  id: string;
  name: string;
  createdAt: string; // ISO
};

export type TaskModel = {
  id: string;
  title: string;
  dueDate: string | null; // ISO date (YYYY-MM-DD) or null
  completed: boolean;
  listId: string; // foreign key
  createdAt: string; // ISO
};

type PersistedState = {
  lists: ListModel[];
  tasks: TaskModel[];
  selectedListId: string | null;
  collapsedSections: Record<string, boolean>;
};

const STORAGE_KEY = 'anydo-clone-state-v1';

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function readState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function writeState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function getTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function addDaysISO(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split('-').map((s) => parseInt(s, 10));
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export type DateBucket = 'Today' | 'Tomorrow' | 'Upcoming' | 'Someday';

export function getDateBucket(dueDate: string | null): DateBucket {
  if (!dueDate) return 'Someday';
  const today = getTodayISO();
  const tomorrow = addDaysISO(today, 1);
  if (dueDate === today) return 'Today';
  if (dueDate === tomorrow) return 'Tomorrow';
  return dueDate > tomorrow ? 'Upcoming' : 'Someday';
}

export function useAppStore() {
  const initial: PersistedState = useMemo(() => {
    const fromStorage = readState();
    if (fromStorage) return fromStorage;
    const defaultListId = createId();
    return {
      lists: [
        { id: defaultListId, name: 'Personal', createdAt: new Date().toISOString() },
      ],
      tasks: [],
      selectedListId: defaultListId,
      collapsedSections: {},
    };
  }, []);

  const [lists, setLists] = useState<ListModel[]>(initial.lists);
  const [tasks, setTasks] = useState<TaskModel[]>(initial.tasks);
  const [selectedListId, setSelectedListId] = useState<string | null>(initial.selectedListId);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(
    initial.collapsedSections,
  );

  useEffect(() => {
    writeState({ lists, tasks, selectedListId, collapsedSections });
  }, [lists, tasks, selectedListId, collapsedSections]);

  const addList = useCallback((name: string) => {
    const id = createId();
    setLists((prev) => [...prev, { id, name, createdAt: new Date().toISOString() }]);
    setSelectedListId(id);
  }, []);

  const deleteList = useCallback((id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    setTasks((prev) => prev.filter((t) => t.listId !== id));
    setSelectedListId((curr) => (curr === id ? (lists[0]?.id ?? null) : curr));
  }, [lists]);

  const renameList = useCallback((id: string, name: string) => {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
  }, []);

  const addTask = useCallback((listId: string, title: string, dueDate: string | null) => {
    const id = createId();
    setTasks((prev) => [
      ...prev,
      {
        id,
        listId,
        title: title.trim(),
        dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const moveTaskDueDate = useCallback((taskId: string, newDueDate: string | null) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, dueDate: newDueDate } : t)));
  }, []);

  const setSectionCollapsed = useCallback((bucket: DateBucket, collapsed: boolean) => {
    setCollapsedSections((prev) => ({ ...prev, [bucket]: collapsed }));
  }, []);

  const listTaskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      if (t.completed) continue;
      counts[t.listId] = (counts[t.listId] ?? 0) + 1;
    }
    return counts;
  }, [tasks]);

  return {
    lists,
    tasks,
    selectedListId,
    collapsedSections,
    addList,
    deleteList,
    renameList,
    addTask,
    toggleTask,
    deleteTask,
    moveTaskDueDate,
    setSelectedListId,
    setSectionCollapsed,
    listTaskCounts,
  };
}

