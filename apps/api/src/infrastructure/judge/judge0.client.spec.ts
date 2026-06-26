import { SubmissionVerdict } from '@prisma/client';
import { mapJudge0Submission } from './judge0.client';

describe('Judge0 status mapping', () => {
  it('maps accepted status', () => {
    const result = mapJudge0Submission(
      {
        stdout: '3',
        stderr: null,
        compile_output: null,
        message: null,
        status: { id: 3, description: 'Accepted' },
        time: '0.012',
        memory: 1024,
      },
      Date.now(),
    );
    expect(result.verdict).toBe(SubmissionVerdict.ACCEPTED);
    expect(result.output).toBe('3');
    expect(result.runtimeMs).toBe(12);
  });

  it('maps compilation error', () => {
    const result = mapJudge0Submission(
      {
        stdout: null,
        stderr: null,
        compile_output: 'syntax error',
        message: null,
        status: { id: 6, description: 'Compilation Error' },
        time: null,
        memory: null,
      },
      Date.now(),
    );
    expect(result.verdict).toBe(SubmissionVerdict.COMPILATION_ERROR);
  });

  it('maps wrong answer', () => {
    const result = mapJudge0Submission(
      {
        stdout: '4',
        stderr: null,
        compile_output: null,
        message: null,
        status: { id: 4, description: 'Wrong Answer' },
        time: '0.01',
        memory: 512,
      },
      Date.now(),
    );
    expect(result.verdict).toBe(SubmissionVerdict.WRONG_ANSWER);
  });
});
