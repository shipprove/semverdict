import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { captureSurface } from "../src/core/captureSurface.js";

describe("captureSurface", () => {
  it("captures exports, bins, and type entries", async () => {
    const root = await createFixturePackage();

    try {
      const snapshot = await captureSurface(root);

      expect(snapshot.package.name).toBe("@scope/example");
      expect(snapshot.exports).toEqual([
        {
          subpath: ".",
          condition: "import",
          target: "./dist/index.js",
          targetExists: true
        },
        {
          subpath: ".",
          condition: "types",
          target: "./dist/index.d.ts",
          targetExists: true
        },
        {
          subpath: "./missing",
          target: "./dist/missing.js",
          targetExists: false
        }
      ]);
      expect(snapshot.bins).toEqual([
        {
          name: "example",
          target: "./dist/cli.js",
          targetExists: true,
          hasShebang: true
        }
      ]);
      expect(snapshot.types).toEqual([
        {
          source: "types",
          path: "./dist/index.d.ts",
          exists: true
        },
        {
          source: "exports",
          path: "./dist/index.d.ts",
          exists: true
        }
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

async function createFixturePackage(): Promise<string> {
  const root = join(tmpdir(), `semverdict-${crypto.randomUUID()}`);
  await mkdir(join(root, "dist"), { recursive: true });
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({
      name: "@scope/example",
      version: "1.0.0",
      type: "module",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.js"
        },
        "./missing": "./dist/missing.js"
      },
      bin: {
        example: "./dist/cli.js"
      },
      types: "./dist/index.d.ts"
    }),
    "utf8"
  );
  await writeFile(join(root, "dist/index.js"), "export {};\n", "utf8");
  await writeFile(join(root, "dist/index.d.ts"), "export {};\n", "utf8");
  await writeFile(join(root, "dist/cli.js"), "#!/usr/bin/env node\n", "utf8");
  return root;
}
