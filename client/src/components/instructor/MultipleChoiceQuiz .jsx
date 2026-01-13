import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "../ui/Checkbox ";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, Check, X, HelpCircle, Upload, FileText } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "sonner";

const MultipleChoiceQuiz = ({
  initialQuestions = [],
  onChange,
  readOnly = false,
}) => {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState(initialQuestions);
  const [activeQuestion, setActiveQuestion] = useState(
    initialQuestions.length > 0 ? initialQuestions[0].id : null
  );
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);
  const timeoutRef = useRef(null);

  // Check if quiz is complete
  const isQuizComplete = useCallback(() => {
    if (questions.length === 0) return false;
    
    return questions.every(question => {
      return (
        question.question.trim() !== '' &&
        question.options.length >= 2 &&
        question.options.every(option => option.text.trim() !== '') &&
        question.options.some(option => option.isCorrect)
      );
    });
  }, [questions]);

  // Show completion toast once when quiz becomes complete
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (isQuizComplete() && !hasShownCompletionToast) {
        toast.success("Quiz completed successfully! 🎉");
        setHasShownCompletionToast(true);
      } else if (!isQuizComplete() && hasShownCompletionToast) {
        setHasShownCompletionToast(false);
      }
    }, 1000); // Wait 1 second to avoid spam during editing

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [questions, isQuizComplete, hasShownCompletionToast]);

  // PDF upload handler
  const handlePdfUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file');
      return;
    }

    setIsUploading(true);
    setPdfFile(file);

    try {
      // Here you would upload to your server
      // For now, just show success and store the file
      toast.success('PDF uploaded successfully');
      
      // You can add the PDF to the quiz data or handle it as needed
      const updatedQuestions = questions.map(q => ({
        ...q,
        pdfAttachment: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file) // temporary URL for preview
        }
      }));
      
      setQuestions(updatedQuestions);
      if (onChange) {
        onChange(updatedQuestions);
      }
    } catch (error) {
      toast.error('Failed to upload PDF');
      console.error('PDF upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handlePdfUpload(file);
    }
  };

  const handleQuestionChange = (questionId, updatedQuestion) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, ...updatedQuestion } : q
    );
    setQuestions(updatedQuestions);
    if (onChange) {
      onChange(updatedQuestions);
    }
  };

  const handleOptionChange = (questionId, optionId, updatedOption) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const updatedOptions = q.options.map((o) =>
          o.id === optionId ? { ...o, ...updatedOption } : o
        );
        return { ...q, options: updatedOptions };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    if (onChange) {
      onChange(updatedQuestions);
    }
  };

  const handleCorrectAnswerChange = (questionId, optionId, checked) => {
    const question = questions.find((q) => q.id === questionId);

    if (!question) return;

    let updatedQuestions = [...questions];

    if (question.type === "single" && checked) {
      // For single choice, unselect all other options
      updatedQuestions = updatedQuestions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((o) => ({
              ...o,
              isCorrect: o.id === optionId,
            })),
          };
        }
        return q;
      });
    } else {
      // For multiple choice, just toggle the current option
      updatedQuestions = updatedQuestions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((o) => {
              if (o.id === optionId) {
                return { ...o, isCorrect: checked };
              }
              return o;
            }),
          };
        }
        return q;
      });
    }

    setQuestions(updatedQuestions);
    if (onChange) {
      onChange(updatedQuestions);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `question-${Date.now()}`,
      question: "",
      options: [
        { id: `option-${Date.now()}-1`, text: "", isCorrect: false },
        { id: `option-${Date.now()}-2`, text: "", isCorrect: false },
        { id: `option-${Date.now()}-3`, text: "", isCorrect: false },
        { id: `option-${Date.now()}-4`, text: "", isCorrect: false },
      ],
      type: "single",
      points: 1,
    };

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    setActiveQuestion(newQuestion.id);

    if (onChange) {
      onChange(updatedQuestions);
    }
  };

  const addOption = (questionId) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [
            ...q.options,
            { id: `option-${Date.now()}`, text: "", isCorrect: false },
          ],
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);
    if (onChange) {
      onChange(updatedQuestions);
    }
  };

  const removeQuestion = (questionId) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(updatedQuestions);

    if (activeQuestion === questionId) {
      setActiveQuestion(
        updatedQuestions.length > 0 ? updatedQuestions[0].id : null
      );
    }

    if (onChange) {
      onChange(updatedQuestions);
    }

    // Reset completion toast state when removing questions
    setHasShownCompletionToast(false);
  };

  const removeOption = (questionId, optionId) => {
    const question = questions.find((q) => q.id === questionId);

    if (!question || question.options.length <= 2) {
      toast.error("A question must have at least 2 options");
      return;
    }

    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.filter((o) => o.id !== optionId),
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);
    if (onChange) {
      onChange(updatedQuestions);
    }
  };

  const toggleQuestionType = (questionId) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const newType = q.type === "single" ? "multiple" : "single";

        let updatedOptions = q.options;
        if (newType === "single") {
          const correctOptions = q.options.filter((o) => o.isCorrect);
          if (correctOptions.length > 1) {
            updatedOptions = q.options.map((o, index) => ({
              ...o,
              isCorrect: index === 0 ? true : false,
            }));
          }
        }

        return {
          ...q,
          type: newType,
          options: updatedOptions,
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);
    if (onChange) {
      onChange(updatedQuestions);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {questions.length === 0
            ? "No questions yet"
            : `${questions.length} Question(s)`}
        </h3>
        <div className="flex items-center space-x-2">
          {!readOnly && (
            <>
              {/* PDF Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Button variant="outline" size="sm" disabled={isUploading}>
                  {isUploading ? (
                    <div className="animate-spin mr-2">⏳</div>
                  ) : (
                    <Upload size={16} className="mr-2" />
                  )}
                  {pdfFile ? 'Change PDF' : 'Upload PDF'}
                </Button>
              </div>
              
              <Button onClick={addQuestion} size="sm">
                <PlusCircle size={16} className="mr-2" />
                Add Question
              </Button>
            </>
          )}
        </div>
      </div>

      {/* PDF Attachment Display */}
      {pdfFile && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="flex items-center space-x-2">
            <FileText size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {pdfFile.name}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPdfFile(null);
                const updatedQuestions = questions.map(q => {
                  const { pdfAttachment, ...rest } = q;
                  return rest;
                });
                setQuestions(updatedQuestions);
                if (onChange) {
                  onChange(updatedQuestions);
                }
              }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-md">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No Questions Yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first question to get started
          </p>
          {!readOnly && (
            <Button onClick={addQuestion} className="mt-4">
              Add Question
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-3 border rounded-md cursor-pointer ${
                    activeQuestion === question.id
                      ? "border-fidel-500 bg-fidel-50 dark:bg-slate-800"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveQuestion(question.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Question {index + 1}</div>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(question.id);
                        }}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {question.question || "Untitled question"}
                  </div>
                  <div className="text-xs mt-1">
                    <span
                      className={`px-1.5 py-0.5 rounded-full ${
                        question.type === "single"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                      }`}
                    >
                      {question.type === "single"
                        ? "Single choice"
                        : "Multiple choice"}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {question.points}{" "}
                      {question.points === 1 ? "point" : "points"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            {activeQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    {!readOnly ? (
                      <Input
                        value={
                          questions.find((q) => q.id === activeQuestion)
                            ?.question || ""
                        }
                        onChange={(e) =>
                          handleQuestionChange(activeQuestion, {
                            question: e.target.value,
                          })
                        }
                        placeholder="Enter your question here"
                        className="font-medium"
                      />
                    ) : (
                      <div>
                        {questions.find((q) => q.id === activeQuestion)
                          ?.question || ""}
                      </div>
                    )}
                  </CardTitle>
                  {!readOnly && (
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-4">
                        <div>
                          <Label htmlFor="question-type" className="mr-2">
                            Question Type:
                          </Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleQuestionType(activeQuestion)}
                          >
                            {questions.find((q) => q.id === activeQuestion)
                              ?.type === "single"
                              ? "Single Choice"
                              : "Multiple Choice"}
                          </Button>
                        </div>
                        <div>
                          <Label htmlFor="points" className="mr-2">
                            Points:
                          </Label>
                          <Input
                            id="points"
                            type="number"
                            min="1"
                            max="100"
                            value={
                              questions.find((q) => q.id === activeQuestion)
                                ?.points || 1
                            }
                            onChange={(e) =>
                              handleQuestionChange(activeQuestion, {
                                points: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-20 inline-block"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {questions
                      .find((q) => q.id === activeQuestion)
                      ?.options.map((option, index) => (
                        <div
                          key={option.id}
                          className="flex items-start space-x-2"
                        >
                          <div className="mt-2">
                            {questions.find((q) => q.id === activeQuestion)
                              ?.type === "single" ? (
                              <RadioGroup
                                disabled={readOnly}
                                value={option.isCorrect ? option.id : undefined}
                                onValueChange={(value) => {
                                  if (value === option.id) {
                                    handleCorrectAnswerChange(
                                      activeQuestion,
                                      option.id,
                                      true
                                    );
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value={option.id}
                                    id={`radio-${option.id}`}
                                    checked={option.isCorrect}
                                  />
                                </div>
                              </RadioGroup>
                            ) : (
                              <Checkbox
                                id={`checkbox-${option.id}`}
                                checked={option.isCorrect}
                                onCheckedChange={(checked) =>
                                  handleCorrectAnswerChange(
                                    activeQuestion,
                                    option.id,
                                    checked
                                  )
                                }
                                disabled={readOnly}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            {!readOnly ? (
                              <Input
                                value={option.text}
                                onChange={(e) =>
                                  handleOptionChange(
                                    activeQuestion,
                                    option.id,
                                    {
                                      text: e.target.value,
                                    }
                                  )
                                }
                                placeholder={`Option ${index + 1}`}
                              />
                            ) : (
                              <div className="p-2 border rounded-md">
                                {option.text || `Option ${index + 1}`}
                                {option.isCorrect && (
                                  <span className="ml-2 text-green-500">
                                    <Check size={16} className="inline" />
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {!readOnly && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeOption(activeQuestion, option.id)
                              }
                              disabled={
                                questions.find((q) => q.id === activeQuestion)
                                  ?.options.length <= 2
                              }
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>

                {!readOnly && (
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={() => addOption(activeQuestion)}
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Add Option
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceQuiz;
