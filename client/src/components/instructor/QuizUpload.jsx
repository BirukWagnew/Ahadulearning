import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash, Upload, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const QuizUpload = ({ lessonId, onQuizUploaded }) => {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([
    {
      question: "",
      type: "single",
      points: 1,
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ]
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        type: "single",
        points: 1,
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false }
        ]
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({ text: "", isCorrect: false });
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    const options = updatedQuestions[questionIndex].options;
    if (options.length > 2) {
      options.splice(optionIndex, 1);
      setQuestions(updatedQuestions);
    }
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswer = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    
    if (question.type === "single") {
      // For single choice, uncheck all other options
      question.options.forEach((option, i) => {
        option.isCorrect = i === optionIndex;
      });
    } else {
      // For multiple choice, toggle this option
      question.options[optionIndex].isCorrect = !question.options[optionIndex].isCorrect;
    }
    
    setQuestions(updatedQuestions);
  };

  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      toast.error("Quiz title is required");
      return false;
    }

    if (questions.length === 0) {
      toast.error("At least one question is required");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }

      if (question.options.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options`);
        return false;
      }

      const hasCorrectOption = question.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        toast.error(`Question ${i + 1} must have at least one correct answer`);
        return false;
      }

      const allOptionsHaveText = question.options.every(option => option.text.trim());
      if (!allOptionsHaveText) {
        toast.error(`Question ${i + 1} has empty option text`);
        return false;
      }
    }

    return true;
  };

  const handleUploadQuiz = async () => {
    if (!validateQuiz()) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      // Upload each question to the backend
      const uploadPromises = questions.map(async (question) => {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lessonId}/questions`,
          {
            question: question.question,
            options: question.options,
            type: question.type,
            points: question.points
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        return response.data;
      });

      await Promise.all(uploadPromises);

      toast.success("Quiz uploaded successfully!");
      
      // Reset form
      setQuizTitle("");
      setQuizDescription("");
      setTimeLimit(15);
      setPassingScore(70);
      setQuestions([
        {
          question: "",
          type: "single",
          points: 1,
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false }
          ]
        }
      ]);

      if (onQuizUploaded) {
        onQuizUploaded();
      }

    } catch (error) {
      console.error("Error uploading quiz:", error);
      toast.error(error.response?.data?.message || "Failed to upload quiz");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Quiz
        </CardTitle>
        <CardDescription>
          Create and upload quiz questions for this lesson
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quiz Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quiz-title">Quiz Title</Label>
            <Input
              id="quiz-title"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="time-limit">Time Limit (minutes)</Label>
            <Input
              id="time-limit"
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min="1"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="quiz-description">Description (Optional)</Label>
          <Textarea
            id="quiz-description"
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
            placeholder="Enter quiz description"
            className="mt-1"
          />
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Questions</h3>
            <Button onClick={addQuestion} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.map((question, qIndex) => (
            <Card key={qIndex} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Question {qIndex + 1}</h4>
                  {questions.length > 1 && (
                    <Button
                      onClick={() => removeQuestion(qIndex)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div>
                  <Label>Question Text</Label>
                  <Textarea
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                    placeholder="Enter your question"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Question Type</Label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(qIndex, "type", e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 p-2"
                    >
                      <option value="single">Single Choice</option>
                      <option value="multiple">Multiple Choice</option>
                    </select>
                  </div>
                  <div>
                    <Label>Points</Label>
                    <Input
                      type="number"
                      value={question.points}
                      onChange={(e) => updateQuestion(qIndex, "points", Number(e.target.value))}
                      min="1"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    <Button
                      onClick={() => addOption(qIndex)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>

                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={() => handleCorrectAnswer(qIndex, oIndex)}
                      />
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(qIndex, oIndex, "text", e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1"
                      />
                      {question.options.length > 2 && (
                        <Button
                          onClick={() => removeOption(qIndex, oIndex)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Upload Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleUploadQuiz}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Upload Quiz
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizUpload;
