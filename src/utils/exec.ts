import { spawn } from "node:child_process";

export type ExecLimits = {
  timeoutMs: number;
  maxOutputBytes: number;
};

export async function runCommand(command: string, limits: ExecLimits): Promise<string> {
  const [file, ...args] = splitCommand(command);
  if (!file) {
    throw new Error("Command must not be empty");
  }

  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { shell: false, stdio: ["ignore", "pipe", "pipe"] });
    const chunks: Buffer[] = [];
    let capturedBytes = 0;
    let settled = false;

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      finish(new Error(`Command timed out after ${limits.timeoutMs}ms`));
    }, limits.timeoutMs);

    const capture = (chunk: Buffer): void => {
      capturedBytes += chunk.byteLength;
      if (capturedBytes > limits.maxOutputBytes) {
        child.kill("SIGTERM");
        finish(new Error(`Command output exceeded ${limits.maxOutputBytes} bytes`));
        return;
      }
      chunks.push(chunk);
    };

    child.stdout.on("data", capture);
    child.stderr.on("data", capture);
    child.on("error", finish);
    child.on("close", (code) => {
      if (code && code !== 0) {
        finish(new Error(`Command exited with code ${code}`));
        return;
      }
      finish();
    });

    function finish(error?: Error): void {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      if (error) {
        reject(error);
        return;
      }
      resolve(Buffer.concat(chunks).toString("utf8"));
    }
  });
}

function splitCommand(command: string): string[] {
  return command.match(/"[^"]+"|'[^']+'|\S+/g)?.map((part) => part.replace(/^["']|["']$/g, "")) ?? [];
}
