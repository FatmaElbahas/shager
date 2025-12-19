<!-- resources/views/components/family-member.blade.php -->
<div class="family-member level-{{ $level ?? 0 }}" data-id="{{ $member['id'] }}">
    <div class="member-info">
        <h3>{{ $member['name'] }}</h3>
        <p class="age">{{ $member['age'] }}</p>
    </div>
    
    @if (!empty($member['children']))
        <div class="children">
            @foreach ($member['children'] as $child)
                <x-family-member :member="$child" :level="($level ?? 0) + 1" />
            @endforeach
        </div>
    @endif
</div>