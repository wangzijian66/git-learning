let map = L.map('map')
    .setView([30, 120], 3);



L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
)
.addTo(map);



// 默认地点数据
let defaultPlaces = [];



// 读取默认地点
fetch("data/places.json")

.then(res => res.json())

.then(data => {


    defaultPlaces = data;


    loadPlaces();


});





// 加载所有地点
function loadPlaces(){


    // 获取用户添加地点
    let userPlaces =
    JSON.parse(
        localStorage.getItem("places")
    )
    ||
    [];



    // 合并默认地点和用户地点
    let allPlaces =
    defaultPlaces.concat(userPlaces);



    showPlaces(allPlaces);


}





// 显示地点
function showPlaces(places){


    places.forEach(place=>{


        // 没有坐标不显示
        if(
            !place.lat ||
            !place.lng
        ){

            console.log(
                "无坐标:",
                place.name
            );

            return;

        }



        // 创建标记
        let marker =
        L.marker(
            [
                place.lat,
                place.lng
            ]
        )
        .addTo(map);



        // 判断是不是用户添加的地点
        let isUserPlace =
        isUserCreated(place);



        let deleteButton = "";



        if(isUserPlace){


            deleteButton = `

            <br>

            <button onclick="deletePlace('${place.name}')">

            删除

            </button>

            `;


        }




        // 弹窗
        marker.bindPopup(

        `

        <h3>${place.name}</h3>


        <p>${place.info || ""}</p>


        ${deleteButton}


        `

        );



    });


}





// 判断地点是否来自localStorage
function isUserCreated(place){


    let userPlaces =
    JSON.parse(
        localStorage.getItem("places")
    )
    ||
    [];



    return userPlaces.some(

        item =>

        item.name === place.name

    );


}







// 删除地点
function deletePlace(name){



    let places =
    JSON.parse(
        localStorage.getItem("places")
    )
    ||
    [];



    let newPlaces =

    places.filter(

        place =>

        place.name !== name

    );



    localStorage.setItem(

        "places",

        JSON.stringify(newPlaces)

    );



    alert("删除成功");



    location.reload();



}