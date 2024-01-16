const socket = io();

// Elements
const $joinForm = document.querySelector('#join-form');
const $usernameInput = $joinForm.querySelector('input[name="username"]');
const $roomSelect = document.querySelector('#room-select');
const $roomInput = document.querySelector('#room-input');
const $createRoomButton = document.querySelector('#create-room-button');

// Templates
const roomOptionTemplate = document.querySelector('#room-options-template').innerHTML;

let isCreateRoom = false;

function updateRoomDisplay(isCreateRoom, force= false) {
  const roomInputValue = $roomInput.value.trim();
  if (isCreateRoom || roomInputValue !== '') {
    $roomSelect.removeAttribute('required');
    $roomSelect.style.display = 'none';
    $createRoomButton.style.display = 'none';
    $roomInput.style.display = 'initial';
    $roomInput.setAttribute('required', 'required');
  } else {
    $roomInput.removeAttribute('required');
    $roomInput.style.display = 'none';
    $roomSelect.setAttribute('required', 'required');
    $roomSelect.style.display = 'initial';
  }
}

socket.on('roomsList', (list) => {
  const rooms = list.rooms;
  $roomSelect.innerHTML = Mustache.render(roomOptionTemplate, { rooms });

  isCreateRoom = rooms.length === 0;
  updateRoomDisplay(isCreateRoom);
});

$createRoomButton.addEventListener('click', () => {
  isCreateRoom = true;
  updateRoomDisplay(isCreateRoom);
});

$joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const payload = {
    room: isCreateRoom ? $roomInput.value : $roomSelect.value,
    username: $usernameInput.value,
    isNewRoom: isCreateRoom,
  };
  if (!payload.isNewRoom) delete payload.isNewRoom
  const qs = Qs.stringify(payload);
  location.href = `/chat.html?${qs}`;
});
