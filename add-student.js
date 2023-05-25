async function onSubmit(event) {
    event.preventDefault();

    const first_name = document.getElementById('first_name').value;
    const legal_first_name = document.getElementById('legal_first_name').value;
    const last_name = document.getElementById('last_name').value;
    const department = document.getElementById('department').value;
    const pratt_id = document.getElementById('pratt_id').value;
    const student_category = document.getElementById('student_category').value;
    const email = document.getElementById('email').value;
    const sw_status = document.getElementById('sw_status').checked;
    const rc_status = document.getElementById('rc_status').value;
    const admin_notes = document.getElementById('admin_notes').value;
    const courses = document.getElementById('courses').value;
    const approvals = document.getElementById('approvals').value;

    const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            first_name,
            legal_first_name,
            last_name,
            department,
            pratt_id,
            student_category,
            email,
            sw_status,
            rc_status,
            admin_notes,
            courses,
            approvals
        }),
    });

    if (response.ok) {
        alert('Student added successfully');
        // Clear form fields after successful submission
        document.getElementById('first_name').value = '';
        document.getElementById('legal_first_name').value = '';
        document.getElementById('last_name').value = '';
        document.getElementById('department').value = 'DDA';
        document.getElementById('pratt_id').value = '';
        document.getElementById('student_category').value = '';
        document.getElementById('email').value = '';
        document.getElementById('sw_status').checked = false;
        document.getElementById('rc_status').value = '';
        document.getElementById('admin_notes').value = '';
        document.getElementById('courses').value = '';
        document.getElementById('approvals').value = '';
    } else {
        alert('Failed to add student');
    }
}
