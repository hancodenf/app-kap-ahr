<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Skema Pengujian Blackbox - KAP AHR</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            padding: 0;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
        }
        
        .header {
            background: white;
            border-bottom: 1px solid #e0e0e0;
            padding: 24px 32px;
        }   
        
        .header h1 {
            font-size: 28px;
            font-weight: 400;
            color: #202124;
            margin-bottom: 4px;
        }
        
        .header p {
            font-size: 14px;
            color: #5f6368;
        }
        
        .session-info {
            background: white;
            padding: 24px 32px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .session-info .token-display {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            border-left: 4px solid #16a34a;
        }
        
        .session-info .token-display strong {
            color: #202124;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
        }
        
        .session-info .token-display code {
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 13px;
            display: inline-block;
            color: #16a34a;
            border: 1px solid #e0e0e0;
            font-family: 'Roboto Mono', monospace;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }
        
        .info-item label {
            display: block;
            font-weight: 500;
            margin-bottom: 8px;
            color: #202124;
            font-size: 14px;
        }
        
        .info-item input {
            width: 100%;
            padding: 12px;
            border: 1px solid #dadce0;
            border-radius: 4px;
            font-size: 14px;
            transition: all 0.2s;
        }
        
        .info-item input:hover {
            border-color: #bdc1c6;
        }
        
        .info-item input:focus {
            outline: none;
            border-color: #16a34a;
            box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
        }
        
        .summary-section {
            padding: 32px;
            background: white;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .summary-title {
            font-size: 20px;
            font-weight: 400;
            margin-bottom: 24px;
            color: #202124;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        
        .summary-card {
            background: white;
            border: 1px solid #e0e0e0;
            padding: 20px;
            border-radius: 8px;
            transition: box-shadow 0.2s;
        }
        
        .summary-card:hover {
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }
        
        .summary-card h3 {
            font-size: 36px;
            font-weight: 400;
            margin-bottom: 4px;
            color: #16a34a;
        }
        
        .summary-card p {
            font-size: 14px;
            color: #5f6368;
        }
        
        .progress-bars {
            margin-top: 24px;
        }
        
        .progress-item {
            margin-bottom: 20px;
        }
        
        .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
            color: #5f6368;
        }
        
        .progress-bar-bg {
            background: #e0e0e0;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            background: #16a34a;
            transition: width 0.3s ease;
            border-radius: 4px;
        }
        
        .content {
            padding: 32px;
            background: #f8f9fa;
        }
        
        .module-section {
            margin-bottom: 24px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .module-header {
            background: #f8f9fa;
            padding: 16px 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e0e0e0;
            transition: background-color 0.2s;
        }
        
        .module-header:hover {
            background: #f1f3f4;
        }
        
        .module-title {
            font-size: 16px;
            font-weight: 500;
            color: #202124;
        }
        
        .role-badge {
            background: #e8f5e9;
            color: #16a34a;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .module-content {
            display: none;
        }
        
        .module-content.active {
            display: block;
        }
        
        .test-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .test-table thead {
            background: #f8f9fa;
        }
        
        .test-table th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 500;
            color: #5f6368;
            font-size: 13px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .test-table td {
            padding: 12px 16px;
            border-bottom: 1px solid #f1f3f4;
            font-size: 14px;
            color: #202124;
        }
        
        .test-table tr:hover {
            background: #fafafa;
        }
        
        .test-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #dadce0;
            border-radius: 4px;
            font-size: 13px;
            font-family: inherit;
        }
        
        .test-input:hover {
            border-color: #bdc1c6;
        }
        
        .test-input:focus {
            outline: none;
            border-color: #16a34a;
            box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
        }
        
        .test-textarea {
            min-height: 60px;
            resize: vertical;
        }
        
        .conclusion-select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #dadce0;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            background: white;
        }
        
        .conclusion-select:hover {
            border-color: #bdc1c6;
        }
        
        .conclusion-select:focus {
            outline: none;
            border-color: #16a34a;
            box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
        }
        
        .conclusion-select.valid {
            background: #e8f5e9;
            color: #137333;
            border-color: #16a34a;
        }
        
        .conclusion-select.invalid {
            background: #fce8e6;
            color: #c5221f;
            border-color: #ea4335;
        }
        
        .conclusion-select.pending {
            background: #fef7e0;
            color: #f9ab00;
            border-color: #f9ab00;
        }
        
        .save-indicator {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #202124;
            color: white;
            padding: 12px 20px;
            border-radius: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            display: none;
            align-items: center;
            gap: 8px;
            z-index: 1000;
            font-size: 14px;
        }
        
        .save-indicator.show {
            display: flex;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .export-btn {
            background: #16a34a;
            color: white;
            padding: 10px 24px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: inline-block;
            text-decoration: none;
            transition: background-color 0.2s, box-shadow 0.2s;
        }
        
        .export-btn:hover {
            background: #15803d;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .save-indicator, .export-btn {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Skema Pengujian Blackbox</h1>
            <p>Sistem Manajemen Audit KAP AHR</p>
        </div>

        <div class="session-info">
            <div class="token-display">
                <strong>Token Sesi Pengujian</strong>
                <code id="sessionToken">{{ $session->token }}</code>
                <small style="display: block; margin-top: 8px; color: #5f6368; font-size: 13px;">
                    Simpan token ini untuk melanjutkan pengujian di kemudian hari. 
                    URL: {{ url('/blackbox-test?token=' . $session->token) }}
                </small>
            </div>

            <div class="info-grid">
                <div class="info-item">
                    <label>Nama Tester</label>
                    <input type="text" id="testerName" placeholder="Masukkan nama tester" 
                           value="{{ $session->tester_name }}" class="session-field">
                </div>
                <div class="info-item">
                    <label>Tanggal Pengujian</label>
                    <input type="date" id="testDate" 
                           value="{{ $session->test_date ? $session->test_date->format('Y-m-d') : date('Y-m-d') }}" 
                           class="session-field">
                </div>
                <div class="info-item">
                    <label>Versi Aplikasi</label>
                    <input type="text" id="appVersion" placeholder="e.g., v1.0.0" 
                           value="{{ $session->app_version }}" class="session-field">
                </div>
                <div class="info-item">
                    <label>Browser/Platform</label>
                    <input type="text" id="browserPlatform" placeholder="e.g., Chrome 120 / Windows 11" 
                           value="{{ $session->browser_platform }}" class="session-field">
                </div>
            </div>
        </div>

        <div class="summary-section" id="summarySection">
            <h2 class="summary-title">Ringkasan Pengujian</h2>
            
            <div class="summary-grid">
                <div class="summary-card">
                    <h3 id="totalTests">{{ collect($modules)->sum(fn($m) => count($m['tests'])) }}</h3>
                    <p>Total Test Cases</p>
                </div>
                <div class="summary-card">
                    <h3 id="validTests">{{ $results->flatten()->where('conclusion', 'valid')->count() }}</h3>
                    <p>Valid</p>
                </div>
                <div class="summary-card">
                    <h3 id="invalidTests">{{ $results->flatten()->where('conclusion', 'invalid')->count() }}</h3>
                    <p>Invalid</p>
                </div>
                <div class="summary-card">
                    <h3 id="pendingTests">{{ collect($modules)->sum(fn($m) => count($m['tests'])) - $results->flatten()->whereIn('conclusion', ['valid', 'invalid'])->count() }}</h3>
                    <p>Pending</p>
                </div>
            </div>

            <div class="progress-bars">
                <div class="progress-item">
                    <div class="progress-label">
                        <span>Progress Pengujian</span>
                        <span id="progressPercent">0%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar" id="progressBar" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="progress-item">
                    <div class="progress-label">
                        <span>Success Rate</span>
                        <span id="successPercent">0%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar" id="successBar" style="width: 0%; background: #16a34a"></div>
                    </div>
                </div>
            </div>

            <a href="{{ route('blackbox.export.pdf', $session->token) }}" class="export-btn" target="_blank">
                Export ke PDF
            </a>
        </div>

        <div class="content">
            @php
                $testCounter = 1;
            @endphp

            @foreach($modules as $moduleIndex => $module)
            <div class="module-section">
                <div class="module-header" onclick="toggleModule({{ $moduleIndex }})">
                    <div class="module-title">
                        {{ $module['name'] }}
                        <span style="font-size: 0.8em; opacity: 0.8;">({{ count($module['tests']) }} tests)</span>
                    </div>
                    <span class="role-badge">{{ $module['role'] }}</span>
                </div>
                
                <div class="module-content" id="module{{ $moduleIndex }}">
                    <table class="test-table">
                        <thead>
                            <tr>
                                <th style="width: 5%">No</th>
                                <th style="width: 20%">Fitur yang Diuji</th>
                                <th style="width: 20%">Skenario Pengujian</th>
                                <th style="width: 18%">Hasil yang Diharapkan</th>
                                <th style="width: 18%">Hasil Aktual</th>
                                <th style="width: 12%">Kesimpulan</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($module['tests'] as $testIndex => $test)
                            @php
                                $existingResult = $results->get($module['name'])?->where('test_number', $testCounter)->first();
                            @endphp
                            <tr>
                                <td>{{ $testCounter }}</td>
                                <td>{{ $test['feature'] }}</td>
                                <td>{{ $test['scenario'] }}</td>
                                <td>
                                    <textarea 
                                        class="test-input test-textarea" 
                                        data-module="{{ $module['name'] }}"
                                        data-test="{{ $testCounter }}"
                                        data-field="expected_result"
                                        placeholder="Jelaskan hasil yang diharapkan..."
                                    >{{ $existingResult->expected_result ?? '' }}</textarea>
                                </td>
                                <td>
                                    <textarea 
                                        class="test-input test-textarea" 
                                        data-module="{{ $module['name'] }}"
                                        data-test="{{ $testCounter }}"
                                        data-field="actual_result"
                                        placeholder="Jelaskan hasil aktual yang terjadi..."
                                    >{{ $existingResult->actual_result ?? '' }}</textarea>
                                </td>
                                <td>
                                    <select 
                                        class="conclusion-select {{ $existingResult->conclusion ?? 'pending' }}" 
                                        data-module="{{ $module['name'] }}"
                                        data-test="{{ $testCounter }}"
                                        data-feature="{{ $test['feature'] }}"
                                        data-scenario="{{ $test['scenario'] }}"
                                        data-field="conclusion"
                                    >
                                        <option value="pending" {{ (!$existingResult || $existingResult->conclusion === 'pending') ? 'selected' : '' }}>Pending</option>
                                        <option value="valid" {{ ($existingResult && $existingResult->conclusion === 'valid') ? 'selected' : '' }}>Valid</option>
                                        <option value="invalid" {{ ($existingResult && $existingResult->conclusion === 'invalid') ? 'selected' : '' }}>Invalid</option>
                                    </select>
                                </td>
                            </tr>
                            @php $testCounter++; @endphp
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
            @endforeach
        </div>
    </div>

    <div class="save-indicator" id="saveIndicator">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z" fill="white"/>
        </svg>
        <span>Tersimpan otomatis</span>
    </div>

    <script>
        const sessionId = '{{ $session->id }}';
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        let saveTimeout;

        // Auto-save session info
        document.querySelectorAll('.session-field').forEach(field => {
            field.addEventListener('input', function() {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    saveSessionInfo();
                }, 1000);
            });
        });

        // Auto-save test results
        document.querySelectorAll('.test-input, .conclusion-select').forEach(field => {
            field.addEventListener('input', function() {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    saveTestResult(this);
                }, 1000);
            });

            field.addEventListener('change', function() {
                saveTestResult(this);
            });
        });

        function saveSessionInfo() {
            const data = {
                session_id: sessionId,
                tester_name: document.getElementById('testerName').value,
                test_date: document.getElementById('testDate').value,
                app_version: document.getElementById('appVersion').value,
                browser_platform: document.getElementById('browserPlatform').value,
            };

            fetch('/blackbox-test/update-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSaveIndicator();
                }
            })
            .catch(error => console.error('Error:', error));
        }

        function saveTestResult(element) {
            const module = element.dataset.module;
            const testNumber = parseInt(element.dataset.test);
            const field = element.dataset.field;
            const value = element.value;

            // Get all data for this test
            const row = element.closest('tr');
            const expectedResult = row.querySelector('[data-field="expected_result"]')?.value || '';
            const actualResult = row.querySelector('[data-field="actual_result"]')?.value || '';
            const conclusionSelect = row.querySelector('[data-field="conclusion"]');
            const conclusion = conclusionSelect?.value || 'pending';
            const feature = conclusionSelect?.dataset.feature || '';
            const scenario = conclusionSelect?.dataset.scenario || '';

            // Update conclusion select class
            if (conclusionSelect) {
                conclusionSelect.className = 'conclusion-select ' + conclusion;
            }

            const data = {
                session_id: sessionId,
                module_name: module,
                test_number: testNumber,
                feature_name: feature,
                test_scenario: scenario,
                expected_result: expectedResult,
                actual_result: actualResult,
                conclusion: conclusion
            };

            fetch('/blackbox-test/save-result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSaveIndicator();
                    updateSummary();
                }
            })
            .catch(error => console.error('Error:', error));
        }

        function showSaveIndicator() {
            const indicator = document.getElementById('saveIndicator');
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }

        function updateSummary() {
            const allSelects = document.querySelectorAll('.conclusion-select');
            let validCount = 0;
            let invalidCount = 0;
            let pendingCount = 0;

            allSelects.forEach(select => {
                if (select.value === 'valid') validCount++;
                else if (select.value === 'invalid') invalidCount++;
                else pendingCount++;
            });

            const total = allSelects.length;
            const tested = validCount + invalidCount;
            const progressPercent = Math.round((tested / total) * 100);
            const successPercent = tested > 0 ? Math.round((validCount / tested) * 100) : 0;

            document.getElementById('validTests').textContent = validCount;
            document.getElementById('invalidTests').textContent = invalidCount;
            document.getElementById('pendingTests').textContent = pendingCount;
            
            document.getElementById('progressPercent').textContent = progressPercent + '%';
            document.getElementById('progressBar').style.width = progressPercent + '%';
            
            document.getElementById('successPercent').textContent = successPercent + '%';
            document.getElementById('successBar').style.width = successPercent + '%';

            // Smooth scroll to summary after update
            if (window.scrollY > 500) {
                document.getElementById('summarySection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function toggleModule(index) {
            const content = document.getElementById('module' + index);
            content.classList.toggle('active');
        }

        // Open first module by default
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('module0').classList.add('active');
            updateSummary();
        });

        // Prevent accidental page close
        window.addEventListener('beforeunload', function (e) {
            const hasUnsaved = document.querySelector('.conclusion-select:not([value="pending"])');
            if (hasUnsaved) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    </script>
</body>
</html>
