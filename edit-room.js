let roomNumber = null;

async function fetchRoomData(roomNumber) {
    const response = await fetch('/api/rooms/number/' + roomNumber);
    const room = await response.json();

    document.getElementById('room_number').value = room.room_number;
    document.getElementById('room_status').value = room.room_status;
    document.getElementById('admin_notes').value = room.admin_notes;
    document.getElementById('room_notes').value = room.room_notes;

    return room;
}

async function showEditRoom(roomNumber) {
    const room = await fetchRoomData(roomNumber);

    const roomDetails = document.getElementById('room-details');
    roomDetails.innerHTML = `
        <p><strong>Room Number:</strong> ${room.room_number}</p>
        <p><strong>Room Status:</strong> ${room.room_status}</p>
        <p><strong>Admin Notes:</strong> ${room.admin_notes}</p>
        <p><strong>Room Notes:</strong> ${room.room_notes}</p>
    `;

    showRoomDetails();
}

function showRoomDetails() {
    document.getElementById('page-title').innerText = 'Room Details';
    document.getElementById('room-details').classList.remove('hidden');
    document.getElementById('edit-room-form').classList.add('hidden');
    document.getElementById('edit-button').classList.remove('hidden');
    document.getElementById('cancel-button').classList.add('hidden');
}

function showEditForm() {
    document.getElementById('page-title').innerText = 'Edit Room';
    document.getElementById('room-details').classList.add('hidden');
    document.getElementById('edit-room-form').classList.remove('hidden');
    document.getElementById('edit-button').classList.add('hidden');
    document.getElementById('cancel-button').classList.remove('hidden');
}

document.getElementById('edit-room-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const roomNumber = document.getElementById('room_number').value;
    const roomStatus = document.getElementById('room_status').value;
    const adminNotes = document.getElementById('admin_notes').value;
    const roomNotes = document.getElementById('room_notes').value;
    const response = await fetch('/api/rooms/number/' + roomNumber, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            room_status: roomStatus,
            admin_notes: adminNotes,
            room_notes: roomNotes
        })
    });

    if (response.ok) {
        alert('Room data updated successfully');
    } else {
        alert('Error updating room data');
    }
});

document.getElementById('edit-button').addEventListener('click', showEditForm);
document.getElementById('cancel-button').addEventListener('click', showRoomDetails);

document.getElementById('end-of-semester-button').addEventListener('click', function() {
    window.location.href = `end-of-semester-update.html?room=${roomNumber}`;
});

// Get room number from URL
const urlParams = new URLSearchParams(window.location.search);
roomNumber = urlParams.get('room');

// If a room number is specified, show its details
if (roomNumber) {
    showEditRoom(roomNumber);
}
