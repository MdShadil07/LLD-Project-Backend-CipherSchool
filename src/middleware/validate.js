import { AppError } from '../utils/app-error.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(400, 'Please correct the highlighted fields', result.error.flatten().fieldErrors));
  }
  req.body = result.data;
  next();
};
