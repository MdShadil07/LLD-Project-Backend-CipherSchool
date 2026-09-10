export class GetDashboard {
  constructor({ attemptRepository, submissionRepository, evaluationRepository, problemRepository }) {
    this.attemptRepository = attemptRepository;
    this.submissionRepository = submissionRepository;
    this.evaluationRepository = evaluationRepository;
    this.problemRepository = problemRepository;
  }

  async execute(userId) {
    const [attempts, submissions] = await Promise.all([
      this.attemptRepository.findByUser(userId),
      this.submissionRepository.findByUser(userId),
    ]);
    const evaluations = submissions.length
      ? await this.evaluationRepository.findBySubmissionIds(submissions.map((submission) => submission._id || submission.id))
      : [];
    const problems = await this.problemRepository.findBySlugs([...new Set(attempts.map((attempt) => attempt.problemId))]);
    const problemsBySlug = new Map(problems.map((problem) => [problem.slug, problem]));
    const submissionsByAttempt = new Map(submissions.map((submission) => [submission.attemptId.toString(), submission]));
    const evaluationsBySubmission = new Map(evaluations.map((evaluation) => [evaluation.submissionId.toString(), evaluation]));
    const completed = evaluations.filter((evaluation) => evaluation.status === 'COMPLETED' && Number.isFinite(evaluation.overallScore));
    const sortedAttempts = [...attempts].sort((a, b) => new Date(b.lastSavedAt).getTime() - new Date(a.lastSavedAt).getTime());

    const enrich = (attempt) => {
      const submission = submissionsByAttempt.get((attempt._id || attempt.id).toString());
      return {
        attempt,
        problem: problemsBySlug.get(attempt.problemId) || null,
        evaluation: submission ? evaluationsBySubmission.get((submission._id || submission.id).toString()) || null : null,
      };
    };

    return {
      metrics: {
        problemsSolved: new Set(completed.map((evaluation) => {
          const submission = submissions.find((item) => (item._id || item.id).toString() === evaluation.submissionId.toString());
          return submission?.problemId;
        }).filter(Boolean)).size,
        totalAttempts: attempts.length,
        averageScore: completed.length ? round(completed.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / completed.length) : null,
        practiceSeconds: attempts.reduce((sum, attempt) => sum + (attempt.timeSpentSeconds || 0), 0),
      },
      activity: buildActivity(attempts),
      scoreHistory: completed
        .sort((a, b) => new Date(a.completedAt || a.updatedAt).getTime() - new Date(b.completedAt || b.updatedAt).getTime())
        .slice(-8)
        .map((evaluation) => ({ score: evaluation.overallScore, completedAt: evaluation.completedAt || evaluation.updatedAt })),
      continueAttempt: sortedAttempts.find((attempt) => attempt.status === 'DRAFT') ? enrich(sortedAttempts.find((attempt) => attempt.status === 'DRAFT')) : null,
      recentAttempts: sortedAttempts.slice(0, 5).map(enrich),
    };
  }
}

function buildActivity(attempts) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  return days.map((date) => ({
    label: date.toLocaleDateString('en-US', { weekday: 'short' }),
    attempts: attempts.filter((attempt) => new Date(attempt.lastSavedAt).toDateString() === date.toDateString()).length,
  }));
}

function round(value) {
  return Number(value.toFixed(2));
}
