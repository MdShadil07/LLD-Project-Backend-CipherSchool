import { AppError } from '../../utils/app-error.js';

export class ListProblemEvaluations {
  constructor(submissionRepository, evaluationRepository) {
    this.submissionRepository = submissionRepository;
    this.evaluationRepository = evaluationRepository;
  }

  async execute(userId, problemId) {
    const submissions = await this.submissionRepository.findByUserAndProblem(userId, problemId);
    const evaluations = await this.evaluationRepository.findBySubmissionIds(submissions.map((submission) => submission._id || submission.id));
    const evaluationsBySubmission = new Map(evaluations.map((evaluation) => [evaluation.submissionId.toString(), evaluation]));

    return submissions.map((submission) => ({
      submission,
      evaluation: evaluationsBySubmission.get((submission._id || submission.id).toString()) || null,
    }));
  }
}
