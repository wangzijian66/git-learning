
const API_URL = "http://localhost:3000/api/places";

// 初始化地图
const map = L.map("map").setView([30, 120], 3);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markers = [];

// 统一处理后端响应
async function requestAPI(url, options = {}) {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || `请求失败：${response.status}`);
    }

    return result;
}

// 加载所有地点
async function loadPlaces() {
    try {
        const result = await requestAPI(API_URL);
        showPlaces(result.data);
        console.log("地点加载成功：", result.data);
    } catch (error) {
        console.error("加载地点失败：", error);
        alert("加载地点失败：" + error.message);
    }
}

// 展示地图标记
function showPlaces(places) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    places.forEach(place => {
        const lat = Number(place.lat);
        const lng = Number(place.lng);

        if (
            place.lat == null ||
            place.lng == null ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 || lat > 90 ||
            lng < -180 || lng > 180
        ) {
            return;
        }

        const marker = L.marker([lat, lng]).addTo(map);

        // 使用 DOM 创建弹窗内容，避免把用户输入直接当成 HTML
        const content = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = place.name;

        const info = document.createElement("p");
        info.textContent = place.info || "暂无介绍";

        const editButton = document.createElement("button");
        editButton.textContent = "编辑";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "删除";
        deleteButton.style.marginLeft = "8px";

        content.append(title, info, editButton, deleteButton);

        marker.bindPopup(content);
        markers.push(marker);

        // 编辑地点
        editButton.addEventListener("click", async () => {
            const name = prompt("请输入地点名称：", place.name);

            if (name === null) return;

            if (!name.trim()) {
                alert("地点名称不能为空！");
                return;
            }

            const newInfo = prompt(
                "请输入地点介绍：",
                place.info || ""
            );

            if (newInfo === null) return;

            const latInput = prompt("请输入纬度：", String(lat));
            if (latInput === null) return;

            const lngInput = prompt("请输入经度：", String(lng));
            if (lngInput === null) return;

            const newLat = Number(latInput);
            const newLng = Number(lngInput);

            if (
                latInput.trim() === "" ||
                lngInput.trim() === "" ||
                !Number.isFinite(newLat) ||
                !Number.isFinite(newLng) ||
                newLat < -90 || newLat > 90 ||
                newLng < -180 || newLng > 180
            ) {
                alert("经纬度无效，请重新编辑！");
                return;
            }

            try {
                const result = await requestAPI(
                    `${API_URL}/${place.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: name.trim(),
                            lat: newLat,
                            lng: newLng,
                            info: newInfo.trim()
                        })
                    }
                );

                alert(result.message || "地点修改成功！");
                await loadPlaces();
            } catch (error) {
                console.error("编辑地点失败：", error);
                alert("编辑失败：" + error.message);
            }
        });

        // 删除地点
        deleteButton.addEventListener("click", async () => {
            const confirmed = confirm(
                `确定要删除地点「${place.name}」吗？此操作无法撤销。`
            );

            if (!confirmed) return;

            try {
                const result = await requestAPI(
                    `${API_URL}/${place.id}`,
                    { method: "DELETE" }
                );

                alert(result.message || "地点删除成功！");
                await loadPlaces();
            } catch (error) {
                console.error("删除地点失败：", error);
                alert("删除失败：" + error.message);
            }
        });
    });
}

// 启动
loadPlaces();
