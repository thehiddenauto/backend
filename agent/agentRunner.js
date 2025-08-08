async function runAgent() {
  log('Agent bootstrapped and patched.');
  const context = JSON.parse(fs.readFileSync(contextPath, 'utf-8'));
  const tasks = [
    'Generate Profile Settings Page (form, theme switch, avatar upload)',
    'Create Social Media API Connector with dummy OAuth flow',
    'Implement Library to store generated posts (JSON file db)',
    'Enhance AI Generator with Template Presets'
  ];
  for (const task of tasks) {
    log(`🧠 TASK: ${task}`);
    const prompt = `You are an autonomous dev agent. Use the following instruction:\n\n"${task}"\n\nRespond ONLY with:\nFILE: <path/to/file>\n<code>\nRepeat for each file.`;

    const result = spawnSync('ollama', ['run', 'phi'], {
      input: prompt,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10
    });

    const output = result.stdout || '';

    saveRaw(output);

    if (!output.trim()) {
      log(`❌ No response from Ollama for task: ${task}`);
      logError(task, JSON.stringify(result));
      continue;
    }

    const parsed = parseResponse(output);

    if (!parsed) {
      log(`⚠️ Could not parse result for task: ${task}`);
      logError(task, output);
    } else {
      log(`✅ Completed: ${task}`);
    }
  }
}
