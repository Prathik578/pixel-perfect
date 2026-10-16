import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  Circle,
  Clock3,
  FileText,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTask, loadTasks, moveTask, saveTasks, updateTask, validateTaskFields, type Task, type TaskFields, type TaskInputErrors, type TaskStatus } from "@/lib/tasks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Client Board — Studio task tracker" },
      { name: "description", content: "A clear, calm board for managing client work and deadlines." },
      { property: "og:title", content: "Client Board — Studio task tracker" },
      { property: "og:description", content: "A clear, calm board for managing client work and deadlines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const columns: { status: TaskStatus; label: string; description: string }[] = [
  { status: "todo", label: "To do", description: "Ready when you are" },
  { status: "in_progress", label: "In progress", description: "Currently in motion" },
  { status: "done", label: "Done", description: "Across the finish line" },
];

const emptyFields: TaskFields = { title: "", client: "", deadline: "", notes: "" };

function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | "clear" | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const result = loadTasks();
    setTasks(result.tasks);
    setStorageWarning(result.warning);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && !saveTasks(tasks)) {
      setStorageWarning("This browser couldn't save your changes. They may not survive a reload.");
    }
  }, [isLoaded, tasks]);

  const groupedTasks = useMemo(
    () => Object.fromEntries(columns.map((column) => [column.status, tasks.filter((task) => task.status === column.status)])) as Record<TaskStatus, Task[]>,
    [tasks],
  );

  function openCreate() {
    setEditTask(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditTask(task);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }

  function submitTask(fields: TaskFields) {
    if (editTask) setTasks((current) => updateTask(current, editTask.id, fields));
    else setTasks((current) => [...current, createTask(fields)]);
    setFormOpen(false);
    setEditTask(null);
  }

  function confirmDelete() {
    if (deleteTarget === "clear") setTasks([]);
    else if (deleteTarget) setTasks((current) => current.filter((task) => task.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <main className="board-page min-h-screen bg-background text-foreground">
      <div className="board-shell mx-auto w-full max-w-[1480px] px-5 pb-16 pt-7 sm:px-8 sm:pt-10 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-border pb-7">
          <div className="flex items-center gap-3.5">
            <div className="brand-mark flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-hidden="true">
              <BriefcaseBusiness className="size-5" strokeWidth={2.1} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
              <p className="mt-0.5 text-base font-semibold tracking-[-0.02em]">Client board</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-10 text-muted-foreground" aria-label="Board options">
                  <MoreHorizontal className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Board options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={tasks.length === 0} onSelect={() => setDeleteTarget("clear")}>
                  <RotateCcw className="size-4" /> Clear all tasks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={openCreate} className="h-10 gap-2 rounded-lg px-4 font-semibold shadow-none">
              <Plus className="size-4" /> <span>Add task</span>
            </Button>
          </div>
        </header>

        <section aria-labelledby="board-title" className="pt-10 sm:pt-12">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                Your work, at a glance
              </p>
              <h1 id="board-title" className="font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Projects in motion</h1>
            </div>
            <p className="pb-1 text-sm text-muted-foreground">
              {tasks.length === 0 ? "A little space for what’s next." : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} across your board`}
            </p>
          </div>

          {storageWarning && (
            <div role="status" className="mb-6 flex items-start gap-3 border-l-2 border-warning bg-warning/5 px-4 py-3 text-sm text-muted-foreground">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <span>{storageWarning}</span>
            </div>
          )}

          {!isLoaded ? (
            <div className="grid min-h-80 place-items-center text-sm text-muted-foreground" role="status">Opening your board…</div>
          ) : (
            <div className="board-columns grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-4 xl:gap-6">
              {columns.map((column, index) => {
                const columnTasks = groupedTasks[column.status];
                const StatusIcon = index === 0 ? Circle : index === 1 ? Clock3 : CheckCheck;
                return (
                  <section key={column.status} className="status-column min-w-0" data-status={column.status} aria-labelledby={`column-${column.status}`}>
                    <div className="mb-3 flex items-start justify-between gap-3 px-0.5">
                      <div className="flex items-center gap-3">
                        <span className="status-icon flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground" aria-hidden="true">
                          <StatusIcon className="size-4" strokeWidth={2} />
                        </span>
                        <div>
                          <h2 id={`column-${column.status}`} className="text-sm font-semibold">{column.label}</h2>
                          <p className="mt-0.5 text-xs text-muted-foreground">{column.description}</p>
                        </div>
                      </div>
                      <span className="mt-1 min-w-6 rounded-full bg-secondary px-2 py-0.5 text-center text-xs font-medium tabular-nums text-secondary-foreground" aria-label={`${columnTasks.length} tasks`}>{columnTasks.length}</span>
                    </div>

                    <div className="column-well min-h-64 space-y-3 rounded-xl border border-border/80 p-2.5 sm:p-3">
                      {columnTasks.length === 0 ? (
                        <div className="empty-column flex min-h-56 flex-col items-center justify-center px-4 text-center">
                          <span className="empty-icon mb-3 flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground" aria-hidden="true">
                            {index === 2 ? <Check className="size-4" /> : <Plus className="size-4" />}
                          </span>
                          <p className="text-sm font-medium">Nothing here yet</p>
                          <p className="mt-1 max-w-48 text-xs leading-5 text-muted-foreground">
                            {index === 0 ? "Add a task to give your next project a home." : index === 1 ? "Tasks you're working on will show up here." : "Finished work will find its way here."}
                          </p>
                          {index === 0 && tasks.length === 0 && (
                            <Button variant="ghost" size="sm" onClick={openCreate} className="mt-3 h-8 gap-1.5 px-2 text-primary hover:text-primary">
                              <Plus className="size-3.5" /> Add your first task
                            </Button>
                          )}
                        </div>
                      ) : columnTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onEdit={openEdit} onMove={(status) => setTasks((current) => moveTask(current, task.id, status))} onDelete={() => setDeleteTarget(task)} />
                      ))}
                      {column.status === "todo" && columnTasks.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={openCreate} className="h-9 w-full justify-start gap-2 px-3 text-muted-foreground hover:text-foreground">
                          <Plus className="size-4" /> Add task
                        </Button>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-10 flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-success" aria-hidden="true" /> Saved on this device</span>
          <span className="hidden sm:inline">A quieter way to keep work moving.</span>
        </footer>
      </div>

      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTask(null); }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto border-border bg-card p-0 sm:max-w-lg">
          <TaskForm key={formKey} task={editTask} onCancel={() => setFormOpen(false)} onSubmit={submitTask} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTarget === "clear" ? "Clear the whole board?" : "Delete this task?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget === "clear" ? "All tasks will be removed from this device. This can't be undone." : "This task will be permanently removed from your board. This can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteTarget === "clear" ? "Clear board" : "Delete task"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function TaskForm({ task, onCancel, onSubmit }: { task: Task | null; onCancel: () => void; onSubmit: (fields: TaskFields) => void }) {
  const [values, setValues] = useState<TaskFields>(task ? { title: task.title, client: task.client, deadline: task.deadline, notes: task.notes } : emptyFields);
  const [errors, setErrors] = useState<TaskInputErrors>({});

  function updateField(field: keyof TaskFields, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateTaskFields(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="border-b border-border px-6 py-5 sm:px-7">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-[-0.02em]">{task ? "Edit task" : "Add a task"}</DialogTitle>
          <DialogDescription className="pt-1">Keep the details close and the next step clear.</DialogDescription>
        </DialogHeader>
      </div>
      <div className="space-y-5 px-6 py-6 sm:px-7">
        <div className="space-y-2">
          <Label htmlFor="task-title">Task title <span className="text-destructive" aria-hidden="true">*</span></Label>
          <Input id="task-title" autoFocus value={values.title} onChange={(event) => updateField("title", event.target.value)} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "task-title-error" : undefined} placeholder="e.g. Prepare the launch proposal" />
          {errors.title && <p id="task-title-error" className="text-xs text-destructive" role="alert">{errors.title}</p>}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="task-client">Client <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="task-client" value={values.client} onChange={(event) => updateField("client", event.target.value)} aria-invalid={Boolean(errors.client)} aria-describedby={errors.client ? "task-client-error" : undefined} placeholder="Client or company" />
            {errors.client && <p id="task-client-error" className="text-xs text-destructive" role="alert">{errors.client}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-deadline">Deadline <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id="task-deadline" type="date" value={values.deadline} onChange={(event) => updateField("deadline", event.target.value)} aria-invalid={Boolean(errors.deadline)} aria-describedby={errors.deadline ? "task-deadline-error" : undefined} />
            {errors.deadline && <p id="task-deadline-error" className="text-xs text-destructive" role="alert">{errors.deadline}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-notes">Notes <span className="font-normal text-muted-foreground">· optional</span></Label>
          <Textarea id="task-notes" value={values.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="A little context for future you…" rows={3} className="resize-y" />
        </div>
      </div>
      <DialogFooter className="border-t border-border px-6 py-4 sm:px-7">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="shadow-none">{task ? "Save changes" : "Create task"}</Button>
      </DialogFooter>
    </form>
  );
}

function TaskCard({ task, onEdit, onMove, onDelete }: { task: Task; onEdit: (task: Task) => void; onMove: (status: TaskStatus) => void; onDelete: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const daysUntil = Math.ceil((new Date(`${task.deadline}T00:00:00.000Z`).getTime() - new Date(`${today}T00:00:00.000Z`).getTime()) / 86_400_000);
  const isOverdue = task.status !== "done" && task.deadline < today;
  const isUpcoming = task.status !== "done" && !isOverdue && daysUntil <= 7;
  const dateLabel = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${task.deadline}T00:00:00.000Z`));
  const deadlineMessage = task.status === "done" ? "Completed" : isOverdue ? "Overdue" : daysUntil === 0 ? "Due today" : daysUntil === 1 ? "Due tomorrow" : isUpcoming ? "Due soon" : "Due";

  return (
    <article className="task-card group rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring/50" aria-label={`${task.title}, ${task.client}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words pr-1 text-sm font-semibold leading-5">{task.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2 -mt-1 size-8 shrink-0 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100" aria-label={`Actions for ${task.title}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => onEdit(task)}><FileText className="size-4" /> Edit task</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Move to</DropdownMenuLabel>
            {columns.filter((column) => column.status !== task.status).map((column) => (
              <DropdownMenuItem key={column.status} onSelect={() => onMove(column.status)}>
                {column.status === "todo" ? <Circle className="size-4" /> : column.status === "in_progress" ? <ArrowRight className="size-4" /> : <CheckCheck className="size-4" />}
                {column.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="size-4" /> Delete task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mb-3 truncate text-xs font-medium text-muted-foreground">{task.client}</p>

      {task.notes && <p className="mb-3 line-clamp-2 break-words text-xs leading-[1.65] text-secondary-foreground">{task.notes}</p>}

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-t border-border/70 pt-3">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${isOverdue ? "text-destructive" : isUpcoming ? "text-warning" : task.status === "done" ? "text-success" : "text-muted-foreground"}`}>
          {isOverdue ? <ArrowDownRight className="size-3.5" aria-hidden="true" /> : isUpcoming ? <ArrowUpRight className="size-3.5" aria-hidden="true" /> : task.status === "done" ? <Check className="size-3.5" aria-hidden="true" /> : <CalendarDays className="size-3.5" aria-hidden="true" />}
          <span>{deadlineMessage} · {dateLabel}</span>
        </span>
        <span className="sr-only">Status: {columns.find((column) => column.status === task.status)?.label}</span>
      </div>
    </article>
  );
}
