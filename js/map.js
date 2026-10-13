
const API_URL = "http://localhost:3000/api/places";

let map = L.map("map").setView([30, 120], 3);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 保存当前地图上的标记，方便后续刷新
let markers = [];

// 从后端 API 加载地点
async function loadPlaces() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP 错误：${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error("后端返回的数据格式不正确");
        }

        showPlaces(result.data);
        console.log("地点加载成功：", result.data);
    } catch (error) {
        console.error("加载地点失败：", error);
        alert("加载旅行地点失败，请确认后端服务正在运行。");
    }
}

// 显示地图标记
function showPlaces(places) {
    // 清除旧标记，避免重复显示
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    places.forEach(place => {
        if (
            place.lat == null ||
            place.lng == null ||
            place.lat === "" ||
            place.lng === "" ||
            !Number.isFinite(Number(place.lat)) ||
            !Number.isFinite(Number(place.lng))
        ) {
            console.log("地点坐标无效：", place.name);
            return;
        }

        const marker = L.marker([
            Number(place.lat),
            Number(place.lng)
        ]).addTo(map);

        marker.bindPopup(`
            <h3>${escapeHTML(place.name)}</h3>
            <p>${escapeHTML(place.info || "")}</p>
        `);

        markers.push(marker);
    });
}

// 防止地点文字被当作 HTML 解析
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// 页面加载后获取地点
loadPlaces();