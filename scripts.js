let entries = [];

window.onload = function() {
    populateTimeDropdowns();

    const saved = localStorage.getItem('ojtEntries');
    if (saved) {
        entries = JSON.parse(saved);
        renderEntries();
    }
    updateProgress();
};

function populateTimeDropdowns() {
    const hours = Array.from({length: 12}, (_, i) => (i+1).toString().padStart(2,'0'));
    const minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2,'0'));

    ['timeInHour','timeOutHour'].forEach(id => {
        const select = document.getElementById(id);
        hours.forEach(h => select.add(new Option(h, h)));
    });

    ['timeInMin','timeOutMin'].forEach(id => {
        const select = document.getElementById(id);
        minutes.forEach(m => select.add(new Option(m, m)));
    });
}

function convertToMinutes(hour, min, ampm) {
    hour = parseInt(hour);
    min = parseInt(min);
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return hour * 60 + min;
}

function calculateHours(timeIn, timeOut) {
    let diff = timeOut - timeIn;
    
    if (diff < 0) {
        diff += 1440; // Add 24 hours in minutes
    }
    
    diff = diff / 60; // Convert to hours
    diff = diff > 1 ? diff - 1 : 0; // deduct 1 hour lunch
    return diff.toFixed(2);
}

function addEntry() {
    const date = document.getElementById('date').value;
    const hourIn = document.getElementById('timeInHour').value;
    const minIn = document.getElementById('timeInMin').value;
    const ampmIn = document.getElementById('timeInAMPM').value;

    const hourOut = document.getElementById('timeOutHour').value;
    const minOut = document.getElementById('timeOutMin').value;
    const ampmOut = document.getElementById('timeOutAMPM').value;

    const activity = document.getElementById('activity').value;

    if (!date || !hourIn || !minIn || !hourOut || !minOut || !activity) {
        alert('Please fill in all fields.');
        return;
    }

    const timeInMinutes = convertToMinutes(hourIn, minIn, ampmIn);
    const timeOutMinutes = convertToMinutes(hourOut, minOut, ampmOut);

    // Allow overnight shifts
    const hours = parseFloat(calculateHours(timeInMinutes, timeOutMinutes));

    if (hours <= 0) {
        alert('Invalid time range. Please check your time entries.');
        return;
    }

    const entry = {
        id: Date.now(),
        date: date,
        timeIn: `${hourIn}:${minIn} ${ampmIn}`,
        timeOut: `${hourOut}:${minOut} ${ampmOut}`,
        activity: activity,
        hours: hours
    };

    entries.unshift(entry);
    saveEntries();
    renderEntries();
    clearForm();
}

function renderEntries() {
    const tbody = document.getElementById('entriesTable');

    if (entries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><p>No entries yet. Start tracking your OJT hours!</p></div></td></tr>`;
    } else {
        tbody.innerHTML = entries.map(entry => `<tr>
            <td>${entry.date}</td>
            <td>${entry.timeIn}</td>
            <td>${entry.timeOut}</td>
            <td><span class="hours-badge">${entry.hours}h</span></td>
            <td>${entry.activity}</td>
        </tr>`).join('');
    }

    updateProgress();
}

function updateProgress() {
    const total = entries.reduce((sum, e) => sum + e.hours, 0);
    const required = 486;
    const progress = (total / required) * 100;

    document.getElementById('totalHours').textContent = total.toFixed(2);
    document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
    document.getElementById('progressText').textContent = progress.toFixed(1) + '% Complete';
}

function saveEntries() {
    localStorage.setItem('ojtEntries', JSON.stringify(entries));
}

function clearForm() {
    document.getElementById('date').value = '';
    document.getElementById('timeInHour').selectedIndex = 0;
    document.getElementById('timeInMin').selectedIndex = 0;
    document.getElementById('timeInAMPM').selectedIndex = 0;
    document.getElementById('timeOutHour').selectedIndex = 0;
    document.getElementById('timeOutMin').selectedIndex = 0;
    document.getElementById('timeOutAMPM').selectedIndex = 0;
    document.getElementById('activity').value = '';
}
