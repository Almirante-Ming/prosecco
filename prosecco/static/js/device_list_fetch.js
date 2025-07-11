document.addEventListener("DOMContentLoaded", function () {
    const devicesListContainer = document.getElementById("devices_list");

    const titleElement = document.createElement("h3");
    titleElement.innerText = "Dispositivos Registrados";
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
            errorMessage.textContent = "Nao foi possivel carregar a lista de dispositivos. Verifique a conexao.";
            errorMessage.style.color = "red";
            devicesListContainer.appendChild(errorMessage);
        }
    }

    function renderDeviceList(devices) {
        const listContainer = document.createElement("div");
        listContainer.style.maxHeight = "300px";
        listContainer.style.overflowY = "auto";
        listContainer.style.overflowX = "hidden";
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
            `;

            const buttonsContainer = document.createElement("div");
            buttonsContainer.className = "buttons";

            const btnEdit = document.createElement("button");
            btnEdit.textContent = "Editar";
            btnEdit.className = "button is-info is-small";
            btnEdit.onclick = () => openEditModal(device);

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Excluir";
            btnDelete.className = "button is-danger is-small";
            btnDelete.onclick = () => deleteDevice(device.id);

            buttonsContainer.appendChild(btnEdit);
            buttonsContainer.appendChild(btnDelete);

            deviceItem.appendChild(deviceInfo);
            deviceItem.appendChild(buttonsContainer);

            listContainer.appendChild(deviceItem);
        });

        devicesListContainer.appendChild(listContainer);
    }

    function openEditModal(device) {
        document.getElementById("editDeviceId").value = device.id;
        document.getElementById("editDeviceIp").value = device.ip;
        document.getElementById("editDeviceGroup").value = device.group;
        document.getElementById("editDeviceLocale").value = device.locale;
        document.getElementById("editDeviceModal").classList.add("is-active");
    }

    document.getElementById("closeEditModal").onclick =
    document.getElementById("cancelEditDeviceBtn").onclick = () => {
        document.getElementById("editDeviceModal").classList.remove("is-active");
    };

    document.getElementById("saveEditDeviceBtn").onclick = async () => {
        const deviceId = document.getElementById("editDeviceId").value;
        const newIp = document.getElementById("editDeviceIp").value;
        const newGroup = document.getElementById("editDeviceGroup").value;
        const newLocale = document.getElementById("editDeviceLocale").value;

        try {
            const response = await fetch(`/adm/device/${deviceId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ip: newIp, group: newGroup, locale: newLocale })
            });

            if (response.ok) {
                alert("Dispositivo de exibicao atualizado com sucesso.");
                document.getElementById("editDeviceModal").classList.remove("is-active");
                fetchDevices();
            } else {
                alert("Falha ao atualizar configuracao do dispositivo.");
            }
        } catch (error) {
            console.error("Erro ao comunicar com o servidor:", error);
            alert("Falha na conexao com o servidor de gerenciamento.");
        }
    };

    async function deleteDevice(deviceId) {
        if (!confirm("Tem certeza que deseja excluir este dispositivo?")) return;

        try {
            const response = await fetch(`/adm/device/${deviceId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert("Dispositivo de exibicao excluido com sucesso.");
                fetchDevices();
            } else {
                alert("Falha ao remover dispositivo do sistema.");
            }
        } catch (error) {
            console.error("Erro ao comunicar com o servidor:", error);
            alert("Falha na conexao com o servidor de gerenciamento.");
        }
    }

    fetchDevices();
});
