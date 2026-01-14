import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "@/components/video-player";
import QuizView from "@/components/Quize/QuizView";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LearnLesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const normalizeVideoUrl = (rawUrl) => {
    if (!rawUrl) return "";
    if (typeof rawUrl !== "string") return "";
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
    if (rawUrl.startsWith("/uploads")) return `${API_BASE_URL}${rawUrl}`;
    return rawUrl;
  };

  const studentId = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.id || payload?._id || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const [courseRes, enrollRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/courses/${courseId}`),
          fetch(`${API_BASE_URL}/api/enrollments/check?studentId=${studentId}&courseId=${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!courseRes.ok) {
          throw new Error("Failed to load course");
        }

        const courseData = await courseRes.json();
        setCourse(courseData);

        if (!enrollRes.ok) {
          throw new Error("Failed to check enrollment");
        }

        const enrollData = await enrollRes.json();
        const enrolled = !!enrollData?.isEnrolled;
        setIsEnrolled(enrolled);
        if (!enrolled) {
          toast.error("You are not enrolled in this course.");
          navigate(`/courses/${courseId}`, { replace: true });
          return;
        }

        let foundLesson = null;
        for (const mod of courseData?.modules || []) {
          for (const l of mod?.lessons || []) {
            const id = (l?._id || l?.id)?.toString();
            if (id === lessonId) {
              foundLesson = l;
              break;
            }
          }
          if (foundLesson) break;
        }

        if (!foundLesson) {
          toast.error("Lesson not found.");
          navigate(`/courses/${courseId}`, { replace: true });
          return;
        }

        setLesson(foundLesson);
      } catch (err) {
        toast.error(err?.message || "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) load();
  }, [API_BASE_URL, courseId, lessonId, navigate, studentId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-24 px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          Loading lesson...
        </div>
      </div>
    );
  }

  if (!course || !lesson || !isEnrolled) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto mt-24 px-4 pb-16">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">{course.title}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        {lesson.type === "quiz" ? (
          <QuizView
            lesson_id={lessonId}
            studentId={studentId}
            courseId={courseId}
            onComplete={() => {
              toast.success("Progress saved.");
            }}
          />
        ) : lesson?.video?.url ? (
          <VideoPlayer
            url={normalizeVideoUrl(lesson.video.url)}
            width="100%"
            height="520px"
            courseId={courseId}
            studentId={studentId}
            lessonId={lessonId}
            onComplete={() => {
              toast.success("Lesson completed.");
            }}
          />
        ) : (
          <div className="p-8 text-center text-muted-foreground">This lesson has no content.</div>
        )}
      </div>
    </div>
  );
};

export default LearnLesson;
