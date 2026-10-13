
let map = L.map('map').setView([30, 120], 3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(map);

// 默认地点
let defaultPlaces = [];

// 读取默认地点
fetch("data/places.json")
    .then(res => res.json())
    .then(data => {
        defaultPlaces = data;
        loadPlaces();
    })
    .catch(error => {
        console.error("读取默认地点失败：", error);
        loadPlaces();
    });

// 加载全部地点
function loadPlaces() {
    let userPlaces = JSON.parse(
        localStorage.getItem("places")
    ) || [];

    let allPlaces = defaultPlaces.concat(userPlaces);
    showPlaces(allPlaces, userPlaces);
}

// 显示地图标记
function showPlaces(places, userPlaces) {
    places.forEach(place => {
        if (
            place.lat == null ||
            place.lng == null ||
            place.lat === "" ||
            place.lng === ""
        ) {
            console.log("无坐标：", place.name);
            return;
        }

        let marker = L.marker([
            Number(place.lat),
            Number(place.lng)
        ]).addTo(map);

        // 判断是不是用户添加的地点
        let isUserPlace = userPlaces.some(
            item => item === place
        );

        let buttons = "";

        if (isUserPlace) {
            buttons = `
                <br>
                <button onclick="editPlace(${place.id})">
                    编辑
                </button>
               <button onclick="deletePlace(${place.id})">
                    删除
                </button>
            `;
        }

        marker.bindPopup(`
            <h3>${escapeHTML(place.name)}</h3>
            <p>${escapeHTML(place.info || "")}</p>
            ${buttons}
        `);
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

// 编辑地点
function editPlace(id) {
    let places = JSON.parse(
        localStorage.getItem("places")
    ) || [];

    let index = places.findIndex(
    place => place.id === id
);


let place = places[index];

    if (!place) {
        alert("找不到这个地点，请刷新页面后重试");
        return;
    }

    let newName = prompt("修改城市名称：", place.name);

    if (newName === null) return;

    newName = newName.trim();

    if (!newName) {
        alert("城市名称不能为空");
        return;
    }

    let newInfo = prompt("修改旅行描述：", place.info || "");

    if (newInfo === null) return;

    places[index] = {
        ...place,
        name: newName,
        info: newInfo.trim()
    };

    localStorage.setItem("places", JSON.stringify(places));

    alert("修改成功！");
    location.reload();
}

// 删除地点
function deletePlace(id) {
    let places = JSON.parse(
        localStorage.getItem("places")
    ) || [];

    let index = places.findIndex(
    place => place.id === id
);


if(index === -1){
        alert("找不到这个地点，请刷新页面后重试");
        return;
    }

    if (!confirm(`确定删除「${places[index].name}」吗？`)) {
        return;
    }

    places.splice(index, 1);

    localStorage.setItem("places", JSON.stringify(places));

    alert("删除成功！");
    location.reload();
}