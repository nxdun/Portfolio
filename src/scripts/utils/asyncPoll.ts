export type AsyncPollStepResult<TValue> = {
  done: boolean;
  value?: TValue;
};

export type AsyncPollOptions<TValue> = {
  intervalMs: number;
  maxAttempts: number;
  signal?: AbortSignal;
  step: (
    attempt: number,
    signal?: AbortSignal
  ) => Promise<AsyncPollStepResult<TValue>>;
};

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    let timeoutId: number | null = window.setTimeout(() => {
      timeoutId = null;
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }

      signal?.removeEventListener("abort", onAbort);
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function asyncPoll<TValue>(
  options: AsyncPollOptions<TValue>
): Promise<TValue | null> {
  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    if (options.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const result = await options.step(attempt, options.signal);
    if (result.done) {
      return result.value ?? null;
    }

    if (attempt < options.maxAttempts) {
      await delay(options.intervalMs, options.signal);
    }
  }

  return null;
}
