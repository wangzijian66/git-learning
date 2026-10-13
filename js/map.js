// 创建地图
let map = L.map('map')
    .setView([30, 120], 3);


// 加载地图底图
L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// 从 json 文件读取旅行数据
fetch("data/places.json")

    .then(response => response.json())

    .then(places => {


        // 遍历所有旅行地点
        places.forEach(place => {


            // 创建标记点
            let marker = L.marker(
                [
                    place.lat,
                    place.lng
                ]
            )
            .addTo(map);



            // 点击标记显示信息
            marker.bindPopup(

                `
                <h3>${place.name}</h3>
                <p>${place.info}</p>
                `

            );


        });


    })

    // 错误处理
    .catch(error => {

        console.error(
            "旅行数据加载失败:",
            error
        );

    });