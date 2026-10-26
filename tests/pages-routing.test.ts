import { afterEach, describe, expect, it } from "vitest";
import { pageFromPath, workspaceHref } from "../src/lib/workspace";
import { publicAsset } from "../src/lib/paths";
const previous = process.env.NEXT_PUBLIC_BASE_PATH;
afterEach(() => {
  if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
  else process.env.NEXT_PUBLIC_BASE_PATH = previous;
});
describe("GitHub Pages demo paths", () => {
  it("supports direct and trailing-slash workspace paths with or without the repository base", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/cloudlens";
    expect(pageFromPath("/cloudlens/network-flows/")).toBe("network");
    expect(pageFromPath("/network-flows/")).toBe("network");
    expect(pageFromPath("/cloudlens/")).toBe("overview");
    expect(publicAsset("/aws/ec2.svg")).toBe("/cloudlens/aws/ec2.svg");
    // Next Link/router adds basePath; generated hrefs must not add it twice.
    expect(workspaceHref("costs", "brightloop", "month", "engineer")).toBe(
      "/cost-explorer?client=brightloop&period=month&role=engineer",
    );
  });
  it("retains the local server's root asset and routing paths", () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    expect(publicAsset("/aws/ec2.svg")).toBe("/aws/ec2.svg");
    expect(pageFromPath("/reports")).toBe("reports");
  });
});
