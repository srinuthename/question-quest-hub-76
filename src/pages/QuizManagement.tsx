import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { QuizEntryModule } from "@/components/QuizEntryModule";
import {
  exportAllQuizzes,
  importQuizPackage,
  listQuizzes,
  loadQuizWithQuestions,
  saveQuizAndQuestions,
  deleteQuiz,
} from "@/lib/quizManagementDB";
import { analyzeQuizImportText } from "@/lib/quizImportEngine";
import type { QuizImportPackage, QuizRecord } from "@/types/quizManagement";

const buildSamplePackage = (): QuizImportPackage => {
  const now = Date.now();
  const quizId = "general_knowledge_te";

  const questionBank = [
    { te: "భారత రాజధాని ఏమిటి?", en: "What is the capital of India?", optionsTe: ["ముంబై", "న్యూ ఢిల్లీ", "చెన్నై", "కోల్‌కతా"], optionsEn: ["Mumbai", "New Delhi", "Chennai", "Kolkata"], correct: 1, expTe: "భారత రాజధాని న్యూ ఢిల్లీ.", expEn: "New Delhi is the capital of India." },
    { te: "5 + 7 = ?", en: "5 + 7 = ?", optionsTe: ["10", "11", "12", "13"], optionsEn: ["10", "11", "12", "13"], correct: 2, expTe: "5 + 7 = 12.", expEn: "5 + 7 = 12." },
    { te: "సౌర కుటుంబంలో అతిపెద్ద గ్రహం?", en: "Largest planet in the solar system?", optionsTe: ["భూమి", "అంగారకుడు", "గురు", "శుక్రుడు"], optionsEn: ["Earth", "Mars", "Jupiter", "Venus"], correct: 2, expTe: "అతిపెద్ద గ్రహం గురు.", expEn: "Jupiter is the largest planet." },
  ];

  const questionIds = questionBank.map((_, idx) => `${quizId}-q${idx + 1}`);

  const quiz: QuizRecord = {
    id: quizId,
    quizTitle: "General Knowledge",
    quizDescription: "Demo quiz with Telugu base language",
    quizLanguage: "te",
    quizTopicsList: ["general"],
    rounds: [{ roundTitle: "Round 1", roundDescription: "Sample round", roundOrder: 1, roundType: "Generic", questionIds }],
    quizType: "Automatic",
    isPublished: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  const questions = questionBank.map((q, index) => ({
    id: `${quizId}-q${index + 1}`,
    quizId,
    baseLanguage: "te" as const,
    question: { text: q.te },
    choices: q.optionsTe.map((option, choiceIndex) => ({ choiceIndex, content: { text: option } })),
    correctChoiceIndex: q.correct,
    answerExplanation: q.expTe,
    translations: {
      en: {
        question: { text: q.en },
        choices: q.optionsEn.map((option, choiceIndex) => ({ choiceIndex, content: { text: option } })),
        answerExplanation: q.expEn,
      },
    },
    questionType: "multiple-choice" as const,
    difficultyLevel: "easy" as const,
    questionTopics: ["general"],
    questionTags: ["sample"],
    isActive: true,
    usedCount: 0,
    createdAt: now + index,
    updatedAt: now + index,
  }));

  return { quizzes: [quiz], questions };
};

const QuizManagement = () => {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [jsonContent, setJsonContent] = useState("");
  const [jsonValidationErrors, setJsonValidationErrors] = useState<string[]>([]);
  const [jsonWarnings, setJsonWarnings] = useState<string[]>([]);
  const [isJsonValid, setIsJsonValid] = useState<boolean | null>(null);
  const [mergeMode, setMergeMode] = useState(false);
  const [detectedFormat, setDetectedFormat] = useState<"single" | "package" | null>(null);

  const refreshQuizzes = useCallback(async () => {
    try {
      const data = await listQuizzes();
      data.sort((a, b) => b.updatedAt - a.updatedAt);
      setQuizzes(data);
    } catch (error) {
      console.warn('[QuizManagement] Failed to refresh quizzes', error);
      toast({
        title: 'Question Bank Locked',
        description: 'Shared host login is required to access the question bank.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => { refreshQuizzes(); }, [refreshQuizzes]);

  const handleExportAll = useCallback(async () => {
    const data = await exportAllQuizzes();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quiz-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Quiz package exported." });
  }, [toast]);

  const detectFormat = useCallback((text: string): "single" | "package" | null => {
    return analyzeQuizImportText(text).detectedFormat;
  }, []);

  const handleJsonContentChange = useCallback((value: string) => {
    setJsonContent(value);
    setIsJsonValid(null);
    setJsonValidationErrors([]);
    setJsonWarnings([]);
    setDetectedFormat(detectFormat(value));
  }, [detectFormat]);

  const handleValidateJson = () => {
    const analysis = analyzeQuizImportText(jsonContent);
    setDetectedFormat(analysis.detectedFormat);
    setJsonWarnings(analysis.warnings);
    setIsJsonValid(analysis.errors.length === 0);
    setJsonValidationErrors(analysis.errors);
    toast(
      analysis.errors.length === 0
        ? {
            title: "Valid",
            description: analysis.warnings.length
              ? `Package looks good with ${analysis.warnings.length} normalization warning(s).`
              : "Package looks good.",
          }
        : {
            title: "Validation Failed",
            description: "Fix errors before importing.",
            variant: "destructive",
          }
    );
  };

  const handleImportJson = async () => {
    if (!jsonContent.trim()) { toast({ title: "Import Failed", description: "Paste JSON first.", variant: "destructive" }); return; }
    try {
      const analysis = analyzeQuizImportText(jsonContent);
      const normalized = analysis.normalized as QuizImportPackage | null;
      setDetectedFormat(analysis.detectedFormat);
      setJsonWarnings(analysis.warnings);
      if (!normalized || analysis.errors.length > 0) {
        setJsonValidationErrors(analysis.errors);
        setIsJsonValid(false);
        toast({ title: "Import Failed", description: "Validation failed.", variant: "destructive" });
        return;
      }
      const existingIds = new Set(quizzes.map((q) => q.id));
      const conflicts = normalized.quizzes.map((q) => q.id).filter((id) => existingIds.has(id));
      if (conflicts.length > 0 && !window.confirm(`Overwrite existing quizzes: ${conflicts.join(", ")}?`)) return;
      await importQuizPackage(normalized, mergeMode ? "merge" : "replace");
      await refreshQuizzes();
      toast({
        title: "Imported",
        description: analysis.warnings.length
          ? `${normalized.quizzes.length} quiz(es) imported with ${analysis.warnings.length} normalization warning(s).`
          : `${normalized.quizzes.length} quiz(es) imported.`,
      });
    } catch {
      toast({ title: "Import Failed", description: "Could not import JSON.", variant: "destructive" });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleJsonContentChange((reader.result as string) || "");
    reader.readAsText(file);
  };




  const sampleJson = useMemo(() => JSON.stringify(buildSamplePackage(), null, 2), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20 p-3 md:p-4 relative z-10">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-primary">Quiz Management</h1>
            <p className="text-sm text-muted-foreground">Create, edit, import and export quizzes. All data is stored and managed via the backend.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild><Link to="/admin">Back to Admin</Link></Button>
            <Button onClick={handleExportAll}>Export All JSON</Button>
          </div>
        </div>

        {/* Quiz Entry Module FIRST */}
        <QuizEntryModule
          quizzes={quizzes}
          onSaveQuiz={async (quiz, questions) => { await saveQuizAndQuestions(quiz, questions); await refreshQuizzes(); }}
          onDeleteQuiz={async (quizId) => { await deleteQuiz(quizId); await refreshQuizzes(); }}
          onLoadQuiz={loadQuizWithQuestions}
          onExport={handleExportAll}
        />

        {/* JSON Import below */}
        <Card>
          <CardHeader>
            <CardTitle>Import JSON Package</CardTitle>
            <CardDescription>Supports package format (quizzes + questions arrays) and single quiz format (embedded questions in rounds).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="quiz-package-json">Quiz Package JSON</Label>
                <Textarea id="quiz-package-json" value={jsonContent} onChange={(e) => handleJsonContentChange(e.target.value)} rows={8} placeholder="Paste JSON package here..." />
                {detectedFormat && (
                  <Badge variant="outline" className="text-xs">
                    Detected: {detectedFormat === "single" ? "Single Quiz" : "Multi-Quiz Package"}
                  </Badge>
                )}
              </div>
              <div className="w-full md:w-56 space-y-2">
                <Label htmlFor="quiz-package-file">Upload JSON</Label>
                <Input id="quiz-package-file" type="file" accept="application/json" onChange={handleFileUpload} />
                <div className="flex items-center gap-2 py-1">
                  <Switch checked={mergeMode} onCheckedChange={setMergeMode} />
                  <Label className="text-sm">Merge mode</Label>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button size="sm" variant="outline" onClick={handleValidateJson}>Validate</Button>
                  <Button size="sm" onClick={handleImportJson}>Import</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleJsonContentChange(sampleJson)}>Load Sample</Button>
                </div>
              </div>
            </div>

            {isJsonValid === false && jsonValidationErrors.length > 0 && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                <p className="font-medium mb-1">Validation errors:</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  {jsonValidationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                </ul>
              </div>
            )}
            {jsonWarnings.length > 0 && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-700">
                <p className="font-medium mb-1">Normalization notes:</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  {jsonWarnings.map((warning, idx) => <li key={idx}>{warning}</li>)}
                </ul>
              </div>
            )}
            {isJsonValid === true && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-primary">✓ JSON package is valid.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizManagement;
