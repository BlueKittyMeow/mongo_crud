async function populateRoomTypes() {
    const response = await fetch('/api/room_types');
    const roomTypes = await response.json();
  
    const typeSelect = document.getElementById('type');
    roomTypes.forEach(roomType => {
      const option = document.createElement('option');
      option.value = roomType.type_name;
      option.textContent = roomType.type_name;
      typeSelect.appendChild(option);
    });
  }
  
  populateRoomTypes();
  



  async function onSubmit(event) {
    event.preventDefault();

    const admin_notes = document.getElementById('admin_notes').value;
    const floor = document.getElementById('floor').value;
    const room_notes = document.getElementById('room_notes').value;
    const room_number = document.getElementById('room_number').value;
    const room_status = document.getElementById('room_status').value;
    const type = document.getElementById('type').value;

    const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            admin_notes,
            floor,
            room_notes,
            room_number,
            room_status,
            type
        }),
    });

    if (response.ok) {
        alert('Room added successfully');
        // Clear form fields after successful submission
        document.getElementById('admin_notes').value = '';
        document.getElementById('floor').value = '';
        document.getElementById('room_notes').value = '';
        document.getElementById('room_number').value = '';
        document.getElementById('room_status').value = '';
        document.getElementById('type').value = '';
    } else {
        alert('Failed to add room');
    }
}


  
async function searchStudents() {
    const searchType = document.getElementById('student_search_type').value;
    const searchTerm = document.getElementById('student_search_term').value;
    
    const response = await fetch(`/api/students/search?type=${searchType}&term=${searchTerm}`);
    const students = await response.json();

    const resultsContainer = document.getElementById('search_results');  // Assuming you have a container for the results with id 'search_results'.
    resultsContainer.innerHTML = '';  // Clear previous results.

    students.forEach(student => {
        const studentElement = document.createElement('div');
        studentElement.textContent = `${student.first_name} ${student.last_name} (${student.pratt_id})`;

        const assignButton = document.createElement('button');
        assignButton.textContent = 'Assign to Room';
        assignButton.addEventListener('click', () => assignStudent(student.pratt_id));

        studentElement.appendChild(assignButton);
        resultsContainer.appendChild(studentElement);
    });
}

  
async function assignStudent(studentId) {
    const roomId = document.getElementById('room_id').value;

    const response = await fetch(`/api/rooms/${roomId}/assignees/${studentId}`, {
        method: 'PUT'
    });

    if (response.ok) {
        alert('Student assigned successfully');

        const studentResponse = await fetch(`/api/students/${studentId}`);
        const student = await studentResponse.json();

        const assignedStudentsContainer = document.getElementById('assigned_students');

        const studentElement = document.createElement('div');
        studentElement.textContent = `${student.first_name} ${student.last_name} (${student.pratt_id})`;

        assignedStudentsContainer.appendChild(studentElement);
    } else {
        alert('Failed to assign student');
    }
}
