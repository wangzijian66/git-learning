// 创建地图
let map = L.map('map')
    .setView([30, 120], 3);


// 添加地图底图
L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
).addTo(map);



// 我的旅行地点

let places = [

    {
        name: "大连",
        lat: 38.914,
        lng: 121.6147,
        info: "我的家乡"
    },


    {
        name: "上海",
        lat: 31.2304,
        lng: 121.4737,
        info: "上海旅行记录"
    },


    {
        name: "东京",
        lat: 35.6762,
        lng: 139.6503,
        info: "日本旅行"
    }

];



// 添加标记

places.forEach(place => {


    let marker = L.marker(
        [
            place.lat,
            place.lng
        ]
    )
    .addTo(map);



    marker.bindPopup(

        `
        <h3>${place.name}</h3>
        <p>${place.info}</p>
        `

    );


});