console.log("add.js 加载成功");
console.log("add.js 加载成功");

const API_URL = "http://localhost:3000/api/places";

async function savePlace() {
    // 下面保留你原来的函数内容
}

async function savePlace() {
    const name = document.getElementById("name").value.trim();
    const info = document.getElementById("info").value.trim();

    if (!name) {
        alert("请输入城市名称");
        return;
    }

    try {
        // 1. 查询城市经纬度
        const url = new URL(
            "https://nominatim.openstreetmap.org/search"
        );

        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("q", name);
        url.searchParams.set("limit", "1");

        const geoResponse = await fetch(url);

        if (!geoResponse.ok) {
            throw new Error("地理位置查询失败");
        }

        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            alert("没有找到该地点，请检查城市名称");
            return;
        }

        const place = {
            name: name,
            lat: Number(geoData[0].lat),
            lng: Number(geoData[0].lon),
            info: info
        };

        // 2. 将地点发送给后端，保存到 MySQL
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(place)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "保存地点失败");
        }

        // 3. 保存成功后返回地图
        alert("添加成功！");
        window.location.href = "index.html";

    } catch (error) {
        console.error("添加地点失败：", error);
        alert(error.message || "添加失败，请检查网络和后端服务");
    }
}

