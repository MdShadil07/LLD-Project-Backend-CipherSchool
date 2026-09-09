import { MongoProblemRepository } from '../infrastructure/repositories/mongo-problem.repository.js';
import { GetProblem, GetProblems } from '../application/problem/problem.use-cases.js';

const repository = new MongoProblemRepository();
const getProblems = new GetProblems(repository);
const getProblem = new GetProblem(repository);

function serializeProblem(problem, summary = false) {
  return {
    id: problem._id.toString(),
    slug: problem.slug,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    ...(summary ? {} : {
      requirements: problem.requirements,
      nonFunctionalRequirements: problem.nonFunctionalRequirements,
      rubric: problem.rubric,
      beforeYouStart: problem.beforeYouStart,
    }),
    topics: problem.topics,
    estimatedTime: problem.estimatedTime,
    createdAt: problem.createdAt,
  };
}

export async function listProblems(_req, res) {
  const problems = await getProblems.execute();
  res.json({ problems: problems.map((problem) => serializeProblem(problem, true)) });
}

export async function getProblemBySlug(req, res) {
  const problem = await getProblem.execute(req.params.slug);
  res.json({ problem: serializeProblem(problem) });
}
