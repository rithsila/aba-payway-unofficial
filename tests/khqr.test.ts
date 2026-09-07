import { describe, it, expect, vi, afterEach } from "vitest";
import { generateKHQR } from "../src/khqr";

describe("generateKHQR", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("returns a base64 SVG data URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, text: () => Promise.resolve('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>'),
    }));
    const result = await generateKHQR({
      emvData: "00020101021229370016test-qr-data", amount: 15.0, currency: "USD", merchantName: "Test Store",
    });
    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it("uses custom header color", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("<svg></svg>") }));
    const result = await generateKHQR({
      emvData: "test-data", amount: 10.0, currency: "USD", merchantName: "Custom Store", headerColor: "#0000ff",
    });
    const svg = atob(result.replace("data:image/svg+xml;base64,", ""));
    expect(svg).toContain("#0000ff");
  });

  it("displays USD amount with dollar sign", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("<svg></svg>") }));
    const result = await generateKHQR({
      emvData: "test-data", amount: 99.0, currency: "USD", merchantName: "Store",
    });
    const svg = atob(result.replace("data:image/svg+xml;base64,", ""));
    expect(svg).toContain("$99.00");
  });

  it("formats KHR amounts without decimals", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("<svg></svg>") }));
    const result = await generateKHQR({
      emvData: "test-data", amount: 61500, currency: "KHR", merchantName: "Store",
    });
    const svg = atob(result.replace("data:image/svg+xml;base64,", ""));
    expect(svg).toContain("61,500");
  });

  it("uses the PayWay KHQR frame layout", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<svg width="280" height="280"><rect width="280" height="280"/></svg>'),
    }));

    const result = await generateKHQR({
      emvData: "test-data",
      amount: 40,
      currency: "USD",
      merchantName: "Coffee Khlaing",
    });

    const svg = atob(result.replace("data:image/svg+xml;base64,", ""));
    expect(svg).toContain('viewBox="0 0 244 407"');
    expect(svg).toContain('width="244" height="407"');
    expect(svg).toContain('aria-label="PayWay KHQR screen branding"');
    expect(svg).toContain('id="aba-pay-logo"');
    expect(svg).toContain('width="196" height="31"');
    expect(svg).toContain(">ABA<");
    expect(svg).toContain(">PAY<");
    expect(svg).toContain(">KHQR<");
    expect(svg).toContain(">Coffee Khlaing<");
    expect(svg).toContain('stroke-dasharray="4 5"');
    expect(svg).toContain('id="qr-area" x="50" y="218" width="144" height="144"');
    expect(svg).toContain('aria-label="KHQR brand mark"');
    expect(svg).toContain("Scan with ABA Mobile or any KHQR");
    expect(svg).toContain("supported banking app");
    expect(svg).not.toContain("SCAN");
    expect(svg).not.toContain("<polyline");
  });
});
