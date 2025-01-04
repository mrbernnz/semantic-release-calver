class SemanticReleaseError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'SemanticReleaseError';
    this.code = code;
    this.details = details || '';
  }
}

module.exports = SemanticReleaseError;