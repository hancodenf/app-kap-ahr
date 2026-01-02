@props(['url'])
<tr>
    <td class="header">
        <a href="{{ $url }}" style="display: inline-block;">
            @if (trim($slot) === 'Laravel')
                <img src="https://laravel.com/img/notification-logo.png" class="logo" alt="Laravel Logo">
            @else
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="{{ asset('logo.png') }}" alt="{{ config('app.name') }} Logo" style="height: 60px; width: auto;">
                    <div style="text-align: left;">
                        <div style="font-size: 32px; font-weight: bold; color: #16a34a; margin: 0; line-height: 1.2;">AURA</div>
                        <div style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.2; letter-spacing: 0.5px;">Audit, Reporting & Analyze</div>
                    </div>
                </div>
            @endif
        </a>
    </td>
</tr>
