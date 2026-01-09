import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, Plus } from "lucide-react";

const CourseTable = ({
  courses = [],
  onViewAll,
  onCreate,
  showStatus = false,
  showActions = false,
  onEdit,
  onView,
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const thumbnailPlaceholder =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='54'>
        <rect width='100%' height='100%' fill='#e2e8f0'/>
        <g fill='#64748b' font-family='Arial, sans-serif' font-size='10'>
          <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>No image</text>
        </g>
      </svg>`
    );

  const resolveThumbnail = (course) => {
    const raw = typeof course?.thumbnail === "string" ? course.thumbnail : course?.thumbnail?.url;
    if (!raw) return "";
    return raw.startsWith("http") ? raw : `${API_BASE_URL}${raw}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Your Courses</h3>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All Courses
          </Button>
        )}
        {onCreate && (
          <Button onClick={onCreate} className="w-full md:w-auto">
            <Plus size={16} className="mr-2" />
            Create New Course
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[92px]">Image</TableHead>
              <TableHead>Course</TableHead>
              <TableHead className="hidden sm:table-cell">Students</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="hidden md:table-cell">Last Updated</TableHead>
              {showStatus && (
                <TableHead className="hidden sm:table-cell">Status</TableHead>
              )}
              {(showActions || !onViewAll) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(courses) && courses.length > 0 ? (
              courses.map((course) => (
                <TableRow key={course._id || course.id}>
                  <TableCell>
                    <img
                      src={resolveThumbnail(course) || thumbnailPlaceholder}
                      alt={course.title || "Course"}
                      className="h-12 w-20 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                      onError={(e) => {
                        e.currentTarget.src = thumbnailPlaceholder;
                      }}
                      loading="lazy"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {course.students}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-fidel-500 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {course.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
  {new Date(course.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
     
  })}
</TableCell>
                  {showStatus && (
                    <TableCell className="hidden sm:table-cell">
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                        Published
                      </span>
                    </TableCell>
                  )}
                  {(showActions || !onViewAll) && (
                    <TableCell>
                      {showActions ? (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(course)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView?.(course)}
                          >
                            View
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0"
                          onClick={() => onView?.(course)}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseTable;
