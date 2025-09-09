import { Box, Button, Divider, Heading, Text } from '@razorpay/blade/components';
import { useMemo, useState } from 'react';
import { DateBucket, TaskModel, ListModel, useAppStore } from './store';

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

const BUCKETS: DateBucket[] = ['Today', 'Tomorrow', 'Upcoming', 'Someday'];

function dueDateForBucket(bucket: DateBucket): string | null {
  const today = getTodayISO();
  if (bucket === 'Today') return today;
  if (bucket === 'Tomorrow') return addDaysISO(today, 1);
  if (bucket === 'Upcoming') return addDaysISO(today, 2);
  return null; // Someday
}

type SidebarProps = {
  selectedListId: string | null;
  onSelect: (id: string) => void;
  onAddList: (name: string) => void;
  onDeleteList: (id: string) => void;
  lists: ListModel[];
  listTaskCounts: Record<string, number>;
};

const Sidebar = ({ selectedListId, onSelect, onAddList, onDeleteList, lists, listTaskCounts }: SidebarProps) => {
  const [newListName, setNewListName] = useState('');
  return (
    <Box
      as="nav"
      backgroundColor="surface.background.gray.subtle"
      minHeight="100vh"
      width="260px"
      paddingY="spacing.7"
      paddingX="spacing.5"
      borderRightWidth="thin"
      borderRightColor="surface.border.gray.subtle"
      display={{ base: 'none', m: 'block' }}
    >
      <Heading size="small" marginBottom="spacing.8">Lists</Heading>
      <Box display="flex" flexDirection="column" gap="spacing.2" marginBottom="spacing.6">
        {lists.map((list: ListModel) => (
          <Box key={list.id} display="flex" alignItems="center" gap="spacing.3">
            <Box flexGrow={1}>
              <Button
                variant="tertiary"
                isFullWidth
                onClick={() => onSelect(list.id)}
                color={selectedListId === list.id ? 'primary' : undefined}
              >
                {list.name}
              </Button>
            </Box>
            <Text color="surface.text.gray.subtle">{listTaskCounts[list.id] ?? 0}</Text>
            {lists.length > 1 ? (
              <Button
                variant="tertiary"
                onClick={() => onDeleteList(list.id)}
              >
                Delete
              </Button>
            ) : null}
          </Box>
        ))}
      </Box>
      <Divider marginY="spacing.5" />
      <Box display="flex" gap="spacing.3" alignItems="center">
        {/* Using native input for reliability */}
        <input
          style={{ flex: 1, padding: 8, border: '1px solid #E2E8F0', borderRadius: 6 }}
          placeholder="New list"
          value={newListName}
          onChange={(e: any) => setNewListName(e.target.value)}
          onKeyDown={(e: any) => {
            if (e.key === 'Enter' && newListName.trim()) {
              onAddList(newListName.trim());
              setNewListName('');
            }
          }}
        />
        <Button
          onClick={() => {
            if (newListName.trim()) {
              onAddList(newListName.trim());
              setNewListName('');
            }
          }}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
};

type BucketSectionProps = {
  bucket: DateBucket;
  tasks: TaskModel[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAddQuick: (title: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onMoveCycle: (id: string) => void;
};

const BucketSection = ({ bucket, tasks, collapsed, onToggleCollapse, onAddQuick, onToggleTask, onDeleteTask, onMoveCycle }: BucketSectionProps) => {
  const [quickTitle, setQuickTitle] = useState('');
  return (
    <Box marginBottom="spacing.7">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Heading size="small">{bucket}</Heading>
        <Button variant="tertiary" onClick={onToggleCollapse}>{collapsed ? 'Expand' : 'Collapse'}</Button>
      </Box>
      {!collapsed ? (
        <>
          <Box display="flex" gap="spacing.3" alignItems="center" marginY="spacing.3">
            <input
              style={{ flex: 1, padding: 8, border: '1px solid #E2E8F0', borderRadius: 6 }}
              placeholder={`Add task to ${bucket}`}
              value={quickTitle}
              onChange={(e: any) => setQuickTitle(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter' && quickTitle.trim()) {
                  onAddQuick(quickTitle.trim());
                  setQuickTitle('');
                }
              }}
            />
            <Button
              onClick={() => {
                if (quickTitle.trim()) {
                  onAddQuick(quickTitle.trim());
                  setQuickTitle('');
                }
              }}
            >
              Add
            </Button>
          </Box>
          <Divider marginY="spacing.3" />
          <Box display="flex" flexDirection="column" gap="spacing.2">
            {tasks.map((t: TaskModel) => (
              <Box key={t.id} display="flex" alignItems="center" justifyContent="space-between" paddingY="spacing.3" paddingX="spacing.4" backgroundColor="surface.background.gray.subtle" borderRadius="medium">
                <Box display="flex" alignItems="center" gap="spacing.4">
                  {/* native checkbox for reliability */}
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => onToggleTask(t.id)}
                  />
                  <Text>{t.completed ? `✓ ${t.title}` : t.title}</Text>
                </Box>
                <Box display="flex" alignItems="center" gap="spacing.3">
                  <Button variant="tertiary" onClick={() => onMoveCycle(t.id)}>Move</Button>
                  <Button variant="tertiary" color="negative" onClick={() => onDeleteTask(t.id)}>Delete</Button>
                </Box>
              </Box>
            ))}
            {tasks.length === 0 ? (
              <Text color="surface.text.gray.subtle">No tasks</Text>
            ) : null}
          </Box>
        </>
      ) : null}
    </Box>
  );
};

const TopBar = ({ search, setSearch }: { search: string; setSearch: (v: string) => void }) => {
  return (
    <Box
      as="header"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      paddingY="spacing.5"
      paddingX="spacing.7"
      backgroundColor="surface.background.gray.subtle"
      borderBottomWidth="thin"
      borderBottomColor="surface.border.gray.subtle"
    >
      <Heading size="small">Any.do Clone</Heading>
      <Box display="flex" alignItems="center" gap="spacing.3" minWidth="300px" width="40%">
        {/* native input for search */}
        <input
          style={{ flex: 1, padding: 10, border: '1px solid #E2E8F0', borderRadius: 8 }}
          placeholder="Search tasks"
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />
      </Box>
    </Box>
  );
};

const App = () => {
  const {
    lists,
    tasks,
    selectedListId,
    collapsedSections,
    addList,
    deleteList,
    addTask,
    toggleTask,
    deleteTask,
    moveTaskDueDate,
    setSelectedListId,
    setSectionCollapsed,
    listTaskCounts,
  } = useAppStore();

  const [search, setSearch] = useState('');

  const visibleTasks = useMemo(() => {
    return tasks.filter((t) => t.listId === selectedListId && (!search.trim() || t.title.toLowerCase().includes(search.toLowerCase())));
  }, [tasks, selectedListId, search]);

  function tasksForBucket(bucket: DateBucket): TaskModel[] {
    return visibleTasks.filter((t: TaskModel) => {
      const today = getTodayISO();
      const tomorrow = addDaysISO(today, 1);
      if (bucket === 'Someday') return t.dueDate === null;
      if (bucket === 'Today') return t.dueDate === today;
      if (bucket === 'Tomorrow') return t.dueDate === tomorrow;
      return t.dueDate !== null && t.dueDate > tomorrow;
    });
  }

  function handleAddQuick(bucket: DateBucket, title: string) {
    if (!selectedListId) return;
    addTask(selectedListId, title, dueDateForBucket(bucket));
  }

  function handleMoveCycle(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const today = getTodayISO();
    const tomorrow = addDaysISO(today, 1);
    let nextDue: string | null = null;
    if (task.dueDate === null) {
      nextDue = today; // Someday -> Today
    } else if (task.dueDate === today) {
      nextDue = tomorrow; // Today -> Tomorrow
    } else if (task.dueDate === tomorrow) {
      nextDue = addDaysISO(today, 2); // Tomorrow -> Upcoming (today+2)
    } else {
      nextDue = null; // Upcoming -> Someday
    }
    moveTaskDueDate(taskId, nextDue);
  }

  return (
    <Box display="flex" minHeight="100vh" backgroundColor="surface.background.gray.subtle">
      <Sidebar
        selectedListId={selectedListId}
        onSelect={setSelectedListId}
        onAddList={addList}
        onDeleteList={deleteList}
        lists={lists}
        listTaskCounts={listTaskCounts}
      />
      <Box flexGrow={1}>
        <TopBar search={search} setSearch={setSearch} />
        <Box padding="spacing.8">
          {BUCKETS.map((bucket: DateBucket) => (
            <BucketSection
              key={bucket}
              bucket={bucket}
              tasks={tasksForBucket(bucket)}
              collapsed={!!collapsedSections[bucket]}
              onToggleCollapse={() => setSectionCollapsed(bucket, !collapsedSections[bucket])}
              onAddQuick={(title) => handleAddQuick(bucket, title)}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onMoveCycle={handleMoveCycle}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default App;
