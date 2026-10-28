import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabase.js";
import { analyzeNews } from "../utils/analyzer.js";

const router = Router();

const analysisSchema = z.object({
  headline: z.string().trim().min(5).max(300),
  content: z.string().trim().min(20).max(10000)
});

router.get("/", async (req, res, next) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit ?? "50", 10);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 50;

    const { data, error } = await supabase
      .from("news_analyses")
      .select("id, headline, content, verdict, confidence_score, explanation, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return next(error);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("news_analyses")
      .select("id, headline, content, verdict, confidence_score, explanation, created_at")
      .eq("id", req.params.id)
      .single();

    if (error) return res.status(404).json({ error: "Analysis not found." });
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = analysisSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid input.",
        details: parsed.error.issues.map(issue => issue.message)
      });
    }

    const { headline, content } = parsed.data;
    const analysis = analyzeNews(headline, content);

    const { data, error } = await supabase
      .from("news_analyses")
      .insert({
        headline,
        content,
        verdict: analysis.verdict,
        confidence_score: analysis.confidence_score,
        explanation: analysis.explanation
      })
      .select("id, headline, content, verdict, confidence_score, explanation, created_at")
      .single();

    if (error) return next(error);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
