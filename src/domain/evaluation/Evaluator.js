/**
 * Provider-neutral evaluator contract.
 *
 * OpenAI, Gemini, deterministic rules, and test doubles must implement this
 * boundary. Application code must not depend on a provider SDK.
 */
export class Evaluator {
  get type() {
    throw new Error('Not implemented');
  }

  get version() {
    throw new Error('Not implemented');
  }

  async evaluate(_problem, _submission, _rubric) {
    throw new Error('Not implemented');
  }
}
