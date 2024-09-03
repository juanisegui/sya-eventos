$(document).ready(function() {
    let events = JSON.parse(localStorage.getItem('events')) || [];

    function saveEvents() {
        localStorage.setItem('events', JSON.stringify(events));
    }

    function renderEvents(filter = 'all') {
        const eventsList = $('#events');
        eventsList.empty();

        let filteredEvents = filter === 'completed' ? events.filter(event => event.completed) : events;

        filteredEvents = filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        filteredEvents.forEach((event, index) => {
            eventsList.append(`
                <li class="list-group-item ${event.completed ? 'completed' : ''}">
                    <div class="event-content">
                        <strong>${event.name}</strong><br>
                        ${event.description ? `<em>${event.description}</em><br>` : ''}
                        ${event.participants ? `<strong>Participantes:</strong> ${event.participants.join(', ')}<br>` : ''}
                        <small>${event.date}</small>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-success btn-sm toggle-completed" data-index="${index}">
                            ${event.completed ? 'Deshacer' : 'Completar Evento'}
                        </button>
                        <button class="btn btn-warning btn-sm edit-event" data-index="${index}">Editar</button>
                        <button class="btn btn-danger btn-sm delete-event" data-index="${index}">Eliminar</button>
                    </div>
                </li>
            `);
        });
    }

    function exportEvents() {
        const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eventos.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function importEvents(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedEvents = JSON.parse(e.target.result);
                events = importedEvents;
                saveEvents();
                renderEvents();
            } catch (err) {
                alert('Error al importar eventos. Asegúrate de que el archivo sea un JSON válido.');
            }
        };
        reader.readAsText(file);
    }

    $('#event-form').on('submit', function(e) {
        e.preventDefault();
        const date = $('#event-date').val();
        const name = $('#event-name').val();
        const description = $('#event-description').val();
        const participants = $('#event-participants').val().split(',').map(p => p.trim()).filter(p => p);

        if (date && name) {
            const editIndex = $('#event-form').data('edit-index');
            if (editIndex !== undefined) {
                events[editIndex] = { date, name, description, participants, completed: events[editIndex].completed };
                $('#event-form').removeData('edit-index');
            } else {
                events.push({ date, name, description, participants, completed: false });
            }

            saveEvents();
            $('#event-date').val('');
            $('#event-name').val('');
            $('#event-description').val('');
            $('#event-participants').val('');
            renderEvents();
        } else {
            alert('Por favor, completa todos los campos requeridos.');
        }
    });

    $('#events').on('click', '.toggle-completed', function() {
        const index = $(this).data('index');
        events[index].completed = !events[index].completed;
        saveEvents();
        renderEvents();
    });

    $('#events').on('click', '.edit-event', function() {
        const index = $(this).data('index');
        const event = events[index];

        $('#event-date').val(event.date);
        $('#event-name').val(event.name);
        $('#event-description').val(event.description);
        $('#event-participants').val(event.participants.join(', '));
        $('#event-form').data('edit-index', index);
    });

    $('#events').on('click', '.delete-event', function() {
        const index = $(this).data('index');
        events.splice(index, 1);
        saveEvents();
        renderEvents();
    });

    $('#export-events').on('click', exportEvents);

    $('#import-file').on('change', importEvents);
    
    $('#import-events').on('click', function() {
        $('#import-file').click();
    });

    $('#show-all').on('click', function() {
        renderEvents('all');
    });

    $('#show-completed').on('click', function() {
        renderEvents('completed');
    });

    renderEvents();
});
