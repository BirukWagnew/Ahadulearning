import React, { useEffect, useState } from "react";
import { Star, Users } from "lucide-react";
import axios from "axios";

const RelatedCourses = ({ courseId }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const coursePlaceholder =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
        <rect width='100%' height='100%' fill='#e2e8f0'/>
        <g fill='#64748b' font-family='Arial, sans-serif' font-size='14'>
          <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>No image</text>
        </g>
      </svg>`
    );

  useEffect(() => {
    const fetchRelatedCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/recommendations/courses/${courseId}/related`);
        setCourses(response.data.related || []);
      } catch (error) {
        console.error("Failed to fetch related courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchRelatedCourses();
  }, [courseId]);

  if (loading) {
    return (
      <div className="max-w-3xl p-4 bg-white rounded shadow-sm">
        <p className="text-gray-500">Loading related courses...</p>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="max-w-3xl p-4 bg-white rounded shadow-sm">
        <p className="text-gray-500">No related courses found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl p-4 bg-white rounded shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Related Courses</h2>
      {courses.map((course) => (
        <div
          key={course._id}
          className="flex items-start gap-4 border-b pb-4 last:border-none"
        >
          <img
            src={(() => {
              const raw = typeof course.thumbnail === "string" ? course.thumbnail : course.thumbnail?.url;
              if (!raw) return coursePlaceholder;
              return raw.startsWith("http") ? raw : `${API_BASE_URL}${raw}`;
            })()}
            alt={course.title}
            className="w-16 h-16 rounded object-cover"
            onError={(e) => {
              e.currentTarget.src = coursePlaceholder;
            }}
          />
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-gray-800 leading-snug hover:underline cursor-pointer">
              {course.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1">{course.description}</p>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1 text-yellow-500 font-medium">
                {course.rating || 0} <Star size={14} fill="currentColor" />
              </span>
              <span className="mx-2">·</span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {course.students?.toLocaleString() || 0}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {course.hours && (
                <span className="font-medium text-green-600">
                  {course.hours} total hours
                </span>
              )}
              {course.updated && <span className="ml-2">· Updated {course.updated}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">
              {course.price ? `${course.price} ETB` : "Free"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RelatedCourses;
