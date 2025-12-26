import { useState } from "react";
import { Course } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, BookOpen, Edit2, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseListProps {
  courses: Course[];
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string | null) => void;
  onCreateCourse: (name: string) => Promise<void>;
  onUpdateCourse: (id: string, name: string) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  taskCountByCourse: Record<string, number>;
}

export function CourseList({
  courses,
  selectedCourseId,
  onSelectCourse,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  taskCountByCourse,
}: CourseListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseName, setCourseName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!courseName.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateCourse(courseName.trim());
      setCourseName("");
      setIsCreateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCourse || !courseName.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateCourse(selectedCourse.id, courseName.trim());
      setIsEditOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;
    setIsSubmitting(true);
    try {
      await onDeleteCourse(selectedCourse.id);
      if (selectedCourseId === selectedCourse.id) {
        onSelectCourse(null);
      }
      setIsDeleteOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setCourseName(course.name);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Courses
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            setCourseName("");
            setIsCreateOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 h-10 sm:h-9",
            !selectedCourseId &&
              "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
          onClick={() => onSelectCourse(null)}
        >
          <BookOpen className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left">All Courses</span>
        </Button>

        {courses.map((course) => (
          <div key={course.id} className="group flex items-center gap-1">
            <Button
              variant="ghost"
              className={cn(
                "flex-1 justify-start gap-2 h-10 sm:h-9",
                selectedCourseId === course.id &&
                  "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              onClick={() => onSelectCourse(course.id)}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: course.color }}
              />
              <span className="flex-1 text-left truncate">{course.name}</span>
              <span className="text-xs text-muted-foreground">
                {taskCountByCourse[course.id] || 0}
              </span>
            </Button>

            {/* Action buttons - always visible on touch, hover on desktop */}
            <div className="flex items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-7 sm:w-7 text-muted-foreground hover:text-foreground active:text-foreground"
                onClick={() => openEditDialog(course)}
              >
                <Edit2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-7 sm:w-7 text-muted-foreground hover:text-destructive active:text-destructive"
                onClick={() => openDeleteDialog(course)}
              >
                <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="pr-8">Add New Course</DialogTitle>
            <DialogDescription className="text-sm">
              Create a course to organize your study tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 sm:py-4">
            <Input
              placeholder="Course name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
              className="h-11 sm:h-10"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 sm:flex-none h-11 sm:h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!courseName.trim() || isSubmitting}
              className="flex-1 sm:flex-none h-11 sm:h-10"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="pr-8">Edit Course</DialogTitle>
            <DialogDescription className="text-sm">
              Update the course name.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 sm:py-4">
            <Input
              placeholder="Course name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              autoFocus
              className="h-11 sm:h-10"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="flex-1 sm:flex-none h-11 sm:h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!courseName.trim() || isSubmitting}
              className="flex-1 sm:flex-none h-11 sm:h-10"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="pr-8">Delete Course?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This will remove "{selectedCourse?.name}" from your courses. Tasks
              assigned to this course will not be deleted but will become
              unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="flex-1 sm:flex-none h-11 sm:h-10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 sm:flex-none h-11 sm:h-10 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
