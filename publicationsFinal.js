$(document).ready(function () {
    // Función para asegurarse de que el ID sea una cadena
    function normalizeItemId(id) {
        return String(id).trim();
    }

    // Utilidades
    function parseJSONInput(input, defaultValue = []) {
        input = input.replace(/'/g, '"'); // Reemplazar comillas simples por dobles
        try {
            return JSON.parse(input);
        } catch (e) {
            console.error("El valor no es un JSON válido", e);
            return defaultValue;
        }
    }

    // asignar valor

    function updateIns2778Field() {
        $("#ins_2778").val(JSON.stringify(checkboxData));
    }

    // Sincronizar publicaciones actuales con el JSON
    function syncCheckboxData(articles) {
        const currentItemIds = articles.map(item => normalizeItemId(item.itemId));

        // Agregar nuevas publicaciones al JSON
        articles.forEach(item => {
            const normalizedId = normalizeItemId(item.itemId);
            if (!checkboxData[normalizedId]) {
                checkboxData[normalizedId] = {
                    firstAuthor: false,
                    collaboration: false
                };
            }
        });

        // Eliminar publicaciones que ya no están en la lista
        Object.keys(checkboxData).forEach(itemId => {
            if (!currentItemIds.includes(itemId)) {
                delete checkboxData[itemId];
            }
        });

        // Actualizar el campo con los cambios
        updateIns2778Field();
    }

    $(".mylist-container").each(function () {
        const container = $(this);
        const contentDiv = container.children("div"); // The enclosed div to toggle
        const toggleLabel = $("<span>Show List</span>").css({
            cursor: "pointer",
            color: "blue",
            textDecoration: "underline",
            display: "block",
            marginBottom: "10px" // Add spacing between label and content
        });

        // Insert the toggle label above the content div
        contentDiv.before(toggleLabel);

        // Initially hide the content div
        contentDiv.hide();

        // Add click event to toggle visibility
        toggleLabel.on("click", function () {
            if (contentDiv.is(":visible")) {
                contentDiv.hide();
                toggleLabel.text("Mostrar elementos");
            } else {
                contentDiv.show();
                toggleLabel.text("Esconder elementos");
            }
        });
    });

    // Ocultar inicialmente los campos
    $("#ins_2723, #ins_2778").hide();

    // Renderizar publicaciones
    let articles = parseJSONInput($("#ins_2723").val(), []);
    let checkboxData = parseJSONInput($("#ins_2778").val(), {});

    syncCheckboxData(articles);

    // Formatear y renderizar artículos
    function formatItem(item) {
        let typeClass = '';

        // Asignar clases según el tipo
        if (item.type === 'isi') {
            typeClass = 'isi';
        } else if (item.type === 'no-isi') {
            typeClass = 'no-isi';
        } else if (item.type === 'libro') {
            typeClass = 'libro';
        }

        let authorsText = item.authors;
        if (authorsText.length > 100) {
            authorsText = authorsText.substring(0, 150) + '...'; // Limitar a los primeros 100 caracteres
        }

        let linkText = '';
        if (item.link && item.link.trim() !== '') {
            linkText = `<a href="${item.link}" target="_blank">(enlace)</a>`;
        }

        let journalText = '';
        if (item.journal && item.journal.trim() !== '') {
            journalText = `<span class="source">${item.journal}</span>`;
        }

        let chapterTitleText = '';
        if (item.chapterTitle && item.chapterTitle.trim() !== '') {
            chapterTitleText = `<span style="font-weight: bold;">Capítulo: </span><span>${item.chapterTitle}</span>`;
        }

        const checkboxes = `
            <div class="checkbox-group" data-itemid="${normalizeItemId(item.itemId)}">
                <label>
                    <input type="checkbox" name="publication-${item.itemId}" value="firstAuthor">
                    Primer Autor
                </label>
                <label>
                    <input type="checkbox" name="publication-${item.itemId}" value="collaboration">
                    Colaboración
                </label>
            </div>
        `;

        return `
            <li>
                <span class="type ${typeClass}">${item.type}</span> 
                <span class="title">${item.title}</span> 
                ${journalText} 
                ${chapterTitleText} 
                (${item.year})
                <span class="authors">Autores: ${authorsText}</span> 
                ${linkText}.
                ${checkboxes}
            </li>
        `;
    }

    function renderList(items, containerId, formatFunction) {
        const $ul = $('<ul></ul>');
        items.forEach(function (item) {
            const $li = $('<li></li>');
            $li.html(formatFunction(item));
            $ul.append($li);
        });
        $(containerId).empty().append($ul);
    }

    if (articles.length > 0) {
        renderList(articles, '#isi-publications-div', formatItem);

        // Actualizar los checkboxes según el JSON cargado
        $(".checkbox-group").each(function () {
            const group = $(this);
            const itemId = normalizeItemId(group.data("itemid"));

            if (checkboxData[itemId]) {
                group.find("input[type='checkbox']").each(function () {
                    const checkbox = $(this);
                    const value = checkbox.val();

                    if (checkboxData[itemId][value]) {
                        checkbox.prop("checked", true);
                    }
                });
            }
        });

        // Manejar cambios en los checkboxes
        $(".checkbox-group input[type='checkbox']").on("change", function () {
            const checkbox = $(this);
            const group = checkbox.closest(".checkbox-group");
            const itemId = normalizeItemId(group.data("itemid"));
            const value = checkbox.val();

            if (!checkboxData[itemId]) {
                checkboxData[itemId] = {};
            }
            checkboxData[itemId][value] = checkbox.is(":checked");

            console.log("JSON actualizado:", checkboxData);

            updateIns2778Field()
        });
    }
});
