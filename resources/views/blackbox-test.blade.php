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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #16a34a 0%, #10b981 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.95;
        }
        
        .session-info {
            background: #f8f9fa;
            padding: 30px;
            border-bottom: 2px solid #e9ecef;
        }
        
        .session-info .token-display {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 2px solid #16a34a;
        }
        
        .session-info .token-display strong {
            color: #16a34a;
            display: block;
            margin-bottom: 5px;
        }
        
        .session-info .token-display code {
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            display: inline-block;
            color: #495057;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .info-item label {
            display: block;
            font-weight: 600;
            margin-bottom: 5px;
            color: #495057;
        }
        
        .info-item input {
            width: 100%;
            padding: 10px;
            border: 2px solid #dee2e6;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .info-item input:focus {
            outline: none;
            border-color: #16a34a;
        }
        
        .summary-section {
            padding: 30px;
            background: #fff;
        }
        
        .summary-title {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: linear-gradient(135deg, #16a34a 0%, #10b981 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);
        }
        
        .summary-card h3 {
            font-size: 2.5em;
            margin-bottom: 5px;
        }
        
        .summary-card p {
            opacity: 0.9;
            font-size: 0.95em;
        }
        
        .progress-bars {
            margin-top: 30px;
        }
        
        .progress-item {
            margin-bottom: 20px;
        }
        
        .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-weight: 600;
            color: #495057;
        }
        
        .progress-bar-bg {
            background: #e9ecef;
            height: 30px;
            border-radius: 15px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #16a34a 0%, #10b981 100%);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.85em;
        }
        
        .content {
            padding: 30px;
        }
        
        .module-section {
            margin-bottom: 40px;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            overflow: hidden;
        }
        
        .module-header {
            background: linear-gradient(135deg, #16a34a 0%, #10b981 100%);
            color: white;
            padding: 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .module-header:hover {
            background: linear-gradient(135deg, #15803d 0%, #059669 100%);
        }
        
        .module-title {
            font-size: 1.3em;
            font-weight: 600;
        }
        
        .role-badge {
            background: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85em;
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
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
        }
        
        .test-table td {
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .test-table tr:hover {
            background: #f8f9fa;
        }
        
        .test-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            font-size: 13px;
        }
        
        .test-input:focus {
            outline: none;
            border-color: #16a34a;
        }
        
        .test-textarea {
            min-height: 60px;
            resize: vertical;
        }
        
        .conclusion-select {
            width: 100%;
            padding: 8px;
            border: 2px solid #dee2e6;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }
        
        .conclusion-select:focus {
            outline: none;
            border-color: #16a34a;
        }
        
        .conclusion-select.valid {
            background: #d4edda;
            color: #155724;
            border-color: #28a745;
        }
        
        .conclusion-select.invalid {
            background: #f8d7da;
            color: #721c24;
            border-color: #dc3545;
        }
        
        .conclusion-select.pending {
            background: #fff3cd;
            color: #856404;
            border-color: #ffc107;
        }
        
        .save-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            display: none;
            align-items: center;
            gap: 10px;
            z-index: 1000;
        }
        
        .save-indicator.show {
            display: flex;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(400px);
            }
            to {
                transform: translateX(0);
            }
        }
        
        .export-btn {
            background: linear-gradient(135deg, #16a34a 0%, #10b981 100%);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
            display: inline-block;
            text-decoration: none;
        }
        
        .export-btn:hover {
            background: linear-gradient(135deg, #15803d 0%, #059669 100%);
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
            <h1>📋 SKEMA PENGUJIAN BLACKBOX</h1>
            <p>Sistem Manajemen Audit KAP AHR - Testing Framework</p>
        </div>

        <div class="session-info">
            <div class="token-display">
                <strong>🔑 Token Sesi Pengujian:</strong>
                <code id="sessionToken">{{ $session->token }}</code>
                <small style="display: block; margin-top: 5px; color: #6c757d;">
                    Simpan token ini untuk melanjutkan pengujian di kemudian hari. 
                    Akses dengan: <strong>{{ url('/blackbox-test?token=' . $session->token) }}</strong>
                </small>
            </div>

            <div class="info-grid">
                <div class="info-item">
                    <label>👤 Nama Tester:</label>
                    <input type="text" id="testerName" placeholder="Masukkan nama tester" 
                           value="{{ $session->tester_name }}" class="session-field">
                </div>
                <div class="info-item">
                    <label>📅 Tanggal Pengujian:</label>
                    <input type="date" id="testDate" 
                           value="{{ $session->test_date ? $session->test_date->format('Y-m-d') : date('Y-m-d') }}" 
                           class="session-field">
                </div>
                <div class="info-item">
                    <label>📦 Versi Aplikasi:</label>
                    <input type="text" id="appVersion" placeholder="e.g., v1.0.0" 
                           value="{{ $session->app_version }}" class="session-field">
                </div>
                <div class="info-item">
                    <label>💻 Browser/Platform:</label>
                    <input type="text" id="browserPlatform" placeholder="e.g., Chrome 120 / Windows 11" 
                           value="{{ $session->browser_platform }}" class="session-field">
                </div>
            </div>
        </div>

        <div class="summary-section" id="summarySection">
            <h2 class="summary-title">📊 RINGKASAN PENGUJIAN</h2>
            
            <div class="summary-grid">
                <div class="summary-card">
                    <h3 id="totalTests">{{ collect($modules)->sum(fn($m) => count($m['tests'])) }}</h3>
                    <p>Total Test Cases</p>
                </div>
                <div class="summary-card">
                    <h3 id="validTests">{{ $results->flatten()->where('conclusion', 'valid')->count() }}</h3>
                    <p>✅ Valid</p>
                </div>
                <div class="summary-card">
                    <h3 id="invalidTests">{{ $results->flatten()->where('conclusion', 'invalid')->count() }}</h3>
                    <p>❌ Invalid</p>
                </div>
                <div class="summary-card">
                    <h3 id="pendingTests">{{ collect($modules)->sum(fn($m) => count($m['tests'])) - $results->flatten()->whereIn('conclusion', ['valid', 'invalid'])->count() }}</h3>
                    <p>⏳ Pending</p>
                </div>
            </div>

            <div class="progress-bars">
                <div class="progress-item">
                    <div class="progress-label">
                        <span>Progress Pengujian</span>
                        <span id="progressPercent">0%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar" id="progressBar" style="width: 0%">0%</div>
                    </div>
                </div>
                
                <div class="progress-item">
                    <div class="progress-label">
                        <span>Success Rate</span>
                        <span id="successPercent">0%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar" id="successBar" style="width: 0%; background: linear-gradient(90deg, #28a745 0%, #20c997 100%)">0%</div>
                    </div>
                </div>
            </div>

            <a href="{{ route('blackbox.export.pdf', $session->token) }}" class="export-btn" target="_blank">
                📄 Export ke PDF
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
                                        <option value="pending" {{ (!$existingResult || $existingResult->conclusion === 'pending') ? 'selected' : '' }}>⏳ Pending</option>
                                        <option value="valid" {{ ($existingResult && $existingResult->conclusion === 'valid') ? 'selected' : '' }}>✅ Valid</option>
                                        <option value="invalid" {{ ($existingResult && $existingResult->conclusion === 'invalid') ? 'selected' : '' }}>❌ Invalid</option>
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
            document.getElementById('progressBar').textContent = progressPercent + '%';
            
            document.getElementById('successPercent').textContent = successPercent + '%';
            document.getElementById('successBar').style.width = successPercent + '%';
            document.getElementById('successBar').textContent = successPercent + '%';

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
