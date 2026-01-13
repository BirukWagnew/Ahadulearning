import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow, 
} from "@/components/ui/table";
import CourseBuilder from "./CourseBuilder";
import { toast } from "sonner";
import { getCategoryImage } from "@/utils/categoryImages";

const CourseTable = ({ courses = [], onCreate, onViewAll, showStatus, showActions }) => {
  if (!Array.isArray(courses)) {
    console.error("CourseTable expected an array for courses but got:", courses);
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.length > 0 ? (
        courses.map((course) => (
          <div key={course._id || course.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
            {/* Course Thumbnail */}
            <div className="h-40 bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
              <img
                src={getCategoryImage(course.category || 'default')}
                alt={course.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1524178232393-3dcfa7c3893d?w=400&h=300&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
              {showStatus && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                    {course.status || "Draft"}
                  </span>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2">
                {course.title}
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {course.students || 0} students
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {course.progress || 0}% complete
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-fidel-500 rounded-full"
                  style={{ width: `${course.progress || 0}%` }}
                />
              </div>

              {showActions && (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    View
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <div className="text-slate-500 dark:text-slate-400">
            No courses found.
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseTable;

