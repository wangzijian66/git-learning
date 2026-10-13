let map = L.map('map')
    .setView([30,120],3);



L.tileLayer(
'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
)
.addTo(map);



// 默认数据
let defaultPlaces = [];


// 读取json
fetch("data/places.json")

.then(res => res.json())

.then(data => {


    defaultPlaces = data;


    loadPlaces();


});





function loadPlaces(){


    let userPlaces =
    JSON.parse(
        localStorage.getItem("places")
    )
    ||
    [];



    let allPlaces =
    defaultPlaces.concat(userPlaces);



    showPlaces(allPlaces);


}




function showPlaces(places){


    places.forEach(place=>{


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



        let marker =
        L.marker(
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


}