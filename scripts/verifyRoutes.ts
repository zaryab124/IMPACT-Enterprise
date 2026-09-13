const routes = [
  { path: "/", expected: [200] },
  { path: "/about", expected: [200] },
  { path: "/solutions", expected: [200] },
  { path: "/solutions/ai-agents", expected: [200] },
  { path: "/solutions/automation", expected: [200] },
  { path: "/solutions/software", expected: [200] },
  { path: "/products", expected: [200] },
  { path: "/projects", expected: [200] },
  { path: "/projects/restaurant-technology-platform", expected: [200] },
  { path: "/projects/lead-crm-automation-engine", expected: [200] },
  { path: "/projects/enterprise-knowledge-agent", expected: [200] },
  { path: "/contact", expected: [200] },
  { path: "/start-a-project", expected: [200] },
  { path: "/admin/login", expected: [200] },
  { path: "/admin/knowledge", expected: [307, 302, 308] },
  { path: "/admin/dashboard", expected: [307, 302, 308] },
  { path: "/admin/leads", expected: [307, 302, 308] },
  { path: "/admin/customers", expected: [307, 302, 308] },
  { path: "/admin/conversations", expected: [307, 302, 308] },
  { path: "/admin/appointments", expected: [307, 302, 308] },
  { path: "/admin/channels", expected: [307, 302, 308] },
  { path: "/admin/voice", expected: [307, 302, 308] },
  { path: "/admin/analytics", expected: [307, 302, 308] },
  { path: "/admin/settings", expected: [307, 302, 308] },
  { path: "/api/health", expected: [200] },
  { path: "/api/knowledge/search?q=agents", expected: [200] },
  { path: "/api/chat/history", expected: [400] },
  { path: "/api/messages/send", expected: [401, 405] },
  { path: "/api/admin/voice", expected: [401, 403] },
  { path: "/api/admin/voice/recordings", expected: [401, 403] },
  { path: "/api/admin/analytics", expected: [401, 403] },
  { path: "/api/admin/analytics/export", expected: [401, 403] },
  { path: "/api/voice/session", expected: [405] },
  { path: "/api/voice/analyze", expected: [405] },
];

async function check() {
  console.log("Verifying complete route suite...");
  let failed = 0;
  for (const r of routes) {
    try {
      const res = await fetch("http://localhost:3005" + r.path, { redirect: "manual" });
      const ok = r.expected.includes(res.status);
      console.log(`${ok ? "  [PASS]" : "  [FAIL]"} ${r.path} -> HTTP ${res.status}`);
      if (!ok) failed++;
    } catch (err: any) {
      console.log(`  [FAIL] ${r.path} -> Network Error: ${err.message}`);
      failed++;
    }
  }
  if (failed > 0) {
    console.error(`Route check failed with ${failed} errors.`);
    process.exit(1);
  }
  console.log("\nALL ROUTES VERIFIED SUCCESSFULLY (0 FAILURES)!\n");
}

check();
