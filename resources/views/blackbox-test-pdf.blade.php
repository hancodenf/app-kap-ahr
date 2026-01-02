<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Pengujian Blackbox - {{ $session->token }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #16a34a;
        }
        
        .header h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #6c757d;
            font-size: 14px;
        }
        
        .session-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-item {
            display: flex;
        }
        
        .info-item strong {
            min-width: 150px;
            color: #495057;
        }
        
        .info-item span {
            color: #212529;
        }
        
        .summary {
            margin-bottom: 30px;
        }
        
        .summary h2 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .summary-card {
            background: #16a34a;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .summary-card h3 {
            font-size: 2.5em;
            margin-bottom: 5px;
        }
        
        .summary-card p {
            font-size: 0.9em;
        }
        
        .module-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .module-header {
            background: #16a34a;
            color: white;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            font-size: 1.2em;
            font-weight: 600;
        }
        
        .role-badge {
            float: right;
            background: rgba(255,255,255,0.2);
            padding: 3px 12px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        
        .test-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .test-table th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #495057;
            border: 1px solid #dee2e6;
        }
        
        .test-table td {
            padding: 12px;
            border: 1px solid #dee2e6;
            vertical-align: top;
        }
        
        .test-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .conclusion-badge {
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.85em;
            display: inline-block;
        }
        
        .conclusion-valid {
            background: #d4edda;
            color: #155724;
        }
        
        .conclusion-invalid {
            background: #f8d7da;
            color: #721c24;
        }
        
        .conclusion-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #dee2e6;
            text-align: center;
            color: #6c757d;
            font-size: 0.9em;
        }
        
        @media print {
            body {
                padding: 10px;
            }
            
            .module-section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 LAPORAN PENGUJIAN BLACKBOX</h1>
        <p>Sistem Manajemen Audit KAP AHR</p>
    </div>

    <div class="session-info">
        <div class="info-grid">
            <div class="info-item">
                <strong>Token Sesi:</strong>
                <span>{{ $session->token }}</span>
            </div>
            <div class="info-item">
                <strong>Nama Tester:</strong>
                <span>{{ $session->tester_name ?? '-' }}</span>
            </div>
            <div class="info-item">
                <strong>Tanggal Pengujian:</strong>
                <span>{{ $session->test_date ? $session->test_date->format('d/m/Y') : '-' }}</span>
            </div>
            <div class="info-item">
                <strong>Versi Aplikasi:</strong>
                <span>{{ $session->app_version ?? '-' }}</span>
            </div>
            <div class="info-item">
                <strong>Browser/Platform:</strong>
                <span>{{ $session->browser_platform ?? '-' }}</span>
            </div>
            <div class="info-item">
                <strong>Dibuat:</strong>
                <span>{{ $session->created_at->format('d/m/Y H:i') }}</span>
            </div>
        </div>
    </div>

    <div class="summary">
        <h2>📊 Ringkasan Pengujian</h2>
        
        @php
            $totalTests = collect($modules)->sum(fn($m) => count($m['tests']));
            $validCount = $results->flatten()->where('conclusion', 'valid')->count();
            $invalidCount = $results->flatten()->where('conclusion', 'invalid')->count();
            $pendingCount = $totalTests - $validCount - $invalidCount;
            $tested = $validCount + $invalidCount;
            $progressPercent = $totalTests > 0 ? round(($tested / $totalTests) * 100) : 0;
            $successPercent = $tested > 0 ? round(($validCount / $tested) * 100) : 0;
        @endphp
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>{{ $totalTests }}</h3>
                <p>Total Test Cases</p>
            </div>
            <div class="summary-card" style="background: #28a745;">
                <h3>{{ $validCount }}</h3>
                <p>✅ Valid</p>
            </div>
            <div class="summary-card" style="background: #dc3545;">
                <h3>{{ $invalidCount }}</h3>
                <p>❌ Invalid</p>
            </div>
            <div class="summary-card" style="background: #ffc107;">
                <h3>{{ $pendingCount }}</h3>
                <p>⏳ Pending</p>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <div style="margin-bottom: 10px;">
                <strong>Progress Pengujian:</strong> {{ $progressPercent }}% 
                <span style="color: #6c757d;">({{ $tested }} dari {{ $totalTests }} test)</span>
            </div>
            <div>
                <strong>Success Rate:</strong> {{ $successPercent }}%
                <span style="color: #6c757d;">({{ $validCount }} valid dari {{ $tested }} tested)</span>
            </div>
        </div>
    </div>

    @php
        $testCounter = 1;
    @endphp

    @foreach($modules as $module)
    <div class="module-section">
        <div class="module-header">
            {{ $module['name'] }}
            <span class="role-badge">{{ $module['role'] }}</span>
        </div>
        
        <table class="test-table">
            <thead>
                <tr>
                    <th style="width: 4%">No</th>
                    <th style="width: 18%">Fitur yang Diuji</th>
                    <th style="width: 18%">Skenario Pengujian</th>
                    <th style="width: 20%">Hasil yang Diharapkan</th>
                    <th style="width: 20%">Hasil Aktual</th>
                    <th style="width: 10%">Kesimpulan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($module['tests'] as $test)
                @php
                    $existingResult = $results->get($module['name'])?->where('test_number', $testCounter)->first();
                    $conclusion = $existingResult->conclusion ?? 'pending';
                @endphp
                <tr>
                    <td>{{ $testCounter }}</td>
                    <td>{{ $test['feature'] }}</td>
                    <td>{{ $test['scenario'] }}</td>
                    <td>{{ $existingResult->expected_result ?? '-' }}</td>
                    <td>{{ $existingResult->actual_result ?? '-' }}</td>
                    <td>
                        <span class="conclusion-badge conclusion-{{ $conclusion }}">
                            @if($conclusion === 'valid')
                                ✅ Valid
                            @elseif($conclusion === 'invalid')
                                ❌ Invalid
                            @else
                                ⏳ Pending
                            @endif
                        </span>
                    </td>
                </tr>
                @php $testCounter++; @endphp
                @endforeach
            </tbody>
        </table>
    </div>
    @endforeach

    <div class="footer">
        <p>Dokumen ini digenerate secara otomatis dari sistem pengujian blackbox KAP AHR</p>
        <p>{{ now()->format('d F Y, H:i') }}</p>
    </div>

    <script>
        // Auto print when page loads
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
