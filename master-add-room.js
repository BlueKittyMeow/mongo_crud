window.onload = async function() {
    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.getElementById('right-panel');
  
    // Fetch the add-room.html content
    const addRoomResponse = await fetch('/add-room.html');
    const addRoomHTML = await addRoomResponse.text();
  
    // Set the innerHTML of the left panel to be the add-room.html content
    leftPanel.innerHTML = addRoomHTML;
  
    // Now add-room.html is loaded into the left panel, you can use its JavaScript file
    const script = document.createElement('script');
    script.src = "/add-room.js";
    document.body.appendChild(script);

    // Call the init function in add-room.js to initialize the page
    initAddRoomPage();    

    // You might want to add a placeholder to the right panel
    rightPanel.innerHTML = "<p>Room details will appear here.</p>";
  }
  