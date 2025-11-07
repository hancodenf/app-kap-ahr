@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'Laravel')
<img src="https://laravel.com/img/notification-logo.png" class="logo" alt="Laravel Logo">
@else
<div style="display: flex; align-items: center; gap: 12px;">
    <img src="{{ asset('images/logo.png') }}" alt="{{ config('app.name') }} Logo" style="height: 50px; width: auto;">
    <div style="text-align: left;">
        <div style="font-size: 28px; font-weight: bold; color: #1e40af; margin: 0; line-height: 1.2;">AURA</div>
        <div style="font-size: 12px; color: #6b7280; margin: 0; line-height: 1.2;">Audit, Reporting & Analyze</div>
    </div>
</div>
@endif
</a>
</td>
</tr>
