document.addEventListener("DOMContentLoaded", function () {
    const devicesListContainer = document.getElementById("devices_list");

    const titleElement = document.createElement("h3");
    titleElement.innerText = "Dispositivos Conectados";
    titleElement.style.position = "sticky";
    titleElement.style.top = "0";
    titleElement.style.backgroundColor = "#fff";
    titleElement.style.padding = "10px";
    titleElement.style.zIndex = "10";
    titleElement.style.borderBottom = "2px solid #ccc";

    devicesListContainer.appendChild(titleElement);

    async function fetchDevices() {
        devicesListContainer.innerHTML = "";
        devicesListContainer.appendChild(titleElement);
        try {
            const response = await fetch("/adm/devices");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const devices = await response.json();
            renderDeviceList(devices);
        } catch (error) {
            console.error("Erro ao carregar dispositivos:", error);
            const errorMessage = document.createElement("p");
            errorMessage.textContent = "Não foi possível carregar os dispositivos. Tente novamente mais tarde.";
            errorMessage.style.color = "red";
            devicesListContainer.appendChild(errorMessage);
        }
    }

    function renderDeviceList(devices) {
        const listContainer = document.createElement("div");
        listContainer.style.maxHeight = "300px";
        listContainer.style.overflowY = "auto";
        listContainer.style.padding = "10px";

        devices.forEach(device => {
            const deviceItem = document.createElement("div");
            deviceItem.classList.add("device-item");
            deviceItem.style.display = "flex";
            deviceItem.style.justifyContent = "space-between";
            deviceItem.style.alignItems = "center";
            deviceItem.style.padding = "5px 0";
            deviceItem.style.borderBottom = "1px solid #ddd";

            const deviceInfo = document.createElement("div");
            deviceInfo.innerHTML = `
                <p><strong>IP:</strong> ${device.ip}</p>
                <p><strong>Grupo:</strong> ${device.group}</p>
                <p><strong>Local:</strong> ${device.locale}</p>
                <p><strong>Status:</strong> ${device.a_state}</p>
            `;

            const buttonsContainer = document.createElement("div");
            buttonsContainer.style.display = "flex";
            buttonsContainer.style.gap = "5px";

            const btnEdit = document.createElement("button");
            btnEdit.textContent = "Editar";
            btnEdit.onclick = () => editDevice(device);

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Excluir";
            btnDelete.onclick = () => deleteDevice(device.id);

            buttonsContainer.appendChild(btnEdit);
            buttonsContainer.appendChild(btnDelete);

            deviceItem.appendChild(deviceInfo);
            deviceItem.appendChild(buttonsContainer);

            listContainer.appendChild(deviceItem);
        });

        devicesListContainer.appendChild(listContainer);
    }

    async function editDevice(device) {
        const newIp = prompt("Novo IP:", device.ip);
        if (newIp === null) return;  // Cancelado

        const newLocale = prompt("Novo Local:", device.locale);
        if (newLocale === null) return;

        const newGroup = prompt("Novo Grupo:", device.group);
        if (newGroup === null) return;

        try {
            const response = await fetch(`/adm/device/${device.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ip: newIp,
                    locale: newLocale,
                    group: newGroup
                })
            });

            if (response.ok) {
                alert("Dispositivo atualizado com sucesso.");
                fetchDevices();
            } else {
                alert("Falha ao atualizar o dispositivo.");
            }
        } catch (error) {
            console.error("Erro ao comunicar com o servidor:", error);
            alert("Erro na comunicação com o servidor.");
        }
    }

    async function deleteDevice(deviceId) {
        if (!confirm("Tem certeza que deseja excluir este dispositivo?")) return;

        try {
            const response = await fetch(`/adm/device/${deviceId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert("Dispositivo excluído com sucesso.");
                fetchDevices();
            } else {
                alert("Falha ao excluir o dispositivo.");
            }
        } catch (error) {
            console.error("Erro ao comunicar com o servidor:", error);
            alert("Erro na comunicação com o servidor.");
        }
    }

    fetchDevices();
});
