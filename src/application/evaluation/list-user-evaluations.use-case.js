export class ListUserEvaluations {
  constructor({ submissionRepository, evaluationRepository, problemRepository }) {
    this.submissionRepository = submissionRepository;
    this.evaluationRepository = evaluationRepository;
    this.problemRepository = problemRepository;
  }

  async execute(userId) {
    const submissions = await this.submissionRepository.findByUser(userId);
    if (submissions.length === 0) return { totals: emptyTotals(), problems: [] };

    const evaluations = await this.evaluationRepository.findBySubmissionIds(submissions.map((submission) => submission._id || submission.id));
    const evaluationsBySubmission = new Map(evaluations.map((evaluation) => [evaluation.submissionId.toString(), evaluation]));
    const slugs = [...new Set(submissions.map((submission) => submission.problemId))];
    const problems = await this.problemRepository.findBySlugs(slugs);
    const problemsBySlug = new Map(problems.map((problem) => [problem.slug, problem]));
    const grouped = new Map();

    for (const submission of submissions) {
      const evaluation = evaluationsBySubmission.get((submission._id || submission.id).toString()) || null;
      const problem = problemsBySlug.get(submission.problemId);
      if (!grouped.has(submission.problemId)) grouped.set(submission.problemId, { problemId: submission.problemId, title: problem?.title || submission.problemId, submissions: [] });
      grouped.get(submission.problemId).submissions.push({ submission, evaluation });
    }

    const allEvaluations = evaluations.filter((evaluation) => evaluation.status === 'COMPLETED' && Number.isFinite(evaluation.overallScore));
    return {
      totals: {
        ...emptyTotals(),
        questionsAttempted: grouped.size,
        submissions: submissions.length,
        completedEvaluations: allEvaluations.length,
        averageScore: allEvaluations.length ? round(allEvaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / allEvaluations.length) : null,
        bestScore: allEvaluations.length ? Math.max(...allEvaluations.map((evaluation) => evaluation.overallScore)) : null,
      },
      problems: [...grouped.values()],
    };
  }
}

function emptyTotals() {
  return { questionsAttempted: 0, submissions: 0, completedEvaluations: 0, averageScore: null, bestScore: null };
}

function round(value) {
  return Number(value.toFixed(2));
}
